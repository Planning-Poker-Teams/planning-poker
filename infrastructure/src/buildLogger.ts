export type Logger = (message: string, metadata?: object) => void;

export const buildLogger = (connectionId: string, requestId: string) => (
  message: string,
  metadata?: object
) => {
  console.log(
    JSON.stringify({
      message,
      metadata,
      connectionId,
      requestId
    })
  );
};
