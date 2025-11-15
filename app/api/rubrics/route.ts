import { NextResponse } from "next/server";
import { getRubrics } from "@/lib/services/rubrics";

export async function GET() {
  const rubrics = await getRubrics();
  return NextResponse.json(rubrics);
}
