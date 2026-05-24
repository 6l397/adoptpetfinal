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
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 9, 1),
      24
    );

    let query = {
      listingType: { $nin: ["lost", "found"] },
    };
    
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

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      items: posts,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
    
  } catch (err) {
    console.log(err);
    throw new Error("Не вдалося отримати дописи!");
  }
};
