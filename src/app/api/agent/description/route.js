import { NextResponse } from "next/server";
import { generatePetDescription } from "@/lib/agentChain";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await generatePetDescription(body);

    return NextResponse.json({
      success: true,
      description: result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Не вдалося згенерувати опис" },
      { status: 500 }
    );
  }
}