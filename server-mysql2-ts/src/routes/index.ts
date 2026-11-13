import { Router } from "express";
import productsRouter from "./products.routes.ts";

const router = Router();

router.use("/products", productsRouter);

export default router;