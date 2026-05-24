import { Animal, Post } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
  const { slug } = params;

  try {
    connectToDb();

    const session = await auth();
    const post = await Post.findOne({ slug });

    if (!post) {
      return NextResponse.json({ error: "Оголошення не знайдено" }, { status: 404 });
    }

    const listingType = post.listingType || "adoption";
    const isPrivateLostFound =
      listingType !== "adoption" &&
      (post.moderationStatus || "approved") !== "approved";
    const isOwner = String(post.userId) === session?.user?.id;

    if (isPrivateLostFound && !isOwner && !session?.user?.isAdmin) {
      return NextResponse.json({ error: "Оголошення не знайдено" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати допис!");
  }
};

export const DELETE = async (request, { params }) => {
  const { slug } = params;

  try {
    connectToDb();

    const post = await Post.findOne({ slug }).select("_id");

    if (post) {
      await Animal.deleteOne({ postId: post._id });
    }

    await Post.deleteOne({ slug });
    return NextResponse.json("Пост видалено");
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося видалити допис!");
  }
};
