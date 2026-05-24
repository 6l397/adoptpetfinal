import { getAdoptionForms, getAnimals, getPosts, getUsers } from "@/lib/data";
import { AdoptionForm, Animal, Post, User } from "@/lib/models";
import { connectToDb } from "@/lib/utils";

jest.mock("@/lib/utils", () => ({
  connectToDb: jest.fn(),
}));

jest.mock("@/lib/models", () => ({
  AdoptionForm: {
    find: jest.fn(),
  },
  Animal: {
    find: jest.fn(),
  },
  Post: {
    find: jest.fn(),
  },
  User: {
    find: jest.fn(),
  },
}));

describe("admin data filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("filters adoption forms by supported status", async () => {
    const forms = [{ status: "pending" }];
    const populate = jest.fn().mockResolvedValue(forms);

    AdoptionForm.find.mockReturnValue({ populate });

    await expect(getAdoptionForms({ status: "pending" })).resolves.toEqual(
      forms
    );

    expect(connectToDb).toHaveBeenCalledTimes(1);
    expect(AdoptionForm.find).toHaveBeenCalledWith({ status: "pending" });
    expect(populate).toHaveBeenCalledWith("postId");
  });

  test("searches Animal records through linked posts and service fields", async () => {
    const select = jest.fn().mockResolvedValue([{ _id: "post-id" }]);
    const sort = jest.fn().mockResolvedValue([{ _id: "animal-id" }]);
    const populate = jest.fn().mockReturnValue({ sort });

    Post.find.mockReturnValue({ select });
    Animal.find.mockReturnValue({ populate });

    await getAnimals({ search: "Luna." });

    expect(Post.find).toHaveBeenCalledWith({
      $or: [
        { title: { $regex: "Luna\\.", $options: "i" } },
        { type: { $regex: "Luna\\.", $options: "i" } },
        { breed: { $regex: "Luna\\.", $options: "i" } },
        { city: { $regex: "Luna\\.", $options: "i" } },
      ],
    });
    expect(Animal.find).toHaveBeenCalledWith({
      $or: [
        { postId: { $in: ["post-id"] } },
        { foundLocation: { $regex: "Luna\\.", $options: "i" } },
        { foundByName: { $regex: "Luna\\.", $options: "i" } },
        { foundByContact: { $regex: "Luna\\.", $options: "i" } },
        { diseases: { $regex: "Luna\\.", $options: "i" } },
        { "documents.name": { $regex: "Luna\\.", $options: "i" } },
      ],
    });
    expect(populate).toHaveBeenCalledWith(
      "postId",
      "title slug listingType moderationStatus status type breed city"
    );
    expect(sort).toHaveBeenCalledWith({ updatedAt: -1 });
  });

  test("searches admin posts by title and slug", async () => {
    Post.find.mockResolvedValue([{ slug: "luna-cat" }]);

    await getPosts({ search: "luna+" });

    expect(Post.find).toHaveBeenCalledWith({
      $or: [
        { title: { $regex: "luna\\+", $options: "i" } },
        { slug: { $regex: "luna\\+", $options: "i" } },
      ],
    });
  });

  test("searches admin users by username and email", async () => {
    User.find.mockResolvedValue([{ username: "admin" }]);

    await getUsers({ search: "admin@example.com" });

    expect(User.find).toHaveBeenCalledWith({
      $or: [
        { username: { $regex: "admin@example\\.com", $options: "i" } },
        { email: { $regex: "admin@example\\.com", $options: "i" } },
      ],
    });
  });
});
