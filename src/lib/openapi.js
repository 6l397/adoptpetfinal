export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "AdoptPet API",
    version: "1.0.0",
    description:
      "API веб-платформи AdoptPet для каталогу адопції, фото, ML-визначення породи, AI-помічника та авторизації.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Catalog", description: "Каталог тварин та окремі оголошення" },
    { name: "Upload", description: "Завантаження фото в Cloudinary" },
    { name: "ML", description: "Визначення породи за фото" },
    { name: "AI Assistant", description: "AI-опис та чат-помічник" },
    { name: "Auth", description: "Auth.js службові маршрути" },
  ],
  paths: {
    "/api/catalog": {
      get: {
        tags: ["Catalog"],
        summary: "Отримати каталог адопції",
        description:
          "Повертає список оголошень для адопції. Загублені та знайдені тварини не потрапляють у цей каталог.",
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Пошук за назвою або описом.",
          },
          {
            name: "type",
            in: "query",
            schema: { type: "string", example: "Коти" },
            description: "Тип тварини.",
          },
          {
            name: "age",
            in: "query",
            schema: { type: "string", example: "1-3 роки" },
            description: "Вікова група.",
          },
          {
            name: "size",
            in: "query",
            schema: { type: "string", example: "Середній" },
            description: "Розмір тварини.",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Номер сторінки.",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 24, default: 9 },
            description: "Кількість записів на сторінку.",
          },
        ],
        responses: {
          200: {
            description: "Список оголошень каталогу.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedPosts" },
              },
            },
          },
        },
      },
    },
    "/api/catalog/{slug}": {
      get: {
        tags: ["Catalog"],
        summary: "Отримати оголошення за slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "ais-samoyed" },
          },
        ],
        responses: {
          200: {
            description: "Дані оголошення.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Post" },
              },
            },
          },
          404: {
            description: "Оголошення не знайдено або недоступне.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Catalog"],
        summary: "Видалити оголошення за slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Оголошення видалено.",
            content: {
              "application/json": {
                schema: { type: "string", example: "Пост видалено" },
              },
            },
          },
        },
      },
    },
    "/api/upload": {
      post: {
        tags: ["Upload"],
        summary: "Завантажити фото",
        description:
          "Приймає зображення до 5 МБ і завантажує його в Cloudinary.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "JPG, PNG або WebP зображення.",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Фото завантажено.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UploadResponse" },
              },
            },
          },
          400: { description: "Файл не передано або файл не є зображенням." },
          500: { description: "Cloudinary не налаштовано або недоступний." },
        },
      },
    },
    "/api/predict": {
      post: {
        tags: ["ML"],
        summary: "Визначити породу за фото",
        description:
          "Передає URL фото до FastAPI ML-сервісу й повертає прогноз породи.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["imageUrl", "type"],
                properties: {
                  imageUrl: {
                    type: "string",
                    format: "uri",
                    example: "https://res.cloudinary.com/demo/image/upload/pet.jpg",
                  },
                  type: {
                    type: "string",
                    enum: ["Коти", "Собаки"],
                    example: "Собаки",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Результат ML-прогнозу.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PredictResponse" },
              },
            },
          },
          400: { description: "Не передано фото або тип тварини." },
          503: { description: "ML-сервіс недоступний." },
        },
      },
    },
    "/api/agent/chat": {
      post: {
        tags: ["AI Assistant"],
        summary: "Отримати рекомендацію AI-помічника",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: {
                    type: "string",
                    example: "Хочу спокійного котика для квартири",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Відповідь AI-помічника.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AgentChatResponse" },
              },
            },
          },
          400: { description: "Повідомлення порожнє." },
          500: { description: "Помилка роботи чат-агента." },
        },
      },
    },
    "/api/agent/description": {
      post: {
        tags: ["AI Assistant"],
        summary: "Згенерувати опис тварини",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Айс" },
                  type: { type: "string", example: "Собаки" },
                  breed: { type: "string", example: "Samoyed" },
                  ageGroups: { type: "string", example: "1-3 роки" },
                  sizes: { type: "string", example: "Великий" },
                  city: { type: "string", example: "Ніжин" },
                  sex: { type: "string", example: "male" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Згенерований опис.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AgentDescriptionResponse" },
              },
            },
          },
          500: { description: "Не вдалося згенерувати опис." },
        },
      },
    },
    "/api/auth/[...nextauth]": {
      get: {
        tags: ["Auth"],
        summary: "Службові GET-маршрути Auth.js",
        responses: {
          200: { description: "Відповідь Auth.js." },
        },
      },
      post: {
        tags: ["Auth"],
        summary: "Службові POST-маршрути Auth.js",
        responses: {
          200: { description: "Відповідь Auth.js." },
        },
      },
    },
  },
  components: {
    schemas: {
      Post: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          desc: { type: "string" },
          slug: { type: "string" },
          img: { type: "string" },
          listingType: {
            type: "string",
            enum: ["adoption", "lost", "found"],
          },
          moderationStatus: {
            type: "string",
            enum: ["pending", "approved", "rejected"],
          },
          type: { type: "string" },
          breed: { type: "string" },
          status: {
            type: "string",
            enum: ["available", "reserved", "adopted"],
          },
          city: { type: "string" },
          sex: { type: "string", enum: ["male", "female", "unknown"] },
        },
      },
      PaginatedPosts: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Post" },
          },
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          pages: { type: "integer" },
        },
      },
      UploadResponse: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
          publicId: { type: "string" },
        },
      },
      PredictResponse: {
        type: "object",
        properties: {
          bestPrediction: { type: "object" },
          topPredictions: {
            type: "array",
            items: { type: "object" },
          },
        },
      },
      AgentChatResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          answer: { type: "string" },
        },
      },
      AgentDescriptionResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          description: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
};
