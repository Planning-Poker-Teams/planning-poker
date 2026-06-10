<template>
  <div class="progress-bar">
    <div :style="{ 'background-color': backgroundColor }" class="progress-bar-body">
      <div
        :style="{
          width: percentage,
          'background-color': barColor,
        }"
        class="bar-itself-background"
      >
        <p
          v-if="withLabel"
          class="headline5 bar-itself-percentage-text"
          :style="{ color: fontColor }"
        >
          {{ percentage }}
        </p>
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
      default: '#A9B4BE',
    },
    barColor: {
      type: String,
      default: '#CCECFC',
    },
    fontColor: {
      type: String,
      default: 'white',
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
      return this.currentStep + '/' + this.totalStep + ' steps';
    },
    percentage() {
      return Math.round((this.currentStep / this.totalStep) * 100) + '%';
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
  border-radius: 10px;
  width: 100%;
  position: relative;
}
.bar-itself-background {
  position: relative;
  height: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bar-itself-percentage-text {
  margin: 0;
}
</style>
