<template>
  <div class="addParent">
    <div class="addBox">
      <div v-if="items.category !== 'service'" class="replaceService" @click="$emit('changePlugin', items)">
        <img src="/img/icon/manage-node-icons/replace.png" alt="icon" />
      </div>

      <div class="service">
        <img :src="plugin.icon" alt="icon" data-tooltip="OFAC Compliant - censored" />
        <div class="service-details">
          <span class="serviceName">{{ plugin.name }}</span>
          <p class="category">
            {{ plugin.category }}
            <span v-if="plugin.category !== 'service'">Client</span>
          </p>
        </div>
      </div>

      <div class="configBox">
        <div v-if="plugin.service === 'FlashbotsMevBoostService'" class="relaysBox">
          <div class="relaysBoxTitle">
            {{ $t("mevboostConfig.availRelays") }}
          </div>
          <div class="relaysBoxContent">
            <div v-for="relay in combinedBlocs" :key="relay.id" class="relay">
              <input :id="relay.id" v-model="checkedRelays" type="checkbox" :value="relay" />
              <label :for="relay.id">{{ relay.name }}</label>
              <div v-if="relay.freeCensorship == false" class="iconBox" data-tooltip="OFAC Compliant - censored">
                <img src="/img/icon/header-icons/usa1.png" alt="flag-icon" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="replaceServiceActive && plugin.service !== 'FlashbotsMevBoostService'" class="change-installation">
          <div class="change-title">
            <span>{{ $t("addModifyPanel.installPath") }}</span>
          </div>
          <div class="change-box">
            <input v-model="installationPath" type="text" maxlength="255" />
          </div>
        </div>
        <div
          v-if="(plugin.category === 'execution' || plugin.category === 'consensus') && replaceServiceActive"
          class="fast-sync"
        >
          <div class="sync-header">
            <div class="headerTitle">
              <span>SYNC</span>
            </div>
            <div class="headerContent">
              <img src="/img/icon/arrows/left-arrow.png" alt="icon" @click="changeTheOption" />
              <span v-if="genesisIsActive">GENESIS</span>
              <span v-if="checkPointIsActive">CHECKPOINT</span>
              <img src="/img/icon/arrows/right-arrow.png" alt="icon" @click="changeTheOption" />
            </div>
          </div>
          <div class="content">
            <span v-if="genesisIsActive">{{ $t("addModifyPanel.syncMessage") }}</span>
            <div v-if="checkPointIsActive" class="inputBox">
              <input v-model="checkPointSync" type="text" />
            </div>
          </div>
        </div>
        <div v-if="!noPortServices.includes(plugin.service)" class="portAddBox">
          <img src="/img/icon/manage-node-icons/port.png" alt="icon" />
          <div class="portConfig">
            <span>{{ $t("addModifyPanel.portused") }}</span>
            <input v-model="port" type="text" placeholder="9000" />
          </div>
        </div>
        <template v-for="service in options">
          <div
            v-if="!switchHandler(service) && service.service !== 'FlashbotsMevBoostService'"
            :key="service.id"
            class="optionsBox"
            :serviceId-tooltip="service.config.serviceID ? service.config.serviceID : service.id"
            @click="changeSelectedServiceToConnect(service)"
          >
            <img src="/img/icon/manage-node-icons/not-connected.png" alt="icon" />
            <div class="optionsDetails">
              <span class="category">{{ service.category }} Client</span>
              <div class="optionsName">
                <span class="notSelected">{{ service.name }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="switchHandler(service) && service.service !== 'FlashbotsMevBoostService'"
            :key="service.id"
            class="optionsBox"
            :serviceId-tooltip="service.config.serviceID ? service.config.serviceID : service.id"
            @click="changeSelectedServiceToConnect(service)"
          >
            <img src="/img/icon/manage-node-icons/connect.png" alt="icon" />
            <div class="optionsDetails">
              <span class="category">{{ service.category }} Client</span>
              <div class="optionsName">
                <span class="selected">{{ service.name }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="btnBox">
        <div class="cancelBtn" @click="$emit('cancelModify')">
          <span>{{ $t("addModifyPanel.cancel") }}</span>
        </div>
        <div class="addBtn" @click="saveModify">
          <span>{{ $t("addModifyPanel.save") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapWritableState } from "pinia";
import { useServices } from "@/store/services";
import { useNodeManage } from "../../../store/nodeManage";
import { toRaw } from "vue";
import ControlService from "@/store/ControlService";

export default {
  props: {
    items: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      modalActive: false,
      removeServicesModal: false,
      removeIsConfirmed: false,
      genesisIsActive: true,
      checkPointIsActive: false,
      replaceServiceActive: false,
      serviceIsSelected: false,
      installationPath: "",
      checkPointSync: "",
      plugin: {},
      port: "",
      selected: {},
      options: [],
      checkedRelays: [],
      availableBlocks: [],
      noPortServices: [
        "FlashbotsMevBoostService",
        "PrometheusNodeExporterService",
        "NotificationService",
        "Web3SignerService",
        "ValidatorEjectorService",
      ],
    };
  },
  computed: {
    ...mapState(useServices, {
      installedServices: "installedServices",
    }),
    ...mapWritableState(useNodeManage, {
      actionContents: "actionContents",
      newConfiguration: "newConfiguration",
      relaysList: "relaysList",
      configNetwork: "configNetwork",
    }),
    combinedBlocs() {
      let names = new Set();
      let combined = this.checkedRelays.concat(this.availableBlocks);
      return combined.filter((item) => {
        if (!names.has(item.name)) {
          names.add(item.name);
          return true;
        }
        return false;
      });
    },
  },
  watch: {
    items: {
      handler: function (val) {
        this.plugin = val;
        this.optionsToConnect();
      },
      immediate: true,
    },
  },
  mounted() {
    this.availableBlocks = this.shuffleRelaysList(
      this.relaysList.filter((r) => r[this.configNetwork?.network?.toLowerCase()])
    );
    if (this.items.service === "FlashbotsMevBoostService") {
      ControlService.getServiceConfig(this.items.config.serviceID).then((service) => {
        let relayURLs = service.entrypoint[service.entrypoint.findIndex((e) => e === "-relays") + 1].split(",");
        relayURLs.forEach((relay) => {
          let relayData = this.relaysList.find((r) => r[this.configNetwork?.network?.toLowerCase()] === relay);
          if (relayData) this.checkedRelays.push(relayData);
        });
      });
    }
  },
  methods: {
    shuffleRelaysList(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    saveModify() {
      let dependencies = toRaw(this.options).filter((s) => s.selectedForConnection);
      this.$emit("saveModify", {
        port: parseInt(this.port),
        executionClients: dependencies.filter((s) => s.category === "execution"),
        beaconServices: dependencies.filter((s) => s.category === "consensus" || s.service === "CharonService"),
        relays: this.checkedRelays.map((r) => r[this.configNetwork.network.toLowerCase()]).join(),
      });
    },
    switchHandler(service) {
      if (service.selectedForConnection) {
        return service.selectedForConnection;
      }
      return false;
    },
    changeTheOption() {
      if (this.genesisIsActive) {
        this.genesisIsActive = false;
        this.checkPointIsActive = true;
      } else {
        this.checkPointIsActive = false;
        this.genesisIsActive = true;
      }
    },
    optionsToConnect() {
      if (this.items.category === "consensus") {
        this.options = this.newConfiguration.filter((service) => service.category === "execution");
      } else if (this.items.service === "SSVNetworkService") {
        this.options = this.newConfiguration.filter((service) => /execution|consensus/.test(service.category));
      } else if (this.items.category === "validator") {
        this.options = this.newConfiguration.filter(
          (service) =>
            (service.category === "consensus" && this.items.service !== "Web3SignerService") ||
            (service.service === "CharonService" && this.items.service !== "CharonService")
        );
      } else if (this.items.service === "FlashbotsMevBoostService") {
        this.options = this.newConfiguration.filter((service) => service.category === "consensus");
      } else {
        this.options = [];
      }
      this.options = this.options.map((option) => {
        let connected = false;
        if (this.items.config?.dependencies) {
          let buffer = this.items.config.dependencies.consensusClients.concat(
            this.items.config.dependencies.executionClients
          );
          connected = this.getMevBoostConnections(this.items.config.serviceID, option.config.serviceID);
          if (buffer.map((s) => s.id).includes(option.config.serviceID)) {
            connected = true;
          }
        }
        return {
          ...option,
          selectedForConnection: connected,
        };
      });
    },
    getMevBoostConnections(mevID, clientID) {
      let connected = false;
      let client = this.installedServices.find((c) => c.config.serviceID === clientID);
      if (client?.config.dependencies.mevboost?.length > 0) {
        if (client.config.dependencies.mevboost.map((c) => c.id).includes(mevID)) connected = true;
      }
      return connected;
    },
    changeSelectedServiceToConnect(service) {
      service.selectedForConnection = !service.selectedForConnection;
    },
  },
};
</script>
<style scoped>
* {
  box-sizing: border-box;
}
[serviceId-tooltip] {
  position: relative;
  cursor: default;
}
[serviceId-tooltip]::after {
  position: absolute;
  width: max-content;
  text-align: center;
  content: attr(serviceId-tooltip);
  color: #eee;
  background: #000;
  bottom: 90%;
  left: calc(40%-10px);
  padding: 2% 5%;
  border: 1px solid #929292;
  border-radius: 5px;
  font-weight: 400;
  font-size: 53%;
  visibility: hidden;
  opacity: 0;
  transform: translateY(20%);
  transition: opacity 0.3s transform 0.2s;
}
[serviceId-tooltip]:hover::after {
  opacity: 1;
  visibility: visible;
  transform: rotateY(0);
}
[data-tooltip] {
  position: relative;
  cursor: default;
}
[data-tooltip]::after {
  position: absolute;
  width: max-content;
  left: -990%;
  top: 50%;
  text-align: center;
  content: attr(data-tooltip);
  color: #eee;
  background: rgba(170, 0, 30, 0.8);
  border-radius: 5px;
  font-size: 70%;
  font-weight: 600;
  padding: 20% 35%;
  border: 1px solid #929292;
  visibility: hidden;
  opacity: 0;
  transform: translateY(20%);
  transition: opacity 0.3s transform 0.2s;
}
[data-tooltip]:hover::after {
  opacity: 1;
  visibility: visible;
  transform: rotateY(0);
}
.addParent {
  grid-column: 1;
  width: 100%;
  height: 100%;
  margin-top: 1px;
  display: flex;
  background: #3a3d40;
  border-right: 2px solid rgb(31, 31, 31);
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  transition-duration: 500ms;
  box-sizing: border-box;
}

.addBox {
  width: 98%;
  height: 99%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: #3a3d40;
  border-radius: 10px;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
}
.replaceService {
  width: 17%;
  height: 6%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  margin: 0 auto;
  position: absolute;
  top: 1%;
  right: 3%;
  box-sizing: border-box;
}
.replaceService img {
  width: 90%;
  height: 90%;
  object-fit: contain;
  cursor: pointer;
}
.replaceService img:hover {
  transform: scale(1.1);
  transition-duration: 200ms;
}
.replaceService img:active {
  transform: scale(1);
  transition-duration: 200ms;
}

.service {
  width: 98%;
  height: 10%;
  margin-top: 15%;
  padding: 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}
.service img {
  width: 25%;
}

.service-details {
  width: 70%;
  height: 95%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.service-details .serviceName {
  width: 100%;
  height: 60%;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 700;
  color: #c8c8c8;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: scroll;
  /*text-overflow: ellipsis;*/
  align-self: center;
  box-sizing: border-box;
}
.serviceName ::-webkit-scrollbar {
  height: 2px;
}
.serviceName ::-webkit-scrollbar-track {
  background: #23282b;
  height: 2px;
}
.serviceName ::-webkit-scrollbar-thumb {
  background: #42a5de;
  height: 2px;
}
.service-details p,
.service-details p span {
  width: max-content;
  height: 40%;
  text-align: left;
  font-size: 0.6rem;
  font-weight: 600;
  color: #8a8a8a;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-self: flex-start;
  box-sizing: border-box;
}

.configBox {
  width: 98%;
  height: 70%;
  margin-top: 5%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}
.configBox::-webkit-scrollbar {
  width: 5px;
}
.configBox::-webkit-scrollbar-track {
  background: #23282b;
}
.configBox::-webkit-scrollbar-thumb {
  background: #47de42;
  border-radius: 5px;
}

.configBox .change-installation {
  width: 100%;
  height: 12%;
  border-radius: 5px;
  background-color: #23282b;
  box-shadow: 1px 1px 3px 1px #16191b;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  box-sizing: border-box;
}
.change-installation .change-title {
  width: 90%;
  height: 15%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
.change-title span {
  color: #c0c0c0;
  font-size: 0.7rem;
  font-weight: 700;
  box-sizing: border-box;
}
.change-installation .change-box {
  width: 96%;
  height: 45%;
  background-color: rgb(209, 209, 209);
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-sizing: border-box;
}
.change-box input {
  width: 100%;
  height: 100%;
  background-color: rgb(209, 209, 209);
  border: none;
  border-radius: 6px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 600;
  color: #232323;
  padding: 0;
  padding-left: 4px;
  outline: none !important;
  outline-style: none !important;
  box-sizing: border-box;
}
.configBox .fast-sync {
  width: 100%;
  height: 13%;
  background-color: #23282b;
  box-shadow: 1px 1px 3px 1px #16191b;
  border-radius: 10px 0 3px 3px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
}
.fast-sync .sync-header {
  width: 100%;
  height: 40%;
  border: 1px solid #2b2b2b;
  border-radius: 15px 0 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}
.fast-sync .sync-header .headerTitle {
  width: 45%;
  height: 100%;
  border-radius: 15px 0 0 15px;
  background-color: #316355;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}
.headerTitle span {
  width: 86%;
  font-size: 0.7rem;
  font-weight: 700;
  color: #cdcdcd;
  text-align: center;
  margin-right: 3px;
  box-sizing: border-box;
}
.fast-sync .sync-header .headerContent {
  width: 55%;
  height: 100%;
  border-radius: 0;
  padding: 0 2px;
  background-color: #414649;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  box-sizing: border-box;
}
.headerContent span {
  width: 86%;
  height: 100%;
  font-size: 0.7rem;
  font-weight: 700;
  color: #cdcdcd;
  text-align: center;
  margin-right: 3px;
  box-sizing: border-box;
}
.headerContent img {
  padding: 1px;
  width: 8%;
  height: 50%;
  cursor: pointer;
}
.fast-sync .content {
  width: 100%;
  height: 64%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
.fast-sync .content span {
  font-size: 0.55rem;
  font-weight: 700;
  color: #b3b3b3;
  text-align: center;
  box-sizing: border-box;
}
.fast-sync .content .inputBox {
  width: 95%;
  height: 70%;
  background-color: #d1d1d1;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-sizing: border-box;
}
.fast-sync .content input {
  width: 100%;
  height: 100%;
  background-color: rgb(209, 209, 209);
  border: none;
  border-radius: 3px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 600;
  color: #232323;
  padding: 0;
  padding-left: 4px;
  box-sizing: border-box;
}
.portAddBox {
  width: 99%;
  height: 12%;
  background-color: #23282b;
  border-radius: 3px;
  margin-top: 10px;
  padding: 1px 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}
.portAddBox img {
  padding: 1px;
  width: 18%;
  height: 80%;
  opacity: 0.5;
}

.portConfig {
  width: 80%;
  height: 95%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
}
.portConfig span {
  width: max-content;
  height: 30%;
  font-size: 0.6rem;
  font-weight: 700;
  color: #b3b3b3;
  text-align: center;
  box-sizing: border-box;
}
.portConfig input {
  width: 96%;
  height: 55%;
  background-color: rgb(14, 14, 14);
  border: 1px solid rgb(53, 53, 53);
  border-radius: 30px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #b0b0b0;
  padding: 0;
  margin-top: 3%;
  box-sizing: border-box;
}
.btnBox {
  width: 100%;
  height: 6%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  position: absolute;
  bottom: 20px;
  box-sizing: border-box;
}
.addBtn {
  width: 40%;
  height: 95%;
  background-color: #116b5f;
  color: #dfdfdf;
  border-radius: 5px;
  border: 1px solid #11675c;
  box-shadow: 0 1px 3px 1px #2d2f31;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  box-sizing: border-box;
}
.addBtn:hover {
  background-color: #0d4f46;
  transition-duration: 0.2s;
}
.addBtn:active {
  background-color: #0d4f46;
  transition-duration: 0.2s;
  transform: scale(0.9);
}
.cancelBtn {
  width: 40%;
  height: 95%;
  background-color: #d75442;
  color: #dfdfdf;
  border-radius: 5px;
  border: 1px solid #d75442;
  box-shadow: 0 1px 3px 1px #2d2f31;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  box-sizing: border-box;
}
.cancelBtn:hover {
  background-color: #b84738;
  transition-duration: 0.2s;
}
.cancelBtn:active {
  background-color: #b84738;
  transition-duration: 0.2s;
  transform: scale(0.9);
}
.optionsBox {
  width: 99%;
  height: 12%;
  background-color: #23282b;
  border-radius: 3px;
  margin-top: 10px;
  padding: 1px 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
}
.optionsBox:hover {
  background-color: #2d3336;
  box-shadow: 0 1px 5px 1px #111111;
  transition-duration: 0.2s;
}
.optionsBox img {
  padding: 1px;
  width: 17%;
  height: 90%;
  opacity: 0.5;
}
.optionsDetails {
  width: 80%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 2px;
  box-sizing: border-box;
}
.optionsDetails .category {
  width: max-content;
  height: 30%;
  font-size: 0.6rem;
  font-weight: 700;
  color: #b3b3b3;
  text-align: center;
  text-transform: uppercase;
  box-sizing: border-box;
}
.optionsName {
  width: 99%;
  height: 60%;
  background-color: rgb(14, 14, 14);
  border: 1px solid rgb(53, 53, 53);
  border-radius: 30px;
  margin-top: 3%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}
.optionsName .notSelected {
  padding: 2px;
  margin-top: 2%;
  font-size: 0.6rem;
  font-weight: 700;
  color: #9a9a9a;
  text-align: center;
  align-self: center;
  text-transform: uppercase;
  box-sizing: border-box;
}
.optionsName .selected {
  padding: 2px;
  margin-top: 2%;
  font-size: 0.6rem;
  font-weight: 700;
  color: #34a061;
  text-align: center;
  align-self: center;
  text-transform: uppercase;
  box-sizing: border-box;
}
.relaysBox {
  width: 100%;
  height: 78%;
  padding: 2px;
  background-color: #23282b;
  border: 1px solid #22272a;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
}
.relaysBoxTitle {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  font-size: 0.7rem;
  font-weight: 600;
  color: #aaaaaa;
}
.relaysBoxContent {
  width: 100%;
  height: 90%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  text-transform: uppercase;
}
.relaysBoxContent::-webkit-scrollbar {
  width: 5px;
}
.relaysBoxContent::-webkit-scrollbar-track {
  background: #23282b;
}
.relaysBoxContent::-webkit-scrollbar-thumb {
  background: #42a5de;
  border-radius: 5px;
}

.relaysBoxContent .relay {
  width: 100%;
  height: 12%;
  min-height: 35px;
  background-color: #2e3438;
  border: 1px solid #22272a;
  border-radius: 5px;
  margin-top: 2px;
  padding: 3px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
}
.relaysBoxContent .relay:hover {
  background-color: #3b4246;
  border: 1px solid #3b4246;
  transition-duration: 0.2s;
}
.relaysBoxContent .relay input {
  width: 10%;
  height: 60%;
  border-radius: 2px;
  background-color: rgb(81, 89, 96);
}
.relaysBoxContent .relay label {
  width: 80%;
  height: 100%;
  margin-left: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  font-size: 0.7rem;
  font-weight: 600;
  color: #aaaaaa;
  cursor: pointer;
}
.iconBox {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10%;
  height: 65%;
  margin-right: 5px;
}
</style>
