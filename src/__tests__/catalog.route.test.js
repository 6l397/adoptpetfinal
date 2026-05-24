import { GET } from "@/app/api/catalog/route";
import { Post } from "@/lib/models";
import { connectToDb } from "@/lib/utils";

jest.mock("@/lib/utils", () => ({
  connectToDb: jest.fn(),
}));

jest.mock("@/lib/models", () => ({
  Post: {
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

const mockPaginatedFind = (posts) => {
  const query = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(posts),
  };

  Post.find.mockReturnValue(query);
  return query;
};

describe("GET /api/catalog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Post.countDocuments.mockResolvedValue(0);
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

    Post.countDocuments.mockResolvedValue(2);
    const findQuery = mockPaginatedFind(mockPosts);

    const request = new Request("http://localhost:3000/api/catalog");

    const response = await GET(request);
    const data = await response.json();

    expect(connectToDb).toHaveBeenCalledTimes(1);
    expect(Post.find).toHaveBeenCalledWith({
      listingType: { $nin: ["lost", "found"] },
    });
    expect(Post.countDocuments).toHaveBeenCalledWith({
      listingType: { $nin: ["lost", "found"] },
    });
    expect(findQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(findQuery.skip).toHaveBeenCalledWith(0);
    expect(findQuery.limit).toHaveBeenCalledWith(9);
    expect(response.status).toBe(200);
    expect(data).toEqual({
      items: mockPosts,
      total: 2,
      page: 1,
      limit: 9,
      pages: 1,
    });
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

    Post.countDocuments.mockResolvedValue(1);
    const findQuery = mockPaginatedFind(mockPosts);

    const request = new Request(
      "http://localhost:3000/api/catalog?type=cat&age=young&size=small"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(Post.find).toHaveBeenCalledWith({
      listingType: { $nin: ["lost", "found"] },
      type: "cat",
      ageGroups: "young",
      sizes: "small",
    });
    expect(Post.countDocuments).toHaveBeenCalledWith({
      listingType: { $nin: ["lost", "found"] },
      type: "cat",
      ageGroups: "young",
      sizes: "small",
    });
    expect(findQuery.skip).toHaveBeenCalledWith(0);
    expect(findQuery.limit).toHaveBeenCalledWith(9);

    expect(response.status).toBe(200);
    expect(data.items).toEqual(mockPosts);
  });

  test("коректно формує пошуковий запит за текстом", async () => {
    Post.countDocuments.mockResolvedValue(0);
    mockPaginatedFind([]);

    const request = new Request(
      "http://localhost:3000/api/catalog?search=лагідна"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(Post.find).toHaveBeenCalledWith({
      listingType: { $nin: ["lost", "found"] },
      $or: [
        { title: { $regex: "лагідна", $options: "i" } },
        { desc: { $regex: "лагідна", $options: "i" } },
      ],
    });

    expect(response.status).toBe(200);
    expect(data).toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 9,
      pages: 1,
    });
  });

  test("застосовує номер сторінки та розмір сторінки", async () => {
    Post.countDocuments.mockResolvedValue(25);
    const findQuery = mockPaginatedFind([]);

    const request = new Request(
      "http://localhost:3000/api/catalog?page=3&limit=6"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(findQuery.skip).toHaveBeenCalledWith(12);
    expect(findQuery.limit).toHaveBeenCalledWith(6);
    expect(data).toEqual({
      items: [],
      total: 25,
      page: 3,
      limit: 6,
      pages: 5,
    });
    expect(response.status).toBe(200);
  });
});
