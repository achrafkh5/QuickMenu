import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;
    if (!token || !newPassword)
    return NextResponse.json({ error: "Token and password required" },{status:404});

    const client = await clientPromise;
    const db = client.db("testdb");
    // decode the token without verifying expiration yet
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find user with the same email and the same reset token
    const user = await db.collection("users").findOne({
      email: decoded.email,
      resetToken: token
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" },{status:400});
    }

    // hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // update password and remove the reset token
    await db.collection("users").updateOne(
      { email: decoded.email },
      { $set: { password: hashedPassword }, $unset: { resetToken: "" } }
    );

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid or expired token" },{status:400});
  }
};