import jwt from "jsonwebtoken"
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url); 
    const token = searchParams.get("token");
 
    const client = await clientPromise;
    const db = client.db("testdb"); 

  if (!token) {
    return NextResponse.json({ error: "Token is required" },{status:400});
  }

    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user with matching email and resetToken
    const user = await db.collection("users").findOne({
      email: decoded.email,
      resetToken: token
    });

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/verify-failed`);
    }

    // Update user to verified = true and remove the token
    await db.collection("users").updateOne(
      { email: decoded.email },
      { $set: { verified: true }, $unset: { resetToken: "" } }
    );

    // Redirect to frontend success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/verified`);
  } catch (err) {
    console.error("Error verifying token:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/verify-failed`);
  }
};