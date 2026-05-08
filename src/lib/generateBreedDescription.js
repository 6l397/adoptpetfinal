import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function generateBreedDescription(breed, type) {
  const prompt = `
Ти експерт по породах тварин.

Для породи "${breed}" створи:

1. Короткий опис породи (2 речення)
2. Масив із 5 коротких характеристик

Тип тварини: ${type}

Вимоги:
- українська мова без граматичних помилок;
- не використовуй дивні або неперевірені твердження;
- опис має бути простий, грамотний і корисний для майбутнього власника;
- характеристики мають бути прикметниками в називному відмінку: "активний", "дружелюбний", "розумний".

Поверни відповідь СТРОГО у JSON форматі:

{
  "description": "текст",
  "traits": ["trait1", "trait2", "trait3"]
}

Усі відповіді українською без помилок.
`;

  const response = await llm.invoke(prompt);

  try {
    const cleaned = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Помилка парсингу AI:", err);

    return {
      description: response.content,
      traits: [],
    };
  }
}