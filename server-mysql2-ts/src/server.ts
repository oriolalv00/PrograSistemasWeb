import express from "express";
import type { Application } from "express";
import router from "./routes/index.ts";

export class Server {
  private app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.middlewares();
    this.routes();
  }

  private middlewares() {
    // debe ir antes de registrar las rutas
    this.app.use(express.json());
  }

  private routes() {
    this.app.use("/api/v1", router);
    this.app.use((err: any, _req: any, res: any, _next: any) => {
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ message: "invalid JSON body" });
    return;
  }
  res.status(500).json({ message: "internal server error" });
});
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}