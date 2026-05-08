import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { Post } from "@/lib/models";
import { connectToDb } from "@/lib/utils";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
});

/* ================================
   1. АГЕНТ ДЛЯ АДМІНА — ОПИС ТВАРИНИ
================================ */

const PetDescriptionSchema = z.object({
  headline: z.string(),
  mainText: z.string(),
  personalityTags: z.array(z.string()),
  idealOwner: z.string(),
  specialNeeds: z.string().optional(),
});

const descriptionPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
Ти AI-помічник платформи AdoptPet.
Ти допомагаєш адміністратору створювати описи тварин для адопції українською мовою.

Правила:
- не вигадуй медичні факти;
- не гарантуй характер тварини;
- стиль має бути теплий, доброзичливий і чесний;
- текст має мотивувати людину дізнатися більше про тварину.
`,
  ],
  [
    "human",
    `
Згенеруй опис тварини.

Ім'я: {title}
Тип: {type}
Порода: {breed}
Вік: {ageGroups}
Розмір: {sizes}
Стать: {sex}
Місто: {city}
Поточний опис: {currentDescription}
`,
  ],
]);

export const generatePetDescription = async (petData) => {
  const structuredModel = model.withStructuredOutput(PetDescriptionSchema);
  const chain = descriptionPrompt.pipe(structuredModel);

  return await chain.invoke({
    title: petData.title || "не вказано",
    type: petData.type || "не вказано",
    breed: petData.breed || "не вказано",
    ageGroups: petData.ageGroups || "не вказано",
    sizes: petData.sizes || "не вказано",
    sex: petData.sex || "не вказано",
    city: petData.city || "не вказано",
    currentDescription: petData.currentDescription || "відсутній",
  });
};

/* ================================
   2. АГЕНТ ДЛЯ КЛІЄНТА — РЕКОМЕНДАЦІЯ ТВАРИН
================================ */

const clientPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
Ти віртуальний консультант платформи AdoptPet.
Твоя задача — допомогти користувачу підібрати тварину для адопції.

Ти отримуєш:
1. повідомлення користувача;
2. список доступних тварин із каталогу.

Правила:
- відповідай українською;
- радь тільки тих тварин, які є у списку;
- не вигадуй тварин, яких немає в каталозі;
- якщо підходящих тварин мало, чесно скажи про це;
- пояснюй, чому саме ці тварини можуть підійти;
- якщо радите тварину, обов'язково вставляй посилання у форматі Markdown: [Назва тварини](/catalog/slug)
- не використовуй повні посилання типу https://adoptpet.com, тільки внутрішній шлях /catalog/slug
`,
  ],
  [
    "human",
    `
Запит користувача:
{message}

Доступні тварини:
{pets}
`,
  ],
]);

export const recommendPetsForClient = async (message) => {
  await connectToDb();

  const posts = await Post.find({ status: "available" })
    .select("title slug type breed ageGroups sizes sex city desc status")
    .limit(20)
    .lean();

  const pets = posts
    .map((pet, index) => {
      return `
${index + 1}. ${pet.title}
Тип: ${pet.type}
Порода: ${pet.breed || "не вказано"}
Вік: ${pet.ageGroups}
Розмір: ${pet.sizes}
Стать: ${pet.sex || "не вказано"}
Місто: ${pet.city || "не вказано"}
Опис: ${pet.desc}
Посилання: /catalog/${pet.slug}
`;
    })
    .join("\n");

  const chain = clientPrompt.pipe(model);

  const result = await chain.invoke({
    message,
    pets: pets || "Наразі немає доступних тварин.",
  });

  return result.content;
};