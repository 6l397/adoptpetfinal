import { GET } from "@/app/api/catalog/route";
import { Post } from "@/lib/models";
import { connectToDb } from "@/lib/utils";

jest.mock("@/lib/utils", () => ({
  connectToDb: jest.fn(),
}));

jest.mock("@/lib/models", () => ({
  Post: {
    find: jest.fn(),
  },
}));

describe("GET /api/catalog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("повертає список тварин без фільтрів", async () => {
    const mockPosts = [
      {
        title: "Луна",
        type: "cat",
        ageGroups: "young",
        sizes: "small",
        status: "available",
      },
      {
        title: "Рекс",
        type: "dog",
        ageGroups: "adult",
        sizes: "large",
        status: "available",
      },
    ];

    Post.find.mockResolvedValue(mockPosts);

    const request = new Request("http://localhost:3000/api/catalog");

    const response = await GET(request);
    const data = await response.json();

    expect(connectToDb).toHaveBeenCalledTimes(1);
    expect(Post.find).toHaveBeenCalledWith({});
    expect(response.status).toBe(200);
    expect(data).toEqual(mockPosts);
  });

  test("коректно формує query для фільтрів type, age та size", async () => {
    const mockPosts = [
      {
        title: "Мія",
        type: "cat",
        ageGroups: "young",
        sizes: "small",
      },
    ];

    Post.find.mockResolvedValue(mockPosts);

    const request = new Request(
      "http://localhost:3000/api/catalog?type=cat&age=young&size=small"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(Post.find).toHaveBeenCalledWith({
      type: "cat",
      ageGroups: "young",
      sizes: "small",
    });

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPosts);
  });

  test("коректно формує пошуковий запит за текстом", async () => {
    Post.find.mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/catalog?search=лагідна"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(Post.find).toHaveBeenCalledWith({
      $or: [
        { title: { $regex: "лагідна", $options: "i" } },
        { desc: { $regex: "лагідна", $options: "i" } },
      ],
    });

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});