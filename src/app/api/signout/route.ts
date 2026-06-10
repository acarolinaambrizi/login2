import { NextResponse } from "next/server";

export async function POST() {
  // A resposta indica que o logout foi processado com sucesso.
  return NextResponse.json({ success: true });
}