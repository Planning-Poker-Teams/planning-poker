<template>
  <div class="p-16 w-full h-full">
    <div class="h-full p-2 bg-gray-100 shadow-lg rounded-lg grid grid-rows-5">
      <div class="">
        <participant-list
          v-bind:participants="participants"
          v-bind:roomName="roomName"
        />
        <div class="mx-4 h-0 rounded border border-gray-200" />
      </div>

      <div class="h-fullx row-span-4 bg-red-700x">
        <start-estimation-form
          v-if="!isEstimationOngoing"
          v-on:start-estimation="startEstimation"
        />
        <ongoing-estimation
          v-if="isEstimationOngoing"
          v-bind:taskName="taskName"
          v-on:send-estimation="sendEstimation"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Watch, Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { EstimationState, Participant, Actions } from '../store';
import ParticipantList from '@/components/ParticipantList.vue';
import StartEstimationForm from '@/components/StartEstimationForm.vue';
import OngoingEstimation from '@/components/OngoingEstimation.vue';

@Component({
  components: {
    ParticipantList,
    StartEstimationForm,
    OngoingEstimation,
  },
})
export default class Room extends Vue {
  beforeMount() {
    const roomNameParam = this.$route.params.roomName;
    const roomName = this.$store.state.room?.name;

    if (!this.$store.state.room || roomName !== roomNameParam) {
      this.$router.push({ name: 'lobby', query: { room: roomNameParam } });
    }
  }

  startEstimation(taskName: string) {
    this.$store.dispatch(Actions.REQUEST_START_ESTIMATION, taskName);
  }

  sendEstimation(value: string) {
    this.$store.dispatch(Actions.SEND_ESTIMATION, value);
  }

  get participants(): Participant[] {
    return this.$store.state.participants;
  }

  get roomName(): string | undefined {
    return this.$store.state.room?.name;
  }

  get taskName(): string | undefined {
    return this.$store.state.ongoingEstimation?.taskName;
  }

  get isEstimationOngoing(): boolean {
    return this.$store.getters.estimationState == EstimationState.ONGOING;
  }
}
</script>
