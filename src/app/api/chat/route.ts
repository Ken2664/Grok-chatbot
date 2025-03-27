import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import prisma from '@/lib/prisma';

const prismaClient = new PrismaClient();

// チャット作成スキーマ
const createChatSchema = z.object({
  title: z.string().min(1),
});

// チャット一覧取得
export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: true
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("チャット一覧取得エラー:", error);
    return NextResponse.json(
      { error: "チャット一覧の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 新規チャット作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createChatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { title } = validation.data;

    const chat = await prisma.chat.create({
      data: {
        title,
      },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("チャット作成エラー:", error);
    return NextResponse.json(
      { error: "チャットの作成に失敗しました" },
      { status: 500 }
    );
  }
} 