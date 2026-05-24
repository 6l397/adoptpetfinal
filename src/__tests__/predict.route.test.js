import { POST } from "@/app/api/predict/route";

describe("POST /api/predict", () => {
  const originalMlServiceUrl = process.env.ML_SERVICE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ML_SERVICE_URL = "http://ml-service:8000";
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.ML_SERVICE_URL = originalMlServiceUrl;
  });

  test("проксіює визначення породи до ML-сервісу", async () => {
    const prediction = {
      bestPrediction: { breed: "Husky", confidence: 0.92 },
      topPredictions: [{ breed: "Husky", confidence: 0.92 }],
    };

    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(prediction),
    });

    const request = new Request("http://localhost:3000/api/predict", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/dog.jpg",
        type: "dog",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      "http://ml-service:8000/predict",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          imageUrl: "https://example.com/dog.jpg",
          type: "dog",
        }),
      })
    );
    expect(response.status).toBe(200);
    expect(data).toEqual(prediction);
  });

  test("повертає 400, якщо бракує даних для прогнозу", async () => {
    const request = new Request("http://localhost:3000/api/predict", {
      method: "POST",
      body: JSON.stringify({ imageUrl: "" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("повертає 503, якщо ML-сервіс недоступний", async () => {
    fetch.mockRejectedValue(new Error("ML unavailable"));

    const request = new Request("http://localhost:3000/api/predict", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/dog.jpg",
        type: "dog",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain("ML-сервіс недоступний");
  });
});
