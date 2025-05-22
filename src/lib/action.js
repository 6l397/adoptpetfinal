"use server";

import { revalidatePath } from "next/cache";
import { Post, User, AdoptionForm } from "./models";
import { connectToDb } from "./utils";
import { signIn, signOut } from "./auth";
import bcrypt from "bcryptjs";

export const addPost = async (prevState,formData) => {

  const { title, desc, slug, userId, img, type, ageGroups, sizes } = Object.fromEntries(formData);

  try {
    connectToDb();
    const newPost = new Post({ title, desc, slug, userId, img, type, ageGroups, sizes
    });

    await newPost.save();
    console.log("saved to db");
    revalidatePath("/catalog");
    revalidatePath("/admin");
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const deletePost = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDb();

    await Post.findByIdAndDelete(id);
    console.log("deleted from db");
    revalidatePath("/catalog");
    revalidatePath("/admin");
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const addUser = async (prevState,formData) => {
  const { username, email, password, img } = Object.fromEntries(formData);

  try {
    connectToDb();
    const newUser = new User({
      username,
      email,
      password,
      img,
    });

    await newUser.save();
    console.log("saved to db");
    revalidatePath("/admin");
  } catch (err) {
    console.log(err);
    return { error: "Щось пішло не так!" };
  }
};

export const deleteUser = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDb();

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
    connectToDb();

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
    await signIn("credentials", { username, password });
  } catch (err) {
    console.log(err);

    if (err.message.includes("CredentialsSignin")) {
      return { error: "Неправильні логін чи пароль" };
    }
    throw err;
  }
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
    await AdoptionForm.findByIdAndUpdate(id, { status });
    revalidatePath("/admin/forms");
    return { success: true, message: "Статус оновлено!" };
  } catch (err) {
    console.log(err);
    return { success: false, message: "Не вдалося оновити статус" };
  }
};