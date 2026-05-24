import {
  addPost,
  deletePost,
  submitLostFoundReport,
  updateAnimal,
  updatePostModerationStatus,
} from "@/lib/action";
import { Animal, Post } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { auth } from "@/lib/auth";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
  connectToDb: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@/lib/generateBreedDescription", () => ({
  generateBreedDescription: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("@/lib/models", () => {
  const Post = jest.fn((data) => ({
    ...data,
    _id: "post-id",
    save: jest.fn(),
  }));

  Post.findOne = jest.fn();
  Post.findByIdAndDelete = jest.fn();
  Post.findByIdAndUpdate = jest.fn();

  const Animal = jest.fn((data) => ({
    ...data,
    save: jest.fn(),
  }));

  Animal.deleteOne = jest.fn();
  Animal.findByIdAndUpdate = jest.fn();

  return {
    Animal,
    Post,
    User: {},
    AdoptionForm: {},
  };
});

const buildPostFormData = () => {
  const formData = new FormData();

  formData.set("title", "Luna");
  formData.set("desc", "Calm cat");
  formData.set("slug", "luna");
  formData.set("userId", "user-id");
  formData.set("img", "https://example.com/luna.jpg");
  formData.set("type", "Коти");
  formData.set("ageGroups", "До 1 року");
  formData.set("sizes", "Малий");
  formData.set("animalFoundLocation", "Central park");
  formData.set("animalFoundByName", "Oksana");
  formData.set("animalFoundByContact", "+380000000000");
  formData.set("animalDiseases", "Flea allergy\nRecovered fracture\n");
  formData.set(
    "animalDocuments",
    "Vaccination passport | https://example.com/passport.pdf\nVet note"
  );

  return formData;
};

describe("post and animal synchronization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Post.findOne.mockResolvedValue(null);
    Post.findByIdAndDelete.mockResolvedValue(null);
    Post.findByIdAndUpdate.mockResolvedValue(null);
    Animal.deleteOne.mockResolvedValue(null);
    Animal.findByIdAndUpdate.mockResolvedValue(null);
    auth.mockResolvedValue({ user: { id: "user-id" } });
  });

  test("creates an Animal record when a Post is created", async () => {
    const result = await addPost(undefined, buildPostFormData());

    expect(connectToDb).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
    expect(Animal).toHaveBeenCalledWith({
      postId: "post-id",
      foundLocation: "Central park",
      foundByName: "Oksana",
      foundByContact: "+380000000000",
      diseases: ["Flea allergy", "Recovered fracture"],
      documents: [
        {
          name: "Vaccination passport",
          url: "https://example.com/passport.pdf",
        },
        {
          name: "Vet note",
          url: "",
        },
      ],
    });
  });

  test("deletes the Animal record when its Post is deleted", async () => {
    const formData = new FormData();
    formData.set("id", "post-id");

    await deletePost(formData);

    expect(Animal.deleteOne).toHaveBeenCalledWith({ postId: "post-id" });
    expect(Post.findByIdAndDelete).toHaveBeenCalledWith("post-id");
  });

  test("updates editable Animal fields from admin form values", async () => {
    const formData = new FormData();
    formData.set("id", "animal-id");
    formData.set("foundLocation", "Shelter gate");
    formData.set("foundByName", "Ihor");
    formData.set("foundByContact", "ihor@example.com");
    formData.set("diseases", "Needs dental check\nVaccinated");
    formData.set(
      "documents",
      "Sterilization note | https://example.com/sterilization.pdf\nPhoto consent"
    );

    const result = await updateAnimal(formData);

    expect(result).toEqual({ success: true });
    expect(Animal.findByIdAndUpdate).toHaveBeenCalledWith(
      "animal-id",
      {
        foundLocation: "Shelter gate",
        foundByName: "Ihor",
        foundByContact: "ihor@example.com",
        diseases: ["Needs dental check", "Vaccinated"],
        documents: [
          {
            name: "Sterilization note",
            url: "https://example.com/sterilization.pdf",
          },
          {
            name: "Photo consent",
            url: "",
          },
        ],
      },
      { runValidators: true }
    );
  });

  test("creates public lost/found submissions as pending moderation", async () => {
    const formData = new FormData();
    formData.set("listingType", "lost");
    formData.set("title", "Lost cat Luna");
    formData.set("desc", "Last seen near the park");
    formData.set("img", "https://example.com/lost-luna.jpg");
    formData.set("type", "Коти");
    formData.set("ageGroups", "До 1 року");
    formData.set("sizes", "Малий");
    formData.set("city", "Чернівці");
    formData.set("foundLocation", "Central park");
    formData.set("reporterName", "Oksana");
    formData.set("reporterEmail", "oksana@example.com");

    const result = await submitLostFoundReport(undefined, formData);

    expect(result).toEqual({
      success: true,
      message: "Дякуємо. Оголошення надіслано на модерацію.",
    });
    expect(Post).toHaveBeenCalledWith(
      expect.objectContaining({
        listingType: "lost",
        moderationStatus: "pending",
        userId: "user-id",
        status: "available",
      })
    );
    expect(Animal).toHaveBeenCalledWith(
      expect.objectContaining({
        foundLocation: "Central park",
        foundByName: "Oksana",
        foundByContact: "oksana@example.com",
      })
    );
  });

  test("updates post moderation status from admin controls", async () => {
    const formData = new FormData();
    formData.set("id", "post-id");
    formData.set("moderationStatus", "approved");

    const result = await updatePostModerationStatus(formData);

    expect(result).toEqual({ success: true });
    expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
      "post-id",
      { moderationStatus: "approved" },
      { runValidators: true }
    );
  });
});
