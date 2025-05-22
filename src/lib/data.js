import { Post, User, AdoptionForm } from "./models";
import { connectToDb } from "./utils";
import { unstable_noStore as noStore } from "next/cache";


export const getPosts = async () => {
  try {
    connectToDb();
    const posts = await Post.find();
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

export const getUser = async (id) => {
  noStore();
  try {
    connectToDb();
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати користувача!");
  }
};

export const getUsers = async () => {
  try {
    connectToDb();
    const users = await User.find();
    return users;
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати користувачів!");
  }
};

export const getAdoptionForms = async () => {
  try {
    connectToDb();
    const forms = await AdoptionForm.find().populate('postId');
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