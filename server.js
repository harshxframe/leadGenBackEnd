import initApp from "./src/app.js";
//import ngrok from "@ngrok/ngrok";

const app = await initApp();
const port = process.env.ENVIRONTMENT==="development"? 2000:process.env.PORT;


app.listen(port, async () => {
  console.log("Server stated at"+port);
  // try {
  //   // 3. Automatically spin up the ngrok tunnel
  //   const listener = await ngrok.forward({
  //     addr: port,
  //     authtoken: process.env.NGROK_AUTHTOKEN,
  //   });

  //   // 4. Output the new public HTTPS URL
  //   console.log(`🚀 Public URL: ${listener.url()}`);
  // } catch (err) {
  //   console.error("Error starting ngrok tunnel:", err);
  // }
});
