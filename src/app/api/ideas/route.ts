import { NextResponse } from "next/server";
import soupIdeas from "@/data/soup-ideas.json";

export async function GET() {
  return NextResponse.json({ soups: soupIdeas.soups });
}
