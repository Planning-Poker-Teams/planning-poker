export const handler = async (event: any) => {
  console.log("Hello world. Invocation", JSON.stringify(event));
  console.log("Body:", event.body);

  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {},
    body: JSON.stringify("OK.")
  };
};
