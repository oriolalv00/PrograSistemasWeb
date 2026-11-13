import dotenv from "dotenv";
import { Server } from "./server.ts";

dotenv.config();

const port = Number(process.env.PORT) || 3000;

const server = new Server(port);
server.listen();