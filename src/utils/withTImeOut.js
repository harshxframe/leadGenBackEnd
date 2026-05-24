export const withTimeOut = async (p, ms = 15000) => {
  Promise.race([
    p,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("OPERATION_TIMEOUT"), ms)),
    ),
  ]);
};

