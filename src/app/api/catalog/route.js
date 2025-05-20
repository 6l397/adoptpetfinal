import { Post } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  try {
    connectToDb();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const age = searchParams.get("age");
    const size = searchParams.get("size");

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } }
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (age) {
      query.ageGroups = age;
    }
    
    if (size) {
      query.sizes = size;
    }

    const posts = await Post.find(query);
    return NextResponse.json(posts);
    
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати дописи!");
  }
};