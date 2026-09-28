import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("City Sport Bot работает!");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message
    });

    res.json({
      reply: response.text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Ошибка бота"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`City Sport Bot запущен на порту ${PORT}`);
});
