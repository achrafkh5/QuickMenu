import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "@/lib/mailer";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
  const { username, password, email, slug, phone,avatar } = body;
  if (!username || !password || !email || !slug || !phone || !avatar) {
    return NextResponse.json({ error: "required all the inputs" },{status:404});
  }
  const client = await clientPromise;
    const db = client.db("testdb");

    const checkEmail = await db.collection("users").findOne({email});
    const checkPhone = await db.collection("users").findOne({phone});
    if(checkEmail) return NextResponse.json({ error: "Email found" },{status:409});
    if(checkPhone) return NextResponse.json({ error: "Phone found" },{status:409});


    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      email,
      slug,
      phone,
      avatar,
      verified:false,
    });
    console.log(`User ${email} signed up successfully`);
    const token = jwt.sign({email} , process.env.JWT_SECRET, { expiresIn: "1h" });
    await db.collection("users").updateOne(
  { email },
  { $set: { resetToken: token } }
);
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`;
    await sendMail(
    email,
    "Verify your account",
    `<h2>Confirm your signup</h2><p>Follow this link to confirm your user:</p><p><a href=${verificationLink}>Confirm your mail</a></p>`
  );
    return NextResponse.json({ message: "User created successfully" },{status:201});
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json({ error: "Internal Server Error" },{status:500});
  }
};