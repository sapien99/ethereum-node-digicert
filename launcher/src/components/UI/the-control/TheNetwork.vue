<template>
  <div class="networkParent">
    <!-- <div class="networkTtl"><span>NETWORK</span></div> -->
    <div class="networkBox">
      <div class="networkIco">
        <div class="networkIco-container">
          <img src="../../../../public/img/icon/control/wifiIcon.svg" />
        </div>
        <span>{{ $t("controlPage.network") }}</span>
      </div>
      <div class="totalReceived">
        <div class="receivePerSecond">
          <span>{{ rx }}</span>
        </div>
        <div class="mbit"><span>KB/s</span></div>
        <div class="receiveTitle">{{ $t("controlPage.receive") }}</div>
      </div>
      <div class="totalTransmitted">
        <div class="transPerSecond">
          <span>{{ tx }}</span>
        </div>
        <div class="mbit"><span>KB/s</span></div>
        <div class="transmitTitle">{{ $t("controlPage.transmit") }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useControlStore } from "../../../store/theControl";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(useControlStore, {
      rx: "rx",
      tx: "tx",
    }),
  },
};
</script>

<style scoped>
.networkParent {
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  height: 100%;
}
.networkBox {
  width: 100%;
  height: 100%;
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
}
.networkIco {
  box-sizing: border-box;
  width: 30%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.networkIco-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 80%;
}
.networkIco-container img {
  width: 70%;
}
.networkIco span {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50%;
  font-weight: bold;
  color: #c1c1c1;
  flex-wrap: nowrap;
}
.totalReceived,
.totalTransmitted {
  width: 35%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 80%;
}
.receivePerSecond {
  width: 100%;
  height: 40%;
  font-size: 100%;
  font-weight: bold;
  color: #ec590a;
}
.mbit {
  width: 100%;
  height: 25%;
  font-weight: bold;
  font-size: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #c1c1c1;
}
.receiveTitle,
.transmitTitle {
  width: 100%;
  height: 25%;
  font-size: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.totalReceiveValue,
.totalTransmitValue {
  width: 100%;
  height: 35%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.arrow {
  width: 20%;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  box-sizing: border-box;
}
.arrow img {
  width: 80%;
}
.totalReceiveValue_data,
.totalTransmitValue_data {
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 70%;
  font-weight: bold;
}
.transPerSecond {
  width: 100%;
  height: 40%;
  font-size: 100%;
  font-weight: bold;
  color: #336666;
}
</style>
