<template>
  <div class="config-node">
    <div class="server">
      <div class="serverBox">
        <div class="details">
          <span class="ipTitle">{{ $t("journalnode.serverip") }}</span>
          <span class="nameTitle">{{ $t("journalnode.servername") }}</span>
          <span class="ip">{{ ipAddress }}</span>
          <span ref="serverName" :class="{ animateServerName: checkServerNameWidth }" class="name">{{
            ServerName
          }}</span>
        </div>
      </div>
    </div>
    <div class="config-bg">
      <div class="config-btns">
        <div class="edit-btn">
          <router-link to="/node">
            <span>{{ $t("modifyPanel.backNode") }}</span>
            <img src="../../../../public/img/icon/manage-node-icons/undo1.png" alt="icon" />
          </router-link>
        </div>
      </div>
      <div class="delete-box">
        <div class="delete-btn" @click.stop="openRemoveModal">
          <span class="btn-text">{{ $t("modifyPanel.nukeNode") }}</span>
          <img src="../../../../public/img/icon/manage-node-icons/nuke.png" alt="icon" />
        </div>
      </div>
      <RemoveModal
        v-if="removeServicesModal"
        ref="removeServicesModalComponent"
        @close-me="closeRemoveModal"
        @remove-items="removeConfirmation"
        @back-to-login="backToLogin"
      />
    </div>
  </div>
