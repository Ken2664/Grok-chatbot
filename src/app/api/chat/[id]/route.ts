import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from '@/lib/prisma';

// チャット更新スキーマ
const updateChatSchema = z.object({
  title: z.string().min(1).optional(),
});

interface Params {
  params: {
    id: string;
  };
}

// 特定のチャットを取得
export async function GET(request: Request, { params }: Params) {
  try {
    // パラメータを非同期処理前に展開して変数に保存
    const { id } = await Promise.resolve(params);
    
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!chat) {
      return NextResponse.json(
        { error: 'チャットが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('チャット取得エラー:', error);
    return NextResponse.json(
      { error: 'チャットの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// チャットを更新
export async function PATCH(request: Request, { params }: Params) {
  try {
    // パラメータを非同期処理前に展開して変数に保存
    const { id } = await Promise.resolve(params);
    
    const body = await request.json();
    const { title } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }
    
    const chat = await prisma.chat.update({
      where: { id },
      data: { title }
    });
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('チャット更新エラー:', error);
    return NextResponse.json(
      { error: 'チャットの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// チャットを削除
export async function DELETE(request: Request, { params }: Params) {
  try {
    // パラメータを非同期処理前に展開して変数に保存
    const { id } = await Promise.resolve(params);
    
    await prisma.chat.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('チャット削除エラー:', error);
    return NextResponse.json(
      { error: 'チャットの削除に失敗しました' },
      { status: 500 }
    );
  }
} 