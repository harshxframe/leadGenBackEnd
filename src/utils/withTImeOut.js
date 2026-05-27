export const withTimeOut = (p, ms = 15000) => {
  return Promise.race([
    p,

    new Promise((_, rej) =>
      setTimeout(() => {
        rej(new Error("OPERATION_TIMEOUT"));
      }, ms),
    ),
  ]);
};