</template>
<script>
import { mapWritableState, mapState } from "pinia";
import { useNodeHeader } from "@/store/nodeHeader";
import ControlService from "@/store/ControlService";
import { useServices } from "@/store/services";
import { useNodeManage } from "../../../store/nodeManage";
import { useControlStore } from "../../../store/theControl";
import { useStakingStore } from "../../../store/theStaking";
import RemoveModal from "./RemoveModal.vue";
export default {
  components: { RemoveModal },
  data() {
    return {
      modalActive: false,
      removeServicesModal: false,
      removeIsConfirmed: false,
      notSure: true,
      serverNameWidth: null,
      nameParentWidth: null,
    };
  },
  computed: {
    ...mapWritableState(useNodeHeader, {
      headerServices: "runningServices",
      refresh: "refresh",
    }),
    ...mapWritableState(useServices, {
      installedServices: "installedServices",
      runningServices: "runningServices",
      versions: "versions",
    }),
    ...mapWritableState(useNodeManage, {
      newConfiguration: "newConfiguration",
    }),
    ...mapState(useControlStore, {
      ServerName: "ServerName",
      ipAddress: "ipAddress",
    }),
    ...mapWritableState(useStakingStore, {
      keys: "keys",
      forceRefresh: "forceRefresh",
    }),
    checkServerNameWidth() {
      if (this.serverNameWidth > this.nameParentWidth) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    this.serverNameWidth = this.$refs.serverName.clientWidth;
    this.nameParentWidth = this.$refs.serverName.parentElement.clientWidth;
  },
  methods: {
    openModal() {
      this.modalActive = true;
    },
    closeModal() {
      this.modalActive = false;
    },
    openRemoveModal() {
      this.removeServicesModal = true;
    },
    closeRemoveModal() {
      this.removeServicesModal = false;
    },
    removeConfirmation() {
      this.refresh = false; //stop refreshing
      this.removeIsConfirmed = true;
      this.destroyNode();
      this.notSure = false;
    },
    removeAllPlugins() {
      if (this.removeIsConfirmed) {
        this.forceRefresh = true;
        this.keys = [];
        this.versions = {};
        this.headerServices = [];
        this.runningServices = [];
        this.installedServices = [];
        this.newConfiguration = [];
      }
      this.removeIsConfirmed = false;
    },
    destroyNode: async function () {
      let condition = true;
      await ControlService.clearTasks();
      ControlService.destroy(); // no await, we wanna read tasks while deletion is in progress
      var uxtStart = Math.floor(Date.now() / 1000);
      var secMax = 30; // wait max X seconds to finish destroy process
      while (condition) {
        var secElapsed = Math.floor(Math.floor(Date.now() / 1000) - uxtStart);
        if (secElapsed >= secMax) {
          console.log("abort -> timeout -> secElapsed", secElapsed);
          await ControlService.clearTasks();
          break;
        }
        var tasks = await ControlService.getTasks();
        var task = tasks.findLast((t) => t.name.includes("Delete Node"));
        var subtasks = task && task.hasOwnProperty("subTasks") ? task.subTasks : null;
        var status = task && task.hasOwnProperty("status") ? task.status : null;
        // console.log("tasks => ", tasks);
        // console.log("task => ", task);
        // console.log("subtasks => ", subtasks);
        // console.log("status => ", status);
        var myresult = [];
        myresult.push("nuke node executed (ok)");
        if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
          myresult.push("gathering facts (ok)");
          for (var i = 0; i < subtasks.length; i++) {
            var subtask = subtasks[i];
            myresult.push(subtask.name + " (" + subtask.status + ")");
          }
        } else {
          if (secElapsed >= 2) {
            myresult.push("gathering facts (ok)");
          }
          // console.log("waiting for subtasks");
        }
        this.$refs.removeServicesModalComponent.nukeData = myresult;
        // Intentionally as last check since last subtask could be retrieved at exact same frame
        if (status != null) {
          status = status === "success" ? "ok" : status;
          myresult.push("node nuked (" + status + ")");
          this.$refs.removeServicesModalComponent.nukeData = myresult;
          await ControlService.clearTasks();
          condition = false;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100)); // sleep 100ms between attempts
      }
      this.refresh = true;
      this.removeAllPlugins();
      this.$refs.removeServicesModalComponent.loginBtn = false;
    },
    logout: async function () {
      await ControlService.logout();
      this.$router.push("/");
    },
    backToLogin() {
      this.logout();
    },
  },
};
</script>
<style scoped>
.config-node {
  grid-column: 1;
  width: 100%;
  height: 100%;
  padding: 5px;
  margin-top: 1px;
  display: grid;
  background: #33393e;
  border-right: 2px solid #242529b4;
  grid-template-rows: repeat(9, 1fr);
  grid-template-columns: 1fr;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  transition-duration: 500ms;
}
.config-bg {
  grid-column: 1;
  grid-row: 3/10;
  width: 95%;
  height: 96%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(9, 1fr);
  background-color: #606060;
  border-radius: 10px;
  margin: 0 auto;
  box-shadow: 1px 1px 3px 1px #282727;
  border: 1px solid #4c4848;
}
.server {
  grid-column: 1;
  grid-row: 1/3;
  width: 100%;
  height: 100%;
  padding: 20px 5px 10px 5px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.serverBox {
  width: 100%;
  height: 95%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #23272a;
  border-radius: 10px;
  box-shadow: 0 1px 3px 1px #282727;
  border: 1px solid #747475;
  overflow: hidden;
  white-space: nowrap;
}
.server .details {
  width: 95%;
  height: 85%;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 25% 75%;
  grid-template-rows: repeat(6, 1fr);
}

.server .ipTitle {
  grid-column: 1/2;
  grid-row: 1/4;
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  color: #c4c4c4;
  text-transform: uppercase;
  border-radius: 5px;
  padding: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  align-self: flex-end;
  text-align: left;
}

.server .nameTitle {
  grid-column: 1/2;
  grid-row: 4/7;
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 500;
  color: #c4c4c4;
  text-transform: uppercase;
  border-radius: 5px;
  padding: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  align-self: flex-end;
  text-align: left;
}

.server .name {
  grid-column: 2/3;
  grid-row: 4/7;
  width: fit-content;
  max-width: 125px;
  height: 100%;
  text-align: center !important;
  font-size: 0.7rem;
  font-weight: 700;
  color: #dfbb06;
  text-transform: uppercase;
  border-radius: 5px;
  padding: 4px;
  padding-top: 6px;
  white-space: nowrap;
  display: inline-flex;
  overflow: visible !important;
  justify-self: center;
}

.animateServerName {
  animation: backAndForth 5s infinite;
}
@keyframes backAndForth {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(0);
  }
  45% {
    transform: translateX(-50%);
  }
  55% {
    transform: translateX(-50%);
  }
  90% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(0);
  }
}
.server .ip {
  grid-column: 2/3;
  grid-row: 1/4;
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #dfbb06;
  text-transform: uppercase;
  border-radius: 5px;
  padding: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  align-self: center;
}
.config-box .config-title {
  grid-column: 2/7;
  grid-row: 1;
  margin-left: 20px;
}
.config-title span {
  font-size: 8px;
  font-weight: bold;
  background-color: #334b3f;
  border: 1px solid rgb(169, 168, 168);
  padding: 4px 5px;
  border-radius: 8px;
  box-shadow: 1px 1px 5px 2px rgb(69, 68, 68);
}

