"use server";

import { revalidatePath } from "next/cache";
import { Post, User, AdoptionForm } from "./models";
import { connectToDb } from "./utils";
import { signIn, signOut } from "./auth";
import bcrypt from "bcryptjs";
import { generateBreedDescription } from "@/lib/generateBreedDescription";

export const addPost = async (prevState, formData) => {
  const {
    title,
    desc,
    slug,
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

    revalidatePath("/catalog");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const deletePost = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    await connectToDb();

    await Post.findByIdAndDelete(id);
    console.log("deleted from db");
    revalidatePath("/catalog");
    revalidatePath("/admin");
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
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

    await Post.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);
    console.log("deleted from db");
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
    console.log("saved to db");

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
    
    const newForm = new AdoptionForm({
      postId: formData.get("postId"),
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