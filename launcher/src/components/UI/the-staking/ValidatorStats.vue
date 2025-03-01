<template>
  <div class="statParent" @mousedown.prevent>
    <div class="balanceParent">
      <TotalBalance />
    </div>
    <div class="stateBox">
      <div v-if="checkConsensus && checkKeyExists && checkConsensusState.state === 'running'" class="stateInnerBox">
        <StateDropdown :keys="keys" @get-validator="getValidatorStats" />
        <div class="indexParent">
          <div class="indexBox">
            <div class="index">
              <span class="indexTitle">Index No.</span>
              <span class="indexValue">{{ stats.validator }}</span>
            </div>
          </div>
        </div>
        <div class="componentParent">
          <div class="dynamicComponent">
            <div
              v-for="(item, index) in optionsType"
              v-show="item.title === currentComponent"
              :key="index"
              class="outterBox"
            >
              <component :is="item.comp" v-bind="item" />
            </div>
          </div>
          <div class="predicitionIcon">
            <img src="/img/icon/the-staking/predicition-icon.png" alt="Icon" />
          </div>
        </div>
        <div class="tabBarParent">
          <div class="tabBar_innerBox">
            <TabBar :tabs="tabs" @get-title="getActiveComponent" />
          </div>
        </div>
        <div v-if="displayCounter" class="countDown">
          <span>{{ timer }}</span>
        </div>
      </div>
      <div v-else-if="checkConsensus && checkConsensusState.state !== 'running'" class="w-full h-full">
        <img src="/img/icon/the-staking/error.png" class="w-full h-full" alt="consensus" />
      </div>
      <div v-else-if="!checkConsensus" class="w-full h-full">
        <img src="/img/icon/the-staking/noConsensus.png" class="w-full h-full" alt="consensus" />
      </div>
      <div v-else-if="!checkKeyExists" class="w-full h-full">
        <img src="/img/icon/the-staking/nokey.png" class="w-full h-full" alt="No key Image" />
      </div>
    </div>
  </div>
</template>

<script>
import StateDropdown from "./StateDropdown.vue";
import TotalBalance from "./TotalBalance.vue";
import TabBar from "./TabBar.vue";
import SyncCommitte from "./SyncCommitte.vue";
import BlockProduction from "./BlockProduction.vue";
import TheAttestation from "./TheAttestation.vue";
import { mapWritableState } from "pinia";
import { useStakingStore } from "@/store/theStaking";
import { useServices } from "@/store/services";
import ControlService from "@/store/ControlService";
import { shallowRef } from "vue";

