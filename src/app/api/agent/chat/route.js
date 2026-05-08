import { NextResponse } from "next/server";
import { recommendPetsForClient } from "@/lib/agentChain";

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Повідомлення порожнє" },
        { status: 400 }
      );
    }

    const answer = await recommendPetsForClient(message);

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Помилка роботи чат-агента" },
      { status: 500 }
    );
  }
}