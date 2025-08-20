import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendMail } from "@/lib/mailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body; // use POST 
    const client = await clientPromise;
    const db = client.db("testdb");

    const user = await db.collection("users").findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" },{status:404});

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    await db.collection("users").updateOne(
  { email },
  { $set: { resetToken: token } }
);
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset?token=${token}`;

    await sendMail(
      email,
      "Reset your password",
      `<h2>Reset Password</h2>
      <p>Click the link to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>`
    );

    return NextResponse.json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" },{status:500});
  }
};