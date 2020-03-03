type PokerEvent =
  | UserJoined
  | UserLeft
  | RequestStartEstimation
  | UserEstimate
  | UserHasEstimated
  | RequestShowEstimationResult
  | EstimationResult;

interface UserJoined {
  eventType: "userJoined";
  userName: string;
  isSpectator: boolean;
}

interface UserLeft {
  eventType: "userLeft";
  userName: string;
}

interface RequestStartEstimation {
  eventType: "startEstimation";
  userName: string;
  taskName: string;
  startDate: string;
}

interface UserEstimate {
  eventType: "estimate";
  userName: string;
  taskName: string;
  estimate: string;
}

interface UserHasEstimated {
  eventType: "userHasEstimated";
  userName: string;
  taskName: string;
}

interface RequestShowEstimationResult {
  eventType: "showResult";
  userName: string;
}

interface EstimationResult {
  eventType: "estimationResult";
  taskName: string;
  startDate: string;
  endDate: string;
  estimates: { userName: string; estimate: string }[];
}

interface HeartBeat {
  eventType: "keepAlive";
}
