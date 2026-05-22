import { POST } from "@/app/api/agent/description/route";
import { generatePetDescription } from "@/lib/agentChain";

jest.mock("@/lib/agentChain", () => ({
  generatePetDescription: jest.fn(),
}));

describe("POST /api/agent/description", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("повертає структурований AI-опис тварини", async () => {
    const mockDescription = {
      headline: "Лагідна киця шукає дім",
      mainText: "Мія — спокійна та ніжна киця, яка добре підійде для квартири.",
      personalityTags: ["спокійна", "лагідна", "домашня"],
      idealOwner: "Людина, яка хоче спокійного компаньйона.",
      specialNeeds: "Потребує регулярного догляду.",
    };

    generatePetDescription.mockResolvedValue(mockDescription);

    const request = new Request(
      "http://localhost:3000/api/agent/description",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Мія",
          type: "cat",
          breed: "Maine",
          ageGroups: "young",
          sizes: "small",
          sex: "female",
          city: "Чернівці",
          currentDescription: "Добра домашня кішка.",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(generatePetDescription).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.description).toEqual(mockDescription);
    expect(data.description.personalityTags).toContain("лагідна");
  });

  test("повертає 500, якщо генерація опису завершилась помилкою", async () => {
    generatePetDescription.mockRejectedValue(new Error("OpenAI error"));

    const request = new Request(
      "http://localhost:3000/api/agent/description",
      {
        method: "POST",
        body: JSON.stringify({
          title: "Мія",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Не вдалося згенерувати опис");
  });
});