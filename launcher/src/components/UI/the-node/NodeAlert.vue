<template>
  <div class="status-box">
    <div class="status-box_header">
      <div class="icon-line">
        <div class="status-icon" :class="{ active: perfect }">
          <img src="/img/icon/control/NOTIFICATION_GRUN.png" alt="green" />
        </div>
        <div class="status-icon" :class="{ active: warning || pointStatus.length !== 0 }">
          <img src="/img/icon/control/WARNSCHILD_GELB.png" alt="green" />
        </div>
        <div class="status-icon" :class="{ active: alarm }">
          <img src="/img/icon/control/WARNSCHILD_ROT.png" alt="green" />
        </div>
        <div
          class="status-icon"
          :class="{ active: stereumUpdate.current !== stereumUpdate.version || updatedNewUpdates.length > 0 }"
        >
          <img src="/img/icon/control/SETTINGS.png" alt="green" />
        </div>
      </div>
    </div>
    <div class="status-box_messages">
      <div v-if="storageWarning" class="status-message_yellow">
        <div class="message-icon">
          <img src="/img/icon/control/WARNSCHILD_GELB_storage.png" alt="warn_storage" />
        </div>
        <div class="message-text_container">
          <div class="main-message">
            <span>{{ $t("nodeAlert.lowSpace") }}</span>
          </div>
          <div class="val-message">{{ availDisk }} GB Free</div>
        </div>
      </div>
      <div v-if="cpuWarning" class="status-message_yellow">
        <div class="message-icon">
          <img src="/img/icon/control/WARNSCHILD_GELB_cpu.png" alt="warn_storage" />
        </div>
        <div class="message-text_container">
          <div class="main-message">
            <span>CPU {{ $t("nodeAlert.use") }}</span>
          </div>
          <div class="val-message">
            <span> > {{ cpu }}%</span>
          </div>
        </div>
      </div>
      <div v-for="point in pointStatus" :key="point" class="status-message_yellow">
        <div class="message-icon">
          <img src="/img/icon/control/PORT_LIST_ICON.png" alt="warn_storage" />
        </div>
        <div class="message-text_container">
          <div class="main-message">
            <span>{{ point }}</span>
          </div>
          <div class="val-message">
            <span> > STATUS: OPEN</span>
          </div>
        </div>
      </div>
      <div v-if="cpuAlarm" class="status-message_red">
        <div class="message-icon">
          <img src="/img/icon/control/red_warning_cpu.png" alt="warn_storage" />
        </div>
        <div class="message-text_container">
          <div class="main-message">
            <span>CPU {{ $t("nodeAlert.use") }}</span>
          </div>
          <div class="val-message">
            <span> > {{ cpu }}%</span>
          </div>
        </div>
      </div>
      <div v-if="missedAttest" class="status-message_red">
        <div class="message-icon">
          <img src="/img/icon/control/key-rot.png" alt="warn_storage" />
        </div>
        <div class="message-text_container">
          <div class="main-message">
            <span>{{ $t("nodeAlert.missAttest") }}</span>
          </div>
        </div>
      </div>

      <div
        v-for="validator in notSetAddresses"
        :key="validator"
        class="status-message_red pointer"
        @mouseenter="cursorLocation = `${clkFee}`"
        @mouseleave="cursorLocation = ''"
        @click="expertHandler(validator.serviceID)"
      >
        <div class="message-icon">
          <img :src="validator.icon" />
        </div>
        <div class="message-text_container">
          <div class="main-message">
            <span>{{ $t("nodeAlert.noFee") }}</span>
          </div>
          <div class="val-message">
            <span> > {{ validator.name }} vc</span>
          </div>
        </div>
        <the-expert
          v-if="validator.expertOptionsModal"
          :item="validator"
          position="18.8%"
          wide="39%"
          @hide-modal="hideExpertMode(validator)"
        ></the-expert>
      </div>

      <div
        v-if="stereumUpdate.current !== stereumUpdate.version"
        class="status-message_green"
        @mouseenter="cursorLocation = `${clkUpdate}`"
        @mouseleave="cursorLocation = ''"
        @click="showUpdate"
      >
        <div class="message-icon">
          <img src="/img/icon/control/logo-icon.png" alt="warn_storage" />
        </div>
        <div class="message-text_container">
          <div class="main-message">
            <span>{{ $t("nodeAlert.stereumUpt") }}</span>
          </div>
          <div class="val-message">
            <span>{{ stereumUpdate.version }}</span>
          </div>
        </div>
      </div>
      <div
        v-for="item in updatedNewUpdates"
        :key="item"
        class="status-message_green"
        @mouseenter="cursorLocation = `${clkUpdate}`"
        @mouseleave="cursorLocation = ''"
        @click="showUpdate"
      >
        <div class="message-icon">
          <img :src="iconFilter(item)" alt="warn_storage" />
        </div>
        <div class="message-text_container update-items">
          <div class="main-message">
            <span>UPDATE available</span>
          </div>
          <div class="val-message">
            <span>{{ item.version }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ControlService from "@/store/ControlService";
import { useControlStore } from "@/store/theControl";
import { mapWritableState } from "pinia";
import { useNodeHeader } from "@/store/nodeHeader";
import { useServices } from "@/store/services";
import { useFooter } from "@/store/theFooter";
import TheExpert from "./TheExpert.vue";
export default {
  components: {
    TheExpert,
  },
  data() {
    return {
      storageWarning: false,
      cpuWarning: false,
      cpuAlarm: false,
      perfect: false,
      warning: false,
      alarm: false,
      missedAttest: false,
      notification: false,
      setFeeReciepent: [],
      setFeeAlarm: false,
      notSetAddresses: [],
      clkFee: this.$t("nodeAlert.clkFee"),
      clkUpdate: this.$t("nodeAlert.clkUpdate"),
    };
  },
  computed: {
    ...mapWritableState(useControlStore, {
      availDisk: "availDisk",
      usedPerc: "usedPerc",
      cpu: "cpu",
    }),
    ...mapWritableState(useNodeHeader, {
      forceUpdateCheck: "forceUpdateCheck",
      stereumUpdate: "stereumUpdate",
      updating: "updating",
      rpcState: "rpcState",
      dataState: "dataState",
      wsState: "wsState",
      displayUpdatePanel: "displayUpdatePanel",
    }),
    ...mapWritableState(useServices, {
      installedServices: "installedServices",
      newUpdates: "newUpdates",
    }),
    ...mapWritableState(useFooter, {
      cursorLocation: "cursorLocation",
    }),

    usedPercInt() {
      return parseInt(this.usedPerc);
    },
    pointStatus() {
      let port = [];

      if (this.rpcState) {
        port.push("RPC Point");
      }

      if (this.dataState) {
        port.push("Data API");
      }

      if (this.wsState) {
        port.push("WS Point");
      }
      return port;
    },
    updatedNewUpdates() {
      const updatedUpdates = this.newUpdates.map((update) => {
        const matchingService = this.installedServices.find((service) => service.name === update.name);
        if (matchingService) {
          return {
            ...update,
            sIcon: matchingService.sIcon,
          };
        }
        return update;
      });

      return updatedUpdates;
    },
  },
  watch: {
    usedPercInt() {
      if (this.usedPercInt > 80) {
        this.storageCheck();
      }
    },
    cpu(newVal) {
      if (newVal >= 80 && newVal < 90) {
        this.cpuWarning = true;
        this.cpuAlarm = false;
        this.perfect = false;
        this.warning = true;
        this.alarm = false;
      } else if (newVal >= 90) {
        this.cpuWarning = false;
        this.cpuAlarm = true;
        this.perfect = false;
        this.warning = false;
        this.alarm = true;
      } else if (newVal < 80) {
        this.cpuWarning = false;
        this.cpuAlarm = false;
        this.perfect = true;
        this.warning = false;
        this.alarm = false;
      }
    },
  },
  mounted() {
    this.readService();
    this.polling = setInterval(() => {
      this.readService();
    }, 10000);
  },
  beforeUnmount() {
    clearInterval(this.polling);
  },
  created() {
    this.storageCheck();
    this.cpuMeth();
  },
  methods: {
    iconFilter(arg) {
      if (arg.name === "PrometheusNodeExporter") {
        return "/img/icon/plugin-icons/Other/PrometheusNodeExporter-s.png";
      } else if (arg.name === "Notification") {
        return "/img/icon/plugin-icons/Other/NotifierService-s.png";
      } else {
        return arg.sIcon;
      }
    },
    expertHandler(el) {
      let selectedObject = this.installedServices.find((obj) => obj.config.serviceID === el);
      selectedObject.expertOptionsModal = true;
      return selectedObject;
    },
    hideExpertMode(el) {
      el.expertOptionsModal = false;
    },
    async readService() {
      const validators = this.installedServices.filter((i) => i.category === "validator");

      if (validators && validators.length > 0 && validators[0].config) {
        const addresses = [];

        for (const validator of validators) {
          if (validator.name === "ssv.network" || validator.name === "Obol Charon") {
            continue;
          }
          if (!validator.yaml) validator.yaml = await ControlService.getServiceYAML(validator.config.serviceID);
          const patternIndex = validator.expertOptions.findIndex((o) => o.title === "Default Fee Recipient");
          if (patternIndex === -1) {
            continue;
          }
          const pattern = validator.expertOptions[patternIndex].pattern;
          const match = [...validator.yaml.match(new RegExp(pattern))][2];
          if (match) {
            const address = match;
            addresses.push({
              name: validator.name,
              address: address,
              icon: validator.sIcon,
              serviceID: validator.config.serviceID,
            });
          } else {
            console.error(
              "Could not find default-fee-recipient address in the service YAML for validator:",
              validator.name
            );
          }
        }
        const notSetAddresses = addresses.filter(
          (validator) => validator.address === "0x0000000000000000000000000000000000000000"
        );
        this.notSetAddresses = notSetAddresses;
      }
    },

    iconShow() {
      this.closeNotif = true;
    },
    iconHide() {
      this.closeNotif = false;
    },
    showUpdate() {
      this.displayUpdatePanel = true;
    },
    removeUpdateModal() {
      this.displayUpdatePanel = false;
    },

    storageCheck() {
      if (this.usedPercInt > 80) {
        this.storageWarning = true;
        this.warning = true;
        this.perfect = false;
      } else {
        this.storageWarning = false;
        this.warning = false;
        this.perfect = true;
      }
    },
    cpuMeth() {
      if (this.cpu >= 80 && this.cpu < 90) {
        this.cpuWarning = true;
        this.cpuAlarm = false;
        this.perfect = false;
        this.warning = true;
        this.alarm = false;
      } else if (this.cpu >= 90) {
        this.cpuWarning = false;
        this.cpuAlarm = true;
        this.perfect = false;
        this.warning = false;
        this.alarm = true;
      } else if (this.cpu < 80) {
        this.cpuWarning = false;
        this.cpuAlarm = false;
        this.perfect = true;
        this.warning = false;
        this.alarm = false;
      }
    },
  },
};
</script>

<style scoped>
.update-items {
  height: 90% !important;
  justify-content: center !important;
}
.pointer {
  cursor: pointer;
}
.no-fee-message {
  font-size: 60%;
  display: flex;
  color: #fff;
  font-weight: 500;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.v-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.v-leave-active {
  transition: all 0.1s ease-in;
}

.v-leave-to {
  opacity: 0;
  transform: translateY(80%);
}

.close {
  position: absolute;
  left: 88%;
  top: 5%;
  width: 8%;
  cursor: pointer;
}

.updatePanel-show {
  right: 0 !important;
}

.status-box {
  width: 100%;
  height: 92%;
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: space-between;
  align-items: flex-start;
  padding: 5% 5%;
}

.status-box_header {
  width: 80%;
  height: 8%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #23272a;
  border: 1px solid #4c4848;
  border-radius: 5px;
  box-shadow: 0 1px 3px 1px #1c1f22;
}

.status-box_messages {
  width: 100%;
  height: 90%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  background: #23272a;
  border: 1px solid #4c4848;
  padding-top: 5px;
  border-radius: 5px;
  box-shadow: 0 1px 3px 1px #1c1f22;
  overflow: hidden;
  overflow-y: scroll;
}
.status-box_messages::-webkit-scrollbar {
  width: 4px;
}

/* Track */
.status-box_messages::-webkit-scrollbar-track {
  background: #3b4146;
  box-sizing: border-box;
  border-radius: 50%;
}

/* Handle */
.status-box_messages::-webkit-scrollbar-thumb {
  background: #324b3f;
  border-radius: 50%;
}

.icon-line {
  display: flex;
  justify-content: flex-start;
  padding-top: 4px;
  width: 100%;
  height: 30px;
}

.status-icon {
  width: 26px;
  height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 25%;
}
.active {
  opacity: 100%;
}

.status-icon img {
  width: 90%;
  height: 90%;
}

.status-message_yellow,
.status-message_red,
.status-message_green {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 95%;
  height: 9%;
  border: 1px solid #707070;
  border-radius: 5px;
  margin: 2px 0;
  color: #eee;
  position: relative;
}

.status-message_yellow {
  background: #ffd924;
}

.status-message_red {
  background: #be3635;
}

.status-message_red .message-text_container {
  color: #eee;
}

.status-message_green {
  background: #5f7e6a;
  cursor: pointer;
}
.status-message_green .message-text_container {
  color: #eee;

  height: 100%;
}

.message-icon {
  width: 24%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-icon img {
  width: 88%;
  height: 99%;
}

.message-text_container {
  width: 70%;
  height: 75%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: column;
  color: #23272a;
}

.main-message {
  display: flex;
  width: 95%;
  height: 55%;
  justify-content: flex-start;
  align-items: center;
  font-size: 50%;
  font-weight: 700;
  text-transform: uppercase;
}
.main-message-rpc {
  display: flex;
  width: 95%;
  height: 100%;
  justify-content: flex-start;
  align-items: center;
  font-size: 80%;
  font-weight: 800;
  text-transform: uppercase;
}

.val-message {
  display: flex;
  width: 95%;
  height: 35%;
  justify-content: flex-start;
  align-items: center;
  font-size: 50%;
  font-weight: 700;
  text-transform: uppercase;
}
</style>
