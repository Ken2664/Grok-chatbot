import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateGrokResponse } from "@/lib/grok";

// メッセージを送信
export async function POST(request: Request) {
  try {
    const { content, chatId } = await request.json();

    if (!content || !chatId) {
      return NextResponse.json(
        { error: "メッセージ内容とチャットIDは必須です" },
        { status: 400 }
      );
    }

    // チャットの存在確認
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "チャットが見つかりません" },
        { status: 404 }
      );
    }

    // ユーザーメッセージを保存
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: "user",
        chatId,
      },
    });

    // チャットの更新日時を更新
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // xAI APIを使用して応答を生成
    const allMessages = [...chat.messages, userMessage];
    const assistantResponse = await generateGrokResponse(allMessages);

    // アシスタントメッセージを保存
    const assistantMessage = await prisma.message.create({
      data: {
        content: assistantResponse,
        role: "assistant",
        chatId,
      },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("メッセージ送信エラー:", error);
    return NextResponse.json(
      { error: "メッセージの送信に失敗しました" },
      { status: 500 }
    );
  }
}
