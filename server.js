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

const MODEL = "gemini-3.8-flash";

app.get("/", (req, res) => {
  res.send("City Sport Bot работает!");
});

// Тестовая страница
app.get("/chat", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
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

// Проверка Gemini через браузер
app.post("/chat-test", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
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

// API для будущего виджета City Sport
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(400).json({
        error: "Сообщение отсутствует"
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: message
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