export default {
  components: {
    TotalBalance,
    StateDropdown,
    TabBar,
    SyncCommitte,
    TheAttestation,
    BlockProduction,
  },
  data() {
    return {
      optionsType: [
        {
          title: "ATTESTATION",
          comp: shallowRef(TheAttestation),
          props: {
            remainingTime: this.remainingTime,
          },
        },
        {
          title: "SYNC COMMITTEE",
          comp: shallowRef(SyncCommitte),
        },
        {
          title: "BLOCK PRODUCTION",
          comp: shallowRef(BlockProduction),
          props: {
            remainingTime: this.remainingTime,
          },
        },
      ],
      tabs: [
        { id: 1, title: "ATTESTATION", imgPath: "/img/icon/the-staking/eye.png", display: false },
        // { id: 2, title: "SYNC COMMITTEE", imgPath: "/img/icon/the-staking/comitte.png", display: false },
        { id: 3, title: "BLOCK PRODUCTION", imgPath: "/img/icon/the-staking/cube.png", display: false },
      ],
      selectedValidator: {},
      maxCharacters: 30,
      withdrawalAddress: "0x12345gbfdbf097df9gb7s9dfg7b9sdfg7b67890",
      currentComponent: "ATTESTATION",
      intervalId: null,
      consensusExists: false,
      timer: 5,
      countDown: null,
      displayCounter: false,
    };
  },
  computed: {
    ...mapWritableState(useStakingStore, {
      keys: "keys",
      stats: "stats",
    }),
    ...mapWritableState(useServices, {
      installedServices: "installedServices",
    }),
    checkConsensus() {
      const consensusItem = this.installedServices.some((item) => item.category === "consensus");
      return consensusItem;
    },
    checkKeyExists() {
      const keyExistance = this.keys.length ? true : false;
      return keyExistance;
    },
    checkConsensusState() {
      return this.installedServices.find((item) => item.category === "consensus");
    },
  },

  mounted() {
    this.getActiveComponent("ATTESTATION");
  },
  unmounted() {
    clearInterval(this.intervalId);
    clearInterval(this.countDown);
  },
  methods: {
    async getValidatorStats(item) {
      this.displayCounter = true;
      clearInterval(this.intervalId);
      if (item) {
        this.intervalId = setInterval(() => {
          this.updateValidatorStats();
          this.countDown = setInterval(() => {
            this.timer--;
            if (this.timer == -1) {
              clearInterval(this.countDown);
              this.timer = 5;
            }
          }, 1000);
        }, 6000);

        this.selectedValidator = item;
        await this.updateValidatorStats();
      }
    },
    async updateValidatorStats() {
      if (this.selectedValidator?.key) {
        const output = await ControlService.getValidatorStats(this.selectedValidator.key);
        this.stats = output;
      }
    },
    toggleDropDown() {
      this.dropDownIsOpen = !this.dropDownIsOpen;
    },
    getActiveComponent(item) {
      this.currentComponent = item;
    },
  },
};
</script>

