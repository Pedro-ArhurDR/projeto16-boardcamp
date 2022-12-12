import express from "express";
import boardcampRoutes from "./routes/boardcamp.routes.js";
import dotenv from "dotenv";
import cors from "cors"
dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());
app.use(boardcampRoutes);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running in port: ${port}`));
