import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cloudinary from "@/lib/cloudinary";
import { verifyAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    const verify = verifyAuth();
    const { searchParams } = new URL(request.url); 
    const id = searchParams.get("id");

    const client = await clientPromise;
    const db = client.db("testdb"); 
    const categories = await db.collection("categories").find({ userId: id }).toArray();

    if (categories.length === 0) {
      return NextResponse.json({ categories, message: "no user found" }, { status: 200 });
    }
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const verify = verifyAuth();
    const body = await request.json();
    const { userId , name , avatar } = body;
    if (!userId || !name || !avatar?.url || !avatar?.public_id) {
      return NextResponse.json({ error: "userId, name, and avatar (url, public_id) are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("testdb");

    const category = { userId, name, avatar };
    const result = await db.collection("categories").insertOne(category);

    category._id = result.insertedId;

    return NextResponse.json({
      message: "Category created successfully",
      category
    }, { status: 200 });
  } catch (error) {
    console.error("Error during creating category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function DELETE(request) {
  const verify = verifyAuth();
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("testdb");

    const category = await db.collection("categories").findOne({ _id: new ObjectId(String(id)) });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete category image
    if (category.avatar?.public_id) {
      await cloudinary.uploader.destroy(category.avatar.public_id);
    }

    // Delete dish images
    const dishes = await db.collection("dishes").find({ categoryId: id }).toArray();
    for (const dish of dishes) {
      if (dish.avatar?.public_id) {
        await cloudinary.uploader.destroy(dish.avatar.public_id);
      }
    }
    await db.collection("dishes").deleteMany({ categoryId: id });

    // Delete category
    const result = await db.collection("categories").deleteOne({ _id: new ObjectId(String(id)) });

    return NextResponse.json({ message: "Category, dishes, and images deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error during deleting category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

