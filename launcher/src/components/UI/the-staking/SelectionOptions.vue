<template>
  <div class="selection-box">
    .
    <div class="selection-table">
      <div class="selection-table_validator">
        <div class="validator-icon"><img :src="validatorIcon" :alt="validatorName" /></div>
        <div class="validator-name">
          <span>{{ validatorName }}</span>
        </div>
        <div v-if="multiValidator" class="arrow-abteilung" @click="selectorToggl">
          <i v-if="selector" class="arrow up"></i>
          <i v-else class="arrow down"></i>
        </div>
      </div>
      <div class="validator-commands">
        <div class="validator-state">
          <div class="validator-state_Icon">
            <div class="validator-state_Icon-icon" :class="validatorState === 'running' ? 'green' : 'red'"></div>
          </div>
          <div class="validator-state_status">{{ validatorState === "running" ? "running" : "off" }}</div>
        </div>
        <div class="key-counter">
          <div class="key-counter_counter">
            <span :class="validatorState === 'running' ? 'greenCounter' : 'redCounter'">{{ keyCounter }}</span>
          </div>
          <div class="key-counter_icon">
            <img src="/img/icon/the-staking/keyIcon.png" alt="validator-key" />
          </div>
        </div>
      </div>
      <ul v-if="selector" class="validator-selectionpart">
        <li v-for="validator in validators" :key="validator" @click="vldPicker(validator)">
          <div class="validator-icons"><img :src="validator.icon" :alt="validator.name" /></div>
          <div class="validators-name">
            <span>{{ validator.name }}</span>
          </div>
        </li>
      </ul>
      <div
        class="buttonRow"
        :class="{
          disabled:
            disable || validatorName === 'Lodestar' || validatorName === 'Nimbus' || validatorName === 'Web3Signer',
        }"
        @click.stop="$emit('clickBtnGraffiti')"
      >
        <div class="btnContent">
          <img src="/img/icon/the-staking/option-graffiti.png" alt="icon" />
          <span>{{ $t("selectionOption.graffiti") }}</span>
        </div>
      </div>
      <div class="buttonRow" :class="{ disabled: disable }" @click.stop="$emit('clickBtnRemove')">
        <div class="btnContent">
          <img src="/img/icon/the-staking/option-remove.png" alt="icon" />
          <span>{{ $t("selectionOption.removeKeys") }}</span>
        </div>
      </div>
      <div
        class="buttonRow"
        :class="{ disabled: validatorName === 'Web3Signer' }"
        @click.stop="$emit('importRemoteKeys')"
      >
        <div class="btnContent">
          <img src="/img/icon/the-staking/option-remove.png" alt="icon" />
          <span>Import Remote Keys</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useStakingStore } from "@/store/theStaking";
