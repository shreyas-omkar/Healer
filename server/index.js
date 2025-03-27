import express from "express";
import dotenv from "dotenv";
import webhookRoutes from "./routes/webhookRoute.js";
import apiRoutes from "./routes/apiRoutes.js";

dotenv.config();

const app = express();
app.use(express.json()); 

app.use("/webhook", webhookRoutes);
app.use("/api", apiRoutes);


app.post("/", (req, res) => {
  console.log("📡 Webhook received!", req.body);
  res.status(200).send("✅ Webhook received!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
