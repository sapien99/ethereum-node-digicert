<template>
  <div class="dropDown_parent">
    <div class="dropDown_box">
      <div class="dropDown" @click="toggleDropDown">
        <div v-if="!selectedValidator.key" class="options">Choose a validator</div>
        <div v-else class="options">
          {{ selectedValidator.key }}
        </div>

        <div class="dropDown_icon">
          <img :class="{ rotate: dropDownIsOpen }" src="/img/icon/arrows/arrow-down.png" alt="Arrow Icon" />
        </div>
      </div>
      <div v-if="dropDownIsOpen" class="valueBox" @mouseleave="dropDownIsOpen = false">
        <div
          v-for="(key, index) in [...new Map(keys.map((item) => [item['key'], item])).values()]"
          :key="index"
          class="options_value"
          @click="chooseValidator(key)"
        >
          <span>{{ `${key.key.substring(0, 10)}...${key.key.substring(key.key.length - 15)}` }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapWritableState } from "pinia";
import { useNodeManage } from "../../../store/nodeManage";
export default {
  props: {
    keys: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dropDownIsOpen: false,
      selectedValidator: {},
    };
  },
  computed: {
    ...mapWritableState(useNodeManage, {
      currentNetwork: "currentNetwork",
    }),
  },
  methods: {
    toggleDropDown() {
      this.dropDownIsOpen = !this.dropDownIsOpen;
    },
    chooseValidator(key) {
      if (this.keys == []) return;
      this.selectedValidator = key;
      this.dropDownIsOpen = false;
      this.$emit("getValidator", this.selectedValidator);
    },
  },
};
</script>

<style scoped>
.dropDown_parent {
  grid-column: 1/7;
  grid-row: 4/5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px;
}

.dropDown_parent .dropDown_box {
  width: 100%;
  height: 100%;
  padding: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  z-index: 1;
}
.dropDown_box .dropDown {
  width: 100%;
  height: 100%;
  border: 1px solid #404c59;
  background-color: #324154;
  box-shadow: 1px 1px 3px 1px rgb(15, 15, 15);
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
}
.dropDown_box .dropDown .options {
  width: 90%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 2px;
  padding-left: 5px;
  color: #e7e7e7;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropDown_box .valueBox {
  width: 94%;
  height: 85%;
  padding: 5px 2px;
  max-height: 180px;
  background-color: #1258a2;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  transition-duration: 300ms;
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  top: 14%;
  left: 3%;
}
.valueBox::-webkit-scrollbar-thumb {
  background: #efefef;
  border-radius: 5px;
}

.options_value {
  width: 100%;
  height: 30px;
  border-bottom: 1px solid #3b3f42;
  padding: 2px 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.options_value:hover {
  transition-duration: 300ms;
  background-color: #e4e4e4;
}
.options_value:hover span {
  color: #2d2d2d;
}

.options_value span {
  width: 100%;
  color: #cdcdcd;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}
.dropDown_box .dropDown .dropDown_icon {
  width: 13%;
  height: 100%;
  background-color: #0a7ae2;
  border-radius: 0 5px 5px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.dropDown_box .dropDown .dropDown_icon img {
  width: 60%;
  height: 50%;
}
.rotate {
  transform: rotate(180deg) !important;
}
</style>
