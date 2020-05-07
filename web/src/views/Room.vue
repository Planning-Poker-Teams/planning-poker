<template>
  <div
    class="flex-1 w-full flex flex-col items-center bg-gray-100 lg:shadow-lg lg:rounded-lg overflow-y-visible relative"
  >
    <div class="flex-1 flex flex-col w-full">
      <room-header :participants="participants" :roomName="roomName" />
      <ongoing-estimation
        v-if="isEstimationOngoing"
        :taskName="taskName"
        @send-estimation="sendEstimation"
        @request-result="requestResult"
      />
      <estimation-result v-if="estimationResultAvailable" />
      <start-estimation-form
        v-if="!isEstimationOngoing"
        @start-estimation="startEstimation"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Watch, Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import RoomHeader from '@/components/RoomHeader.vue';
import StartEstimationForm from '@/components/StartEstimationForm.vue';
import OngoingEstimation from '@/components/OngoingEstimation.vue';
import EstimationResult from '@/components/EstimationResult.vue';
import { Participant } from '../store/types';
import { Mutations } from '../store/mutations';
import { Actions } from '../store/actions';
import { EstimationState } from '../store/getters';

@Component({
  components: {
    RoomHeader,
    StartEstimationForm,
    OngoingEstimation,
    EstimationResult,
  },
})
export default class Room extends Vue {
  mounted() {
    const roomNameParam = this.$route.params.roomName;
    const roomName = this.$store.state.room?.name;

    if (!this.$store.state.room || roomName !== roomNameParam) {
      this.$router.push({ name: 'lobby', query: { room: roomNameParam } });
    }
    this.$store.dispatch(Actions.ENTER_ROOM);
  }

  beforeDestroy() {
    this.$store.dispatch(Actions.LEAVE_ROOM);
  }

  startEstimation(taskName: string) {
    this.$store.dispatch(Actions.REQUEST_START_ESTIMATION, taskName);
  }

  sendEstimation(value: string) {
    this.$store.dispatch(Actions.SEND_ESTIMATION, value);
  }

  requestResult() {
    this.$store.dispatch(Actions.REQUEST_RESULT);
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

  get estimationResultAvailable() {
    return this.$store.state.estimationResult !== undefined;
  }
}
</script>
