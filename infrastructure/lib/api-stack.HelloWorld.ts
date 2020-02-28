export const handler = async event => {
  console.log("Hello world. Invocation", JSON.stringify(event));
  return { statusCode: 200, body: "Connected." };
};