.config-btns {
  grid-column: 1/6;
  grid-row: 1/5;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.edit-btn a:hover {
  background-color: #18191c;
}
.edit-btn a:active {
  box-shadow: none;
  transform: scale(0.99);
}
.edit-btn {
  width: 95%;
  height: 23.5%;
  margin-top: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}
.edit-btn a {
  width: 100%;
  height: 100%;
  background-color: #242529;
  font-size: 0.6rem;
  font-weight: 800;
  color: rgb(194, 194, 194);
  border: 1px solid #787878;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 1px 3px 1px #2c2c2c;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
}
.edit-btn span {
  color: #408886;
  font-size: 0.7rem;
  font-weight: 800;
  text-align: center;
  margin-left: 10px;
  text-transform: uppercase;
}
.edit-btn img {
  width: 18px;
  height: 18px;
  background-color: transparent;
  margin-right: 10px;
  pointer-events: none;
}
.delete-box {
  grid-column: 1/6;
  grid-row: 8/9;
  width: 95%;
  height: 100%;
  margin-top: 3%;
  display: flex;
  justify-content: center;
  align-items: center;
  justify-self: center;
}
.delete-box .delete-btn {
  width: 100%;
  height: 100%;
  border: 1px solid #828282;
  border-radius: 8px;
  box-shadow: 0 1px 4px #373737;
  background-color: #242529;
  cursor: pointer;
  outline-style: none;
  color: #c52e2e;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-text {
  margin-left: 20px;
}
.router-box .btn-text {
  text-decoration: none;
  color: #4eb051;
}
.delete-box .delete-btn:hover {
  background-color: #2c2c2c;
  transform: scale(1.02);
}
.delete-box .delete-btn:active {
  transform: scale(1);
  border: 1px solid #f46969;
  color: #ff1f1f;
  box-shadow: none;
}
.delete-btn img {
  width: 24px;
  height: 24px;
  margin-right: 5px;
  pointer-events: none;
}
.btn-icon {
  width: 21px;
  height: 21px;
  border-radius: 5px;
  margin-right: 5px;
}
.btn-icon img {
  width: 21px;
  height: 21px;
  pointer-events: none;
}

.config-row {
  grid-column: 1/7;
  grid-row: 2;
  width: 95%;
  height: 30px;
  border: 2px solid rgb(155, 212, 236);
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px;
  margin: 0 auto;
}

.config-row .row-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 25px;
}
.config-row .row-content span {
  width: 80%;
  font-size: 0.7rem;
  font-weight: 700;
}
.testnet-icon {
  width: 20%;
  min-width: 23px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.testnet-icon img {
  width: 23px;
  height: 23px;
  pointer-events: none;
}

.title-box {
  width: 80%;
  height: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.title-box img {
  width: 70px;
  height: 70px;
  margin-top: 10px;
  pointer-events: none;
}

::-webkit-scrollbar {
  width: 1px;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(160, 160, 160);
  border-radius: 50px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
  margin: 10px;
}
</style>
