import { POST } from "@/app/api/agent/chat/route";
import { recommendPetsForClient } from "@/lib/agentChain";

jest.mock("@/lib/agentChain", () => ({
  recommendPetsForClient: jest.fn(),
}));

describe("POST /api/agent/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("повертає рекомендацію для коректного повідомлення", async () => {
    recommendPetsForClient.mockResolvedValue(
      "Рекомендую [Луна](/catalog/luna), бо вона спокійна і підходить для квартири."
    );

    const request = new Request("http://localhost:3000/api/agent/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Хочу спокійну тварину для квартири",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(recommendPetsForClient).toHaveBeenCalledWith(
      "Хочу спокійну тварину для квартири"
    );

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.answer).toContain("/catalog/luna");
  });

  test("повертає 400, якщо повідомлення порожнє", async () => {
    const request = new Request("http://localhost:3000/api/agent/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Повідомлення порожнє");
    expect(recommendPetsForClient).not.toHaveBeenCalled();
  });

  test("повертає 500, якщо AI-помічник згенерував помилку", async () => {
    recommendPetsForClient.mockRejectedValue(new Error("OpenAI API error"));

    const request = new Request("http://localhost:3000/api/agent/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Підбери мені собаку",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Помилка роботи чат-агента");
  });
});