import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
  res.send("City Sport Bot работает!");
});

// Простая страница для проверки бота
app.get("/chat", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>City Sport Bot</title>
    </head>
    <body>
      <h2>City Sport Bot 🤖</h2>

      <form method="POST" action="/chat-test">
        <input
          name="message"
          placeholder="Напиши сообщение"
          style="width:300px;padding:10px"
          required
        >
        <button type="submit">Отправить</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/chat-test", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: req.body.message
    });

    res.send(`
      <h2>Ответ City Sport Bot:</h2>
      <p>${response.text}</p>
      <br>
      <a href="/chat">Назад</a>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка Gemini");
  }
});

// Этот адрес позже будет использовать чат на сайте City Sport
app.post("/chat", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: req.body.message
    });

    res.json({
      reply: response.text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Ошибка Gemini"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`City Sport Bot запущен на порту ${PORT}`);
});
