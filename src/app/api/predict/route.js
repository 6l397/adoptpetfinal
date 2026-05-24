import { NextResponse } from "next/server";

export const runtime = "nodejs";

const getMlServiceUrl = () =>
  process.env.ML_SERVICE_URL || "http://localhost:8000";

export const POST = async (request) => {
  try {
    const { imageUrl, type } = await request.json();

    if (!imageUrl || !type) {
      return NextResponse.json(
        { error: "Потрібні фото та тип тварини." },
        { status: 400 }
      );
    }

    const response = await fetch(`${getMlServiceUrl()}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl, type }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.detail ||
            data.error ||
            "Не вдалося отримати результат ML-сервісу.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "ML-сервіс недоступний. Пост можна створити без визначення породи.",
      },
      { status: 503 }
    );
  }
};
