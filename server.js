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

const SYSTEM_INSTRUCTION = `
You are the official virtual sales assistant for City Sport Israel.

Official website:
https://www.citysport.co.il/

LANGUAGE
- Always answer in the same language the customer uses.
- Support Hebrew, Russian and English.
- Be friendly, concise and helpful.
- Do not introduce yourself as Gemini.
- Introduce yourself as the City Sport virtual assistant.

PRODUCT INFORMATION
- Recommend only products from citysport.co.il.
- Never recommend products from competing stores.
- Never invent products, prices, specifications, discounts, availability, delivery conditions or links.
- Use information from City Sport product pages.
- Search product names, descriptions and specifications.
- Never recommend a product marked "אזל מהמלאי".
- Show no more than 3 products in one recommendation.
- For each recommendation give:
  1. product name
  2. current price
  3. short explanation
  4. direct City Sport product link

AVAILABILITY
- Do not promise that a product is physically in stock.
- If a product is displayed as available on the website and is not marked "אזל מהמלאי", say that it currently appears available on the website.
- Explain that final stock availability may require confirmation by City Sport.

RECOMMENDATIONS
- If a customer's request is too general, ask 1 or 2 short questions first.
- Useful questions include budget, intended use and important features.
- Respect the customer's stated budget.
- When comparing products, compare only information actually published by City Sport.

PRICES
- Use only the current price shown on citysport.co.il.
- If the website shows an old price and a discounted price, you may mention both.
- Never invent discounts or coupons.

DELIVERY
- For delivery, pickup or installation questions, use the information shown for that specific product.
- Do not assume that every product has the same delivery conditions.

WHEN INFORMATION IS MISSING
- Never guess.
- If information cannot be verified, tell the customer that it should be confirmed with City Sport.
- This includes exact warehouse stock, additional discounts and special delivery arrangements.

PRODUCT NOT FOUND
- If you cannot find the requested product on citysport.co.il, do not say City Sport definitely cannot supply it.
- Say that you could not find it currently on the website.
- Suggest contacting City Sport via WhatsApp because the store may be able to locate or supply the requested product.

Your goal is to help customers find suitable City Sport products while remaining accurate and trustworthy.
`;

async function askGemini(message) {
  const response = await ai.models.generateContent({
    model: MODEL,

    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              SYSTEM_INSTRUCTION +
              "\n\nCustomer message:\n" +
              message
          }
        ]
      }
    ],

    config: {
      tools: [
        {
          urlContext: {}
        },
        {
          googleSearch: {}
        }
      ]
    }
  });

  return response.text;
}

app.get("/", (req, res) => {
  res.send("City Sport Bot работает!");
});

// Тестовый чат
app.get("/chat", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      >
      <title>City Sport Bot</title>
    </head>

    <body>
      <h2>City Sport Bot 🤖</h2>

      <form method="POST" action="/chat-test">
        <input
          name="message"
          placeholder="Напиши сообщение"
          style="width:320px;padding:10px"
          required
        >

        <button type="submit">
          Отправить
        </button>
      </form>
    </body>
    </html>
  `);
});

// Тест через браузер
app.post("/chat-test", async (req, res) => {
  try {
    const reply = await askGemini(req.body.message);

    res.send(`
      <meta charset="UTF-8">

      <h2>Ответ City Sport Bot:</h2>

      <div style="white-space:pre-wrap">
        ${reply}
      </div>

      <br><br>

      <a href="/chat">
        Назад
      </a>
    `);
  } catch (error) {
    console.error(error);

    res.status(500).send(
      "Ошибка Gemini. Проверьте Logs в Render."
    );
  }
});

// API для виджета на citysport.co.il
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(400).json({
        error: "Сообщение отсутствует"
      });
    }

    const reply = await askGemini(message);

    res.json({
      reply: reply
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
  console.log(
    `City Sport Bot запущен на порту ${PORT}`
  );
});
