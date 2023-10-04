<template>
  <div class="progress-bar">
    <div
      :style="{ 'background-color': backgroundColor }"
      class="progress-bar-body"
    >
      <div
        :style="{ width: percentage, 'background-color': frontColor }"
        class="bar-itself-background"
      ></div>
      <div :style="{ width: percentage }" class="bar-itself-percentage-text">
        <p v-if="withLabel" class="headline5">{{ percentage }}</p>
      </div>
    </div>
    <div v-if="showFooter" class="progress-bar-footer">
      <p class="font-progress-bar-footer">{{ progress }}</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    totalStep: {
      type: Number,
      required: true,
    },
    currentStep: {
      type: Number,
      required: true,
    },
    backgroundColor: {
      type: String,
      default: "#A9B4BE",
    },
    frontColor: {
      type: String,
      default: "#CCECFC",
    },
    withLabel: {
      type: Boolean,
      default: false,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    progress() {
      return this.currentStep + "/" + this.totalStep + " steps";
    },
    percentage() {
      return Math.round((this.currentStep / this.totalStep) * 100) + "%";
    },
  },
};
</script>
r

<style scoped>
.progress-bar {
  width: 100%;
}
.progress-bar-body {
  box-shadow: inset -5px 5px 10px rgba(0, 0, 0, 0.25);
  border-radius: 30px;
  width: 100%;
  position: relative;
}
.bar-itself-percentage-text {
  height: 30px;
  text-align: center;
  filter: blur(0);
}
.bar-itself-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 30px;
  border-radius: 30px;
  text-align: center;
}
</style>
