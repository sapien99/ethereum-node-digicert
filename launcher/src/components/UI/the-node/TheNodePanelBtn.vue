<template>
  <div class="btn-parent" :style="{ gridRow: `${gridRow}` }" @click="btnAction">
    <span :style="color()"><slot></slot></span>
    <img :src="imgPath" alt="icon" :style="{ width: `${width}%`, marginRight: `${marginRight}%` }" />
  </div>
</template>
<script>
export default {
  props: {
    imgPath: {
      type: String,
      required: true,
    },
    isColor: {
      type: String,
      required: false,
      default: "light",
    },
    width: {
      type: String,
      required: true,
    },
    marginRight: {
      type: String,
      required: true,
    },
    gridRow: {
      type: String,
      required: true,
    },
  },
  emit: ["btn-action"],
  data() {
    return {
      colorStyle: this.isColor,
    };
  },
  computed: {
    grey() {
      return { color: "#9b9b9b" };
    },
    red() {
      return { color: "#df4b46" };
    },
    light() {
      return { color: "#c1c1c1" };
    },
    green() {
      return { color: "#408886" };
    },
    lighGreen() {
      return { color: "#49b48b" };
    },
    gold() {
      return { color: "#cfaf65" };
    },
    orange() {
      return { color: "#F37F0C" };
    },
    blue() {
      return { color: "#6ABCFF" };
    },
  },
  methods: {
    btnAction() {
      this.$emit("btn-action");
    },
    color() {
      switch (this.colorStyle) {
        case "grey":
          return this.grey;
        case "red":
          return this.red;
        case "light":
          return this.light;
        case "green":
          return this.green;
        case "lighGreen":
          return this.lighGreen;
        case "gold":
          return this.gold;
        case "orange":
          return this.orange;
        case "blue":
          return this.blue;
        default:
          return this.light;
      }
    },
  },
};
</script>
<style scoped>
.btn-parent {
  width: 95%;
  height: 80%;
  padding: 0 10px;
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-self: center;
  background-color: #242529;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid #787878;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 1px 3px 1px #3b3b3b;
}
.btn-parent:hover {
  background-color: #18191c;
}
.btn-parent:active {
  box-shadow: none;
  transform: scale(0.99);
}
</style>
