import { Animal, Post, User, AdoptionForm } from "./models";
import { connectToDb } from "./utils";
import { unstable_noStore as noStore } from "next/cache";
import { calculateAdminAnalytics } from "./analytics";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getPosts = async ({ search = "" } = {}) => {
  try {
    connectToDb();
    const normalizedSearch = search.trim();
    const searchPattern = normalizedSearch ? escapeRegExp(normalizedSearch) : "";
    const query = normalizedSearch
      ? {
          $or: [
            { title: { $regex: searchPattern, $options: "i" } },
            { slug: { $regex: searchPattern, $options: "i" } },
          ],
        }
      : {};
    const posts = await Post.find(query);
    return posts;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати дописи!");
  }
};

export const getPost = async (slug) => {
  try {
    connectToDb();
    const post = await Post.findOne({ slug });
    return post;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати допис!");
  }
};

export const getLostFoundPosts = async ({
  search = "",
  listingType = "",
  type = "",
  city = "",
} = {}) => {
  try {
    connectToDb();

    const normalizedSearch = search.trim();
    const normalizedCity = city.trim();
    const query = {
      $and: [
        {
          listingType: ["lost", "found"].includes(listingType)
            ? listingType
            : { $in: ["lost", "found"] },
        },
        {
          $or: [
            { moderationStatus: "approved" },
            { moderationStatus: { $exists: false } },
          ],
        },
      ],
    };

    if (type) {
      query.type = type;
    }

    if (normalizedCity) {
      query.city = {
        $regex: escapeRegExp(normalizedCity),
        $options: "i",
      };
    }

    if (normalizedSearch) {
      const searchPattern = escapeRegExp(normalizedSearch);

      query.$or = [
        { title: { $regex: searchPattern, $options: "i" } },
        { desc: { $regex: searchPattern, $options: "i" } },
        { breed: { $regex: searchPattern, $options: "i" } },
        { city: { $regex: searchPattern, $options: "i" } },
      ];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    return posts;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати оголошення про загублених тварин!");
  }
};

export const getLostFoundModerationPosts = async ({
  search = "",
  status = "pending",
} = {}) => {
  try {
    connectToDb();

    const statuses = ["pending", "approved", "rejected"];
    const normalizedSearch = search.trim();
    const query = {
      listingType: { $in: ["lost", "found"] },
    };

    if (statuses.includes(status)) {
      query.moderationStatus = status;
    }

    if (normalizedSearch) {
      const searchPattern = escapeRegExp(normalizedSearch);

      query.$or = [
        { title: { $regex: searchPattern, $options: "i" } },
        { slug: { $regex: searchPattern, $options: "i" } },
        { desc: { $regex: searchPattern, $options: "i" } },
        { breed: { $regex: searchPattern, $options: "i" } },
        { city: { $regex: searchPattern, $options: "i" } },
      ];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    const animals = await Animal.find({
      postId: { $in: posts.map((post) => post._id) },
    });
    const animalsByPostId = animals.reduce((acc, animal) => {
      acc[animal.postId.toString()] = animal;
      return acc;
    }, {});

    return posts.map((post) => ({
      post,
      animal: animalsByPostId[post._id.toString()] || null,
    }));
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати оголошення для модерації!");
  }
};

export const getAnimalByPostId = async (postId) => {
  try {
    connectToDb();
    const animal = await Animal.findOne({ postId });
    return animal;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати дані тварини!");
  }
};

export const getAnimals = async ({ search = "" } = {}) => {
  try {
    connectToDb();
    const normalizedSearch = search.trim();
    let query = {};

    if (normalizedSearch) {
      const searchPattern = escapeRegExp(normalizedSearch);
      const searchablePostIds = await Post.find({
        $or: [
          { title: { $regex: searchPattern, $options: "i" } },
          { type: { $regex: searchPattern, $options: "i" } },
          { breed: { $regex: searchPattern, $options: "i" } },
          { city: { $regex: searchPattern, $options: "i" } },
        ],
      }).select("_id");

      query = {
        $or: [
          { postId: { $in: searchablePostIds.map((post) => post._id) } },
          { foundLocation: { $regex: searchPattern, $options: "i" } },
          { foundByName: { $regex: searchPattern, $options: "i" } },
          { foundByContact: { $regex: searchPattern, $options: "i" } },
          { diseases: { $regex: searchPattern, $options: "i" } },
          { "documents.name": { $regex: searchPattern, $options: "i" } },
        ],
      };
    }

    const animals = await Animal.find(query)
      .populate("postId", "title slug listingType moderationStatus status type breed city")
      .sort({ updatedAt: -1 });
    return animals;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати картки тварин!");
  }
};

export const getUser = async (id) => {
  noStore();
  try {
    connectToDb();
    const user = await User.findById(id).select("-password");
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати користувача!");
  }
};

export const getUserPosts = async (userId) => {
  try {
    connectToDb();
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    return posts;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати оголошення користувача!");
  }
};

export const getUserAdoptionForms = async (email) => {
  try {
    connectToDb();
    const forms = await AdoptionForm.find({ email })
      .populate("postId")
      .sort({ createdAt: -1 });
    return forms;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати заявки користувача!");
  }
};

export const getUsers = async ({ search = "" } = {}) => {
  try {
    connectToDb();
    const normalizedSearch = search.trim();
    const searchPattern = normalizedSearch ? escapeRegExp(normalizedSearch) : "";
    const query = normalizedSearch
      ? {
          $or: [
            { username: { $regex: searchPattern, $options: "i" } },
            { email: { $regex: searchPattern, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(query);
    return users;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати користувачів!");
  }
};

export const getAdoptionForms = async ({ status = "" } = {}) => {
  try {
    connectToDb();
    const statuses = ["pending", "approved", "rejected"];
    const query = statuses.includes(status) ? { status } : {};
    const forms = await AdoptionForm.find(query).populate('postId');
    return forms;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати форми!");
  }
};

export const getAdoptionForm = async (id) => {
  try {
    connectToDb();
    const form = await AdoptionForm.findById(id).populate('postId');
    return form;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати форму!");
  }
};

export const getAdminAnalytics = async () => {
  noStore();

  try {
    connectToDb();

    const posts = await Post.find({}).lean();
    const forms = await AdoptionForm.find({}).lean();
    const users = await User.find({}).select("_id").lean();

    return calculateAdminAnalytics({ posts, forms, users });
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати аналітику адмінки!");
  }
};
