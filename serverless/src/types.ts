interface Participant {
  connectionId: string;
  roomName: string;
  name: string;
  isSpectator: boolean;
}

interface Room {
  roomName: string;
  participants: Participant[];
  currentTaskName?: string;
}

interface Estimate {
  connectionId: string;
  value: string;
}

interface Estimation {
  roomName: string;
  taskName: string;
  estimates: Estimate[];
}
