import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url); 
    const slug = searchParams.get("slug");
    if(!slug){
        console.log("you need to enter a slug first");
        return NextResponse.json({error:"you need to enter a slug first"},{status:400});
    }
    const client = await clientPromise;
    const db = client.db("testdb"); 

        const user = await db.collection("users").findOne({slug:slug});
        if(!user){
            return NextResponse.json({error:"no user found",user},{status:404});
        
        }
        const categories = await db.collection("categories").find({userId: user._id.toString()}).toArray();
        let dishes =[];
        if(categories.length===0){
            console.log("no category found");
        } else{
        dishes = await db.collection("dishes").find({userId: user._id.toString()}).toArray();
        if(dishes.length===0){
            console.log("no dish found")
        }}
        return NextResponse.json({user,categories,dishes},{status:200});
    } catch (error) {
        console.error("Error during fetching menu:", error);
        return NextResponse.json({ error: "Internal Server Error" },{status:500});
    }
}