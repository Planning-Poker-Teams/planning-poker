<template>
  <div class="h-fullx">
    Estimation result
    {{ JSON.stringify(result) }}
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class EstimationResult extends Vue {
  get result() {
    return this.$store.state.estimationResult;
  }
}
</script>