<style scoped>
.statParent {
  grid-column: 10/13;
  grid-row: 1/3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 320px;
  height: 100%;
  padding: 10px 5px 10px 5px;
}
.balanceParent {
  width: 100%;
  height: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.stateBox {
  width: 100%;
  height: 74%;
  background-color: #bfbfbf;
  border-radius: 10px;
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.stateInnerBox {
  width: 100%;
  height: 100%;
  background-color: #242529;
  border-radius: 10px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(10, 1fr);
}

.indexParent {
  grid-column: 1/7;
  grid-row: 5/6;
  width: 100%;
  height: 100%;
}
.indexParent .indexBox {
  width: 100%;
  height: 50%;
  padding: 0 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #cdcdcd;
  font-size: 0.8rem;
  font-weight: 700;
}
.indexBox .index {
  width: 60%;
  height: 100%;

  display: flex;
  justify-content: space-evenly;
  align-items: center;
  overflow: hidden;
}
.indexBox .index .indexTitle {
  width: 50%;
  height: 100%;
  color: #cdcdcd;
  font-size: 0.6rem;
  font-weight: 600;
}
.indexBox .index .indexValue {
  width: 50%;
  height: 100%;

  color: #efd96bdf;
  font-size: 0.6rem;
  font-weight: 600;
}

.indexBox .apr {
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  overflow: hidden;
}
.indexBox .apr .aprTitle {
  width: 80%;
  height: 100%;
  color: #efd96bdf;
  font-size: 0.5rem;
  font-weight: 700;
}
.indexBox .apr .aprValue {
  width: 30%;
  height: 100%;
  color: #47c42e;
  font-size: 0.6rem;
  font-weight: 600;
}

.indexParent .withdrawal {
  width: 100%;
  height: 50%;
  padding: 0 5px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.indexParent .withdrawal .withdrawal_title {
  width: 40%;
  height: 100%;
  text-align: left;
  color: #efd96bdf;
  font-size: 0.5rem;
  font-weight: 700;
}
.indexParent .withdrawal .withdrawal_value {
  width: 60%;
  height: 100%;
  padding: 0 2px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.indexParent .withdrawal .withdrawal_value span {
  width: 100%;
  color: #cdcdcd;
  font-size: 0.6rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.tabBarParent {
  grid-column: 1/7;
  grid-row: 1/4;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 0;
}
.tabBarParent .tabBar_innerBox {
  width: 100%;
  height: 100%;
  padding: 5px 3px;
  border-radius: 10px;
  background-color: #4d4d4d;
  border: 2px solid #505559;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
}
.componentParent {
  grid-column: 1/7;
  grid-row-start: 6;
  grid-row-end: 11;
  width: 100%;
  height: 95%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.componentParent .dynamicComponent {
  width: 75%;
  height: 100%;
  padding: 0 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}
.dynamicComponent .outterBox {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
.componentParent .predicitionIcon {
  width: 25%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  position: relative;
}
.componentParent .predicitionIcon img {
  position: absolute;
  top: 0;
  width: 63px;
  z-index: 0;
}
.stateBox .countDown {
  position: absolute;
  bottom: 3px;
  right: 25px;
  font-size: 25px;
  font-weight: 700;
  color: gold;
}
.blockBox .cubeIcon span {
  color: #cdcdcd;
  font-size: 0.5rem;
  font-weight: 600;
  text-align: center;
}
.tabBarParent .blockBox .cubeIcon img {
  width: 80%;
}
.tabBarParent .attestation .attestationTitle,
.tabBarParent .blockBox .blockTitle {
  width: 80%;
  height: 62%;
  padding: 0 3px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #318d1f;
  border: 1px solid #9e9e9e;
  border-radius: 3px;
}
.tabBarParent .attestation .attestationTitle span,
.tabBarParent .blockBox .blockTitle span {
  width: 100%;
  color: #f0f0f0;
  font-size: 0.5rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tabBarParent .blockBox {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.tabBarParent .attestationSlot {
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.tabBarParent .attestationSlot .attestationSlotBox {
  width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}
.attestationSlotBox .attestationSlot_row_1 {
  width: 100%;
  height: 33%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.attestationSlot_row_1 .attestationSlotTitle {
  width: 60%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.attestationSlot_row_1 .attestationSlotTitle span {
  width: 100%;
  color: #cdcdcd;
  font-size: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.attestationSlot_row_1 .attestationSlotValue {
  width: 40%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.attestationSlot_row_1 .attestationSlotValue span {
  color: #efd96bdf;
  font-size: 0.5rem;
  font-weight: 700;
  overflow: hidden;
}
.attestationSlotBox .attestationSlot_row_2,
.attestationSlotBox .attestationSlot_row_3 {
  width: 100%;
  height: 33%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 2px;
}
.attestationSlot_row_2 .attestationSlotTitle,
.attestationSlot_row_3 .attestationSlotTitle {
  width: 30%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.attestationSlot_row_2 .attestationSlotTitle span,
.attestationSlot_row_3 .attestationSlotTitle span {
  color: #cdcdcd;
  font-size: 0.6rem;
  font-weight: 600;
}
.attestationSlot_row_2 .attestationSlotValue,
.attestationSlot_row_3 .attestationSlotValue {
  width: max-content;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.attestationSlot_row_2 .attestationSlotValue span,
.attestationSlot_row_3 .attestationSlotValue span {
  color: #efd96bdf;
  font-size: 0.5rem;
  font-weight: 600;
  overflow: hidden;
}

.blockSlotBox {
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}
.blockSlotBox .blockSlotTitle {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.blockSlotBox .blockSlotTitle span {
  width: 100%;
  color: #318d1f;
  font-size: 0.6rem;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
}
.blockSlotBox .blockSlotValue {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.blockSlotBox .blockSlotValue span {
  width: 100%;
  color: #efd96bdf;
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
}

.syncParent {
  grid-column: 1/7;
  grid-row: 6/10;
  width: 100%;
  height: 100%;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}
.description {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.description p {
  color: #efefef;
  font-size: 0.5rem;
  font-weight: 600;
  text-align: center;
  text-transform: capitalize;
}
.description p span {
  color: #f3e32f;
  font-size: 0.5rem;
  font-weight: 600;
  text-align: center;
  text-transform: capitalize;
}

.sync-icon {
  width: 30%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.historyParent {
  grid-column: 1/7;
  grid-row: 10/11;
  width: 100%;
  height: 100%;
}
</style>
