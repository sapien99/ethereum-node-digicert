<template>
  <div class="no-data_parent">
    <div class="no-data_box">
      <span class="big-sign"> &gt; {{ $t("noData.noData") }} &lt; </span>
      <div v-if="serviceCat === 'prometheus' ? true : false" class="bottom-part">
        <div class="comment-part">
          <span class="comment-row1">{{ $t("noData.turnOn") }} </span>
          <span class="comment-row2">Prometheus</span>
        </div>
        <div class="icon-part" :data-tooltip="serviceName">
          <img src="/img/icon/control/PrometheusServiceCircle.png" alt="Prometheus" />
        </div>
      </div>
      <div v-else class="bottom-part">
        <div class="comment-part">
          <span class="comment-row1">{{ $t("noData.turnOn") }} </span>
          <span class="comment-row2">consensus client</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    serviceCat: {
      type: String,
      default: "Prometheus",
    },
  },
  data() {
    return {
      serviceName: "Prometheus",
    };
  },
};
</script>

<style scoped>
[data-tooltip] {
  position: relative;
  cursor: default;
}
[data-tooltip]::after {
  position: absolute;
  width: max-content;
  left: calc(50%-25%);
  bottom: 110%;
  text-align: center;
  content: attr(data-tooltip);
  color: #eee;
  background: black;
  border-radius: 5px;
  font-size: 70%;
  padding: 10% 15%;
  border: 1px solid #929292;
  text-transform: uppercase;
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
.no-data_parent {
  width: 70%;
  height: 95%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.no-data_box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  flex-direction: column;
  color: aqua;
  position: absolute;
}
.big-sign {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40%;
  text-transform: uppercase;
  font-size: 100%;
  font-weight: 800;
  animation: blink 1s linear infinite;
  text-shadow: rgb(86, 202, 234) 1px 0 4px;
  text-transform: uppercase;
}
.bottom-part {
  width: 100%;
  height: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
}
.comment-part {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 68%;
  height: 100%;
  text-transform: uppercase;
}
.comment-row1 {
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 55%;
  font-weight: 500;
}
.comment-row2 {
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 70%;
  font-weight: 700;
}
.icon-part {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30%;
  height: 100%;
}
.icon-part img {
  width: 70%;
}
@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
