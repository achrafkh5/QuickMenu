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
    const dishes = await db.collection("dishes").find({ categoryId: id }).toArray();

    if (dishes.length === 0) {
      return NextResponse.json({ dishes, message: "no user found" }, { status: 200 });
    }
    return NextResponse.json(dishes, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const verify = verifyAuth();
    const body = await request.json();
    const { userId, name, avatar,categoryId,price } = body; // avatar should come from Cloudinary upload response

    if (!userId || !name || !avatar?.url || !avatar?.public_id) {
      return NextResponse.json({ error: "userId, name, and avatar (url, public_id) are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("testdb");

    const dish = { userId, name, avatar,categoryId,price };
    const result = await db.collection("dishes").insertOne(dish);

    dish._id = result.insertedId;

    return NextResponse.json({
      message: "dish created successfully",
      dish
    }, { status: 200 });
  } catch (error) {
    console.error("Error during creating dish:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function DELETE(request) {
  try {
    const verify = verifyAuth();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "dish id is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("testdb");

    const dish = await db.collection("dishes").findOne({ _id: new ObjectId(String(id)) });
    if (!dish) {
      return NextResponse.json({ error: "dish not found" }, { status: 404 });
    }

    // Delete dish image
    if (dish.avatar?.public_id) {
      await cloudinary.uploader.destroy(dish.avatar.public_id);
    }

    // Delete dish
    const result = await db.collection("dishes").deleteOne({ _id: new ObjectId(String(id)) });

    return NextResponse.json({ message: "dish and image deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error during deleting dish:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const verify = verifyAuth();
    const body = await request.json();
    const { id,price } = body; // avatar should come from Cloudinary upload response

    if (!id || !price) {
      return NextResponse.json({ error: "id and price are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("testdb");

    const result = await db.collection("dishes").updateOne(
      { _id: new ObjectId(String(id)) }, // ✅ ensure it's a string
      { $set: { price } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Dish not found" },{status:404});
    }

    return NextResponse.json({ message: "Dish updated successfully" },{status:200});
  } catch (error) {
    console.error("Error during updating dish:", error);
    return NextResponse.json({ error: "Internal Server Error" },{status:500});
  }
};

