import initApp from "./src/app.js";
import logger from "./src/utils/logger.js";

const app = await initApp();
const port = process.env.ENVIRONTMENT==="development"? 2000:process.env.PORT;


app.listen(port, async () => {
  logger.info("Server stated at:"+port);
});
