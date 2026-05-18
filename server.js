import initApp from "./src/app.js";

const app = await initApp();
const port = process.env.PORT || 2020;

app.listen(port, async () => {
  console.log("Server stated at 2000");
});
