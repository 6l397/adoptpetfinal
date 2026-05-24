"use server";

import { revalidatePath } from "next/cache";
import { Animal, Post, User, AdoptionForm } from "./models";
import { connectToDb } from "./utils";
import { auth, signIn, signOut } from "./auth";
import bcrypt from "bcryptjs";
import { generateBreedDescription } from "@/lib/generateBreedDescription";

const parseLines = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseAnimalDocuments = (value) =>
  parseLines(value)
    .map((line) => {
      const [name, ...urlParts] = line.split("|");

      return {
        name: name.trim(),
        url: urlParts.join("|").trim(),
      };
    })
    .filter((document) => document.name);

const createSlugBase = (value) => {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "lost-found";
};

const buildUniqueSlug = async (title) => {
  const base = createSlugBase(title);
  let slug = `${base}-${Date.now()}`;
  let index = 1;

  while (await Post.findOne({ slug })) {
    slug = `${base}-${Date.now()}-${index}`;
    index += 1;
  }

  return slug;
};

export const addPost = async (prevState, formData) => {
  const {
    title,
    desc,
    slug,
    listingType,
    userId,
    img,
    type,
    ageGroups,
    sizes,
    breed,
    breedConfidence,
    mlPredictions,
    status,
    city,
    sex,
    animalFoundLocation,
    animalFoundByName,
    animalFoundByContact,
    animalDiseases,
    animalDocuments,
  } = Object.fromEntries(formData);

  if (!title || !desc || !slug || !userId || !img || !type || !ageGroups || !sizes) {
    return { error: "Заповніть усі обов'язкові поля" };
  }

  try {
    await connectToDb();

    const existingPost = await Post.findOne({ slug });

    if (existingPost) {
      return { error: "Тварина з таким slug уже існує" };
    }

    let parsedPredictions = [];

    try {
      parsedPredictions = mlPredictions ? JSON.parse(mlPredictions) : [];
    } catch {
      parsedPredictions = [];
    }

     let breedDescription = "";
     let breedTraits = [];

    if (breed) {
      const aiData = await generateBreedDescription(breed, type);

      breedDescription = aiData.description;
      breedTraits = aiData.traits;
    }

    const newPost = new Post({
      title,
      desc,
      slug,
      listingType: listingType || "adoption",
      moderationStatus: "approved",
      userId,
      img,
      type,
      ageGroups,
      sizes,
      breed,
      breedDescription,
      breedTraits,
      breedConfidence: breedConfidence ? Number(breedConfidence) : null,
      mlPredictions: parsedPredictions,
      status,
      city,
      sex,
    });

    await newPost.save();

    try {
      const newAnimal = new Animal({
        postId: newPost._id,
        foundLocation: animalFoundLocation,
        foundByName: animalFoundByName,
        foundByContact: animalFoundByContact,
        diseases: parseLines(animalDiseases),
        documents: parseAnimalDocuments(animalDocuments),
      });

      await newAnimal.save();
    } catch (animalErr) {
      await Post.findByIdAndDelete(newPost._id);
      throw animalErr;
    }

    revalidatePath("/catalog");
    revalidatePath("/lost-found");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const submitLostFoundReport = async (prevState, formData) => {
  const {
    listingType,
    title,
    desc,
    img,
    type,
    ageGroups,
    sizes,
    breed,
    city,
    sex,
    foundLocation,
    reporterName,
    reporterEmail,
    reporterPhone,
  } = Object.fromEntries(formData);
  const session = await auth();
  const allowedListingTypes = ["lost", "found"];
  const contact = [reporterEmail, reporterPhone]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(" | ");

  if (
    !allowedListingTypes.includes(listingType) ||
    !title ||
    !desc ||
    !type ||
    !ageGroups ||
    !sizes ||
    !reporterName ||
    !contact ||
    !session?.user?.id
  ) {
    return {
      success: false,
      message:
        "Увійдіть в акаунт, заповніть обов'язкові поля та залиште хоча б один контакт.",
    };
  }

  try {
    await connectToDb();

    const slug = await buildUniqueSlug(title);
    const newPost = new Post({
      title,
      desc,
      slug,
      listingType,
      moderationStatus: "pending",
      userId: session.user.id,
      img: img || "/cat.jpg",
      type,
      ageGroups,
      sizes,
      breed,
      status: "available",
      city,
      sex,
    });

    await newPost.save();

    try {
      const newAnimal = new Animal({
        postId: newPost._id,
        foundLocation,
        foundByName: reporterName,
        foundByContact: contact,
      });

      await newAnimal.save();
    } catch (animalErr) {
      await Post.findByIdAndDelete(newPost._id);
      throw animalErr;
    }

    revalidatePath("/admin");

    return {
      success: true,
      message: "Дякуємо. Оголошення надіслано на модерацію.",
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Не вдалося надіслати оголошення. Спробуйте ще раз.",
    };
  }
};

export const deletePost = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    await connectToDb();

    await Animal.deleteOne({ postId: id });
    await Post.findByIdAndDelete(id);
    revalidatePath("/catalog");
    revalidatePath("/lost-found");
    revalidatePath("/admin");
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const updatePostListingType = async (formData) => {
  const { id, listingType } = Object.fromEntries(formData);
  const listingTypes = ["adoption", "lost", "found"];

  if (!id || !listingTypes.includes(listingType)) {
    return { success: false };
  }

  try {
    await connectToDb();

    await Post.findByIdAndUpdate(
      id,
      { listingType },
      { runValidators: true }
    );

    revalidatePath("/admin");
    revalidatePath("/catalog");
    revalidatePath("/lost-found");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const updatePostModerationStatus = async (formData) => {
  const { id, moderationStatus } = Object.fromEntries(formData);
  const statuses = ["pending", "approved", "rejected"];

  if (!id || !statuses.includes(moderationStatus)) {
    return { success: false };
  }

  try {
    await connectToDb();

    await Post.findByIdAndUpdate(
      id,
      { moderationStatus },
      { runValidators: true }
    );

    revalidatePath("/admin");
    revalidatePath("/lost-found");
    revalidatePath("/catalog");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const updateAnimal = async (formData) => {
  const {
    id,
    foundLocation,
    foundByName,
    foundByContact,
    diseases,
    documents,
  } = Object.fromEntries(formData);

  if (!id) {
    return { success: false, error: "Не знайдено картку тварини" };
  }

  try {
    await connectToDb();

    await Animal.findByIdAndUpdate(
      id,
      {
        foundLocation,
        foundByName,
        foundByContact,
        diseases: parseLines(diseases),
        documents: parseAnimalDocuments(documents),
      },
      { runValidators: true }
    );

    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, error: "Не вдалося оновити картку тварини" };
  }
};

export const updateProfilePhoto = async (prevState, formData) => {
  const session = await auth();
  const img = String(formData.get("img") || "").trim();

  if (!session?.user?.id) {
    return { success: false, message: "Увійдіть в акаунт, щоб оновити фото." };
  }

  if (!img) {
    return { success: false, message: "Спочатку завантажте фото або вставте URL." };
  }

  try {
    await connectToDb();

    await User.findByIdAndUpdate(
      session.user.id,
      { img },
      { runValidators: true }
    );

    revalidatePath("/profile");
    revalidatePath("/admin");

    return { success: true, message: "Фото профілю оновлено." };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Не вдалося оновити фото профілю." };
  }
};

export const addUser = async (prevState, formData) => {
  const { username, email, password, img, isAdmin } = Object.fromEntries(formData);

  if (!username || !email || !password) {
    return { error: "Заповніть логін, пошту і пароль" };
  }

  try {
    await connectToDb();

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return { error: "Користувач з таким логіном або поштою вже існує" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      img,
      isAdmin: isAdmin === "true",
    });

    await newUser.save();

    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const deleteUser = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    await connectToDb();

    const posts = await Post.find({ userId: id }).select("_id");
    const postIds = posts.map((post) => post._id);

    await Animal.deleteMany({ postId: { $in: postIds } });
    await Post.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);
    revalidatePath("/admin");
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const handleLogout = async () => {
  "use server";
  await signOut();
};

export const register = async (previousState, formData) => {
  const { username, email, password, img, passwordRepeat } =
    Object.fromEntries(formData);

  if (password !== passwordRepeat) {
    return { error: "Паролі не збігаються" };
  }

  try {
    await connectToDb();

    const user = await User.findOne({ username });

    if (user) {
      return { error: "Користувач уже існує" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      img,
    });

    await newUser.save();

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const login = async (prevState, formData) => {
  const { username, password } = Object.fromEntries(formData);

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/",
    });
  } catch (err) {
    if (err?.digest?.includes("NEXT_REDIRECT")) {
      throw err;
    }

    console.log(err);

    if (err.message?.includes("CredentialsSignin")) {
      return { error: "Неправильні логін чи пароль" };
    }

    return { error: "Помилка входу" };
  }
};

export const loginWithGoogle = async () => {
  "use server";

  await signIn("google", {
    redirectTo: "/",
  });
};  

export const submitAdoptionForm = async (prevState, formData) => {
  try {
    await connectToDb();
    const postId = formData.get("postId");
    const post = await Post.findById(postId);

    if (
      !post ||
      (post.listingType || "adoption") !== "adoption" ||
      post.status !== "available"
    ) {
      return {
        success: false,
        message: "Ця тварина зараз недоступна для адопції.",
      };
    }
    
    const newForm = new AdoptionForm({
      postId,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      experience: formData.get("experience"),
      message: formData.get("message")
    });

    await newForm.save();

    revalidatePath("/admin");

    return {
      success: true,
      message: "Дякуємо за заявку! Ми зв'яжемося з вами найближчим часом."
    };
  } catch (err) {
    console.error("Помилка при збереженні форми:", err);
    return {
      success: false,
      message: "Сталася помилка при відправці форми. Спробуйте ще раз."
    };
  }
};

export const updateAdoptionFormStatus = async (formData) => {
  const { id, status } = Object.fromEntries(formData);

  try {
    await connectToDb();

    const form = await AdoptionForm.findById(id);

    if (!form) {
      return { success: false };
    }

    await AdoptionForm.findByIdAndUpdate(id, { status });

    if (status === "approved") {
      
      await AdoptionForm.updateMany(
        { postId: form.postId, _id: { $ne: id } },
        { status: "rejected" }
      );

      
      await Post.findByIdAndUpdate(form.postId, {
        status: "reserved",
      });
    }

    if (status === "rejected") {
      
      const remaining = await AdoptionForm.find({
        postId: form.postId,
        status: "approved",
      });

      if (remaining.length === 0) {
        await Post.findByIdAndUpdate(form.postId, {
          status: "available",
        });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/catalog");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};
