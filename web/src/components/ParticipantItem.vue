<template>
  <div
    class="flex-none flex justify-center items-center w-16 h-16 m-1 p-1 text-sm shadow rounded-full select-none"
    :class="hasVoted ? 'bg-red-400' : 'bg-green-400'"
  >
    <p class="text-center text-white font-medium text-xs overflow-x-hidden">
      {{ name }}
      <font-awesome-icon
        v-if="hasVoted && showCheckmark"
        class="text-white"
        icon="check"
      />
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

@Component({
  components: { FontAwesomeIcon },
})
export default class ParticipantItem extends Vue {
  @Prop() private name!: string;
  @Prop() private hasVoted!: boolean;
  @Prop({ required: false, default: false }) private showCheckmark!: boolean;
}
</script>
