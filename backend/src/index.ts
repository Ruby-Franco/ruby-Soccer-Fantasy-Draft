import express from "express";
import cors from "cors";
import draftRouter from "./routes/draft";

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://soccer-wine.vercel.app']
}));
app.use(express.json());

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

/* -------- Root + health -------- */
app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* -------- Routes -------- */
app.use("/draft", draftRouter);

/* -------- Start server (once) -------- */
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Backend running on port ${port}`);
});
