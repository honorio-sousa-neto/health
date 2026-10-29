import "dotenv/config";
import { createApplication } from "./app";

const { server } = createApplication();
const port = process.env.PORT || 8020;
process.on("unhandledRejection", (reason) => console.error("[unhandledRejection]", reason));
server.listen(port, undefined, () => console.log(`App running on port ${port}`));
