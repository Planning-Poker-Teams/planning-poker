<template>
  <div
    class="h-full w-full flex flex-col items-center bg-gray-100 lg:shadow-lg lg:rounded-lg relative overflow-y-scroll"
  >
    <room-header :participants="participants" :room-name="roomName" />
    <ongoing-estimation
      v-if="isEstimationOngoing"
      :task-name="taskName"
      @send-estimation="sendEstimation"
      @request-result="requestResult"
    />
    <estimation-result v-if="estimationResultAvailable" />
    <start-estimation-form v-if="!isEstimationOngoing" @start-estimation="startEstimation" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Store, useStore } from 'vuex';
import EstimationResult from '../components/EstimationResult.vue';
import OngoingEstimation from '../components/OngoingEstimation.vue';
import RoomHeader from '../components/RoomHeader.vue';
import StartEstimationForm from '../components/StartEstimationForm.vue';
import { ActionType } from '../store/actions';
import { EstimationState } from '../store/getters';
import { State } from '../store/types';

export default defineComponent({
  components: {
    RoomHeader,
    StartEstimationForm,
    OngoingEstimation,
    EstimationResult,
  },
  setup() {
    const store: Store<State> = useStore();
    const route = useRoute();
    const router = useRouter();

    const participants = toRef(store.state, 'participants');
    const taskName = computed(() => {
      if (typeof store.state.ongoingEstimation === 'undefined') {
        return '';
      }

      return store.state.ongoingEstimation.taskName;
    });
    const roomName = computed(() => {
      if (typeof store.state.room === 'undefined') {
        return '';
      }

      return store.state.room.name;
    });

    onMounted(() => {
      const roomNameParam = route.params.roomName;
      if (!store.state.room || roomName.value !== roomNameParam) {
        router.push({ name: 'lobby', query: { room: roomNameParam } });
      }
      store.dispatch(ActionType.ENTER_ROOM);
    });
    onUnmounted(() => {
      store.dispatch(ActionType.LEAVE_ROOM);
    });

    const isEstimationOngoing = computed(
      () => store.getters.estimationState == EstimationState.ONGOING
    );
    const estimationResultAvailable = computed(() => store.state.estimationResult !== undefined);
    const startEstimation = async (taskName: string) => {
      store.dispatch(ActionType.REQUEST_START_ESTIMATION, taskName);
    };
    const sendEstimation = async (value: string) => {
      store.dispatch(ActionType.SEND_ESTIMATION, value);
    };
    const requestResult = async () => {
      store.dispatch(ActionType.REQUEST_RESULT);
    };

    return {
      participants,
      roomName,
      taskName,
      isEstimationOngoing,
      estimationResultAvailable,
      startEstimation,
      sendEstimation,
      requestResult,
    };
  },
});
</script>
