<template>
  <div
    class="flex-none flex justify-center items-center w-20 h-20 m-1 p-1 shadow rounded-full select-none"
    :class="hasVoted ? 'bg-red-400' : 'bg-green-400'"
  >
    <p class="text-center text-white font-medium text-sm overflow-x-hidden">
      {{ name }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ParticipantItem extends Vue {
  @Prop() private name!: string;
  @Prop() private hasVoted!: boolean;
}
</script>
