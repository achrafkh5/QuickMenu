import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const userId = await verifyAuth(); // contains { id, email, ... }
console.log("decoded:",userId.id)
if(!userId.id) return console.log("there is no userId", userId.id)
    const client = await clientPromise;
    const db = client.db("testdb");

    const user = await db.collection("users").findOne({_id: new ObjectId(userId.id)});

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }

    delete user.password;
    delete user.resetToken;

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error during fetching user:", error);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