export default {
  props: {
    validatorIcon: {
      type: String,
      required: true,
    },
    validatorName: {
      type: String,
      required: true,
    },
    validatorState: {
      type: String,
      required: true,
    },
    vIcon: {
      type: String,
      required: false,
    },
    vName: {
      type: String,
      required: false,
    },
    validators: {
      type: Array,
      required: true,
    },
    disable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  emits: ["vld-picker"],
  data() {
    return {
      selector: false,
      multiValidator: false,
    };
  },
  computed: {
    ...mapState(useStakingStore, {
      keyCounter: "keyCounter",
    }),
  },
  mounted() {
    if (this.validators.length > 1) {
      this.multiValidator = true;
    }
  },
  methods: {
    selectorToggl() {
      this.selector = !this.selector;
    },
    vldPicker(validator) {
      this.$emit("vld-picker", validator);
      this.selector = false;
    },
    checkLodestar() {
      this.lodestarValidator = this.validators.find((validator) => validator.name === "lodestar");
    },
  },
};
</script>
<style scoped>
.validator-commands {
  display: flex;
  width: 90%;
  height: 8%;
  justify-content: center;
  align-items: center;
  top: 12%;
  position: absolute;
}
.validator-state {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.key-counter {
  width: 50%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #eee;
  font-size: 80%;
  position: relative;
}
.key-counter_counter {
  font-weight: 700;
}
.key-counter_icon {
  display: flex;
  width: 50%;
  height: 95%;
  justify-content: center;
  align-items: center;
}
.key-counter_icon img {
  width: 45%;
}
.validator-state_Icon {
  width: 30%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.validator-state_status {
  width: 70%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #eee;
  text-transform: uppercase;
  font-size: 70%;
  font-weight: 700;
}
.validator-state_Icon-icon {
  display: flex;
  width: 38%;
  height: 95%;
  border-radius: 50%;
  border: #bfbfbf;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3), 0 0 5px rgba(0, 0, 0, 0.1);
}
.green {
  background-color: #7fff00;
}
.greenCounter {
  color: #7fff00;
}

.red {
  background-color: #ff5733;
}
.redCounter {
  color: #ff5733;
}
.validator-selectionpart {
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  position: absolute;
  background: #1258a2;
  top: 10%;
  overflow-y: scroll;
  opacity: 1 !important;
  border-radius: 0 0 10px 10px;
}
.validator-selectionpart li {
  width: 100%;
  height: 30%;
  display: flex;
  border-bottom: 1px solid #dfdfdf;
  color: #eee;
  margin-bottom: 1%;
  cursor: pointer;
  background: #1258a2;
  z-index: 100;
}
.validator-selectionpart li:hover {
  background: #dfdfdf;
  color: #1258a2;
}
.validator-icons {
  width: 18%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.validator-icons img {
  width: 80%;
}
.validators-name {
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.arrow {
  border: solid black;
  border-width: 0 2px 2px 0;
  display: flex;
  padding: 10%;
  margin-right: 15%;
}
.down {
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
}
.up {
  transform: rotate(225deg);
  -webkit-transform: rotate(225deg);
}
.arrow-abteilung {
  width: 20%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
}
.validator-name {
  display: flex;
  width: 60%;
  height: 100%;
  justify-content: center;
  align-items: center;
  font-size: 100%;
  font-weight: 600;
}
.validator-icon {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 20%;
  height: 100%;
}
.validator-icon img {
  width: 41%;
}
.selection-table_validator {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 15%;
  background: #dfdfdf;
  border-radius: 30px;
  padding: 0 1%;
  position: absolute;
  top: -10px;
  z-index: 0;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
}
.selection-box {
  grid-column: 10/13;
  grid-row: 3/4;
  width: 96%;
  height: 77%;
  border: 4px solid #bfbfbf;
  border-radius: 10px;
  background-color: #242529;
  display: flex;
  margin: 0 auto;
  margin-top: 35px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  position: relative;
}
.selection-table {
  width: 100%;
  height: 80%;
  padding: 0 5px;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
/*.selection-table .buttonRow:last-child {
  position: absolute;
  bottom: 2px;
  padding: 5px 8px 3px 8px;
}*/

.buttonRow {
  width: 99%;
  height: 25px;
  border-radius: 20px;
  border: 1px solid #eee;
  padding: 5px 8px 3px 8px;
  background-color: #dfdfdf;
  box-shadow: 0 1px 5px 1px rgb(32, 32, 32);
  margin-top: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.btnContent {
  display: grid;
  grid-template-columns: 10% 90%;
  grid-template-rows: 100%;
  width: 90%;
  align-items: center;
}
.buttonRow img {
  grid-column: 1/2;
  grid-row: 1/2;
  width: 19px;
  height: 100%;
}
.buttonRow span {
  grid-column: 2;
  font-size: 0.75rem;
  font-weight: 800;
  color: rgb(57, 57, 57);
  text-align: center;
  text-transform: uppercase;
}

.buttonRow:hover {
  transition-duration: 100ms;
  background-color: #3d746e;
  border-color: #3d746e;
  box-shadow: none;
}
.buttonRow:hover span {
  transition-duration: 100ms;
  color: #fff;
}
.buttonRow:active {
  padding: 4px 8px;
  transform: scale(0.96);
  box-shadow: none;
}
</style>
