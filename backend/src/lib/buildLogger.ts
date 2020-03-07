export enum Severity {
  ERROR,
  INFO
}

export type Logger = (
  severity: Severity,
  message: string,
  metadata?: object
) => void;

export const buildLogger = (connectionId: string, requestId: string) => (
  severity: Severity,
  message: string,
  metadata?: object
) => {
  const objectToLog = {
    message,
    metadata,
    connectionId,
    requestId
  };

  // see also https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html
  if (severity === Severity.INFO) {
    console.log(JSON.stringify(objectToLog));
  } else {
    console.error(JSON.stringify(objectToLog));
  }
};
