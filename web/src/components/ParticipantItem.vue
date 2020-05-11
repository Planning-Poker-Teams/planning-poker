<template>
  <div
    class="flex-none flex justify-center items-center w-16 h-16 m-1 p-1 text-sm shadow rounded-full select-none"
    :class="hasVoted ? 'bg-red-400' : 'bg-green-400'"
  >
    <p class="text-center text-white font-medium text-xs overflow-x-hidden">
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
