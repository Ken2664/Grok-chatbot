import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateGrokResponse, GrokMessage } from '@/lib/grok';

// チャットタイトル生成用の補助関数
async function generateChatTitle(userMessage: string) {
  try {
    // ユーザーの最初のメッセージからタイトルを生成する（最大20文字）
    if (userMessage.length <= 20) {
      return userMessage;
    }
    
    // Grok APIを使用してタイトルを要約生成
    const promptMessage: GrokMessage = {
      role: 'user',
      content: `次のメッセージから簡潔なチャットタイトルを20文字以内で作成してください。タイトルのみを返してください: "${userMessage}"`
    };
    
    const titleResponse = await generateGrokResponse([promptMessage]);
    // 不要な記号や空白を削除
    const cleanTitle = titleResponse.replace(/["""'']/g, '').trim();
    
    // 20文字を超える場合は切り詰める
    return cleanTitle.length > 20 ? cleanTitle.substring(0, 20) + '...' : cleanTitle;
  } catch (error) {
    console.error('タイトル生成エラー:', error);
    // エラーが発生した場合はデフォルトタイトルを使用
    return '新しいチャット';
  }
}

// メッセージを送信
export async function POST(request: Request) {
  try {
    const { content, chatId, contentType, imageData, imageType } = await request.json();

    if ((!content && !imageData) || !chatId) {
      return NextResponse.json(
        { error: "メッセージ内容またはチャットIDが不足しています" },
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

    // 画像データがある場合はそれを含めてユーザーメッセージを保存
    const isImage = !!imageData && !!imageType;
    const userMessage = await prisma.message.create({
      data: {
        content: content || "",
        role: "user",
        chatId,
        contentType: isImage ? "image" : "text",
        imageData: imageData || null,
        imageType: imageType || null
      },
    });
    
    // 最初のメッセージの場合、チャットタイトルを自動生成
    const messages = Array.isArray(chat.messages) ? chat.messages : [];
    if (messages.length === 0 && chat.title === '新しいチャット') {
      const titleText = content || "画像チャット";
      const generatedTitle = await generateChatTitle(titleText);
      await prisma.chat.update({
        where: { id: chatId },
        data: { 
          title: generatedTitle,
          updatedAt: new Date()
        }
      });
      
      // 更新されたチャットを取得
      const updatedChat = await prisma.chat.findUnique({
        where: { id: chatId }
      });
      
      // タイトルが更新されている場合は、chatを更新
      if (updatedChat) {
        chat.title = updatedChat.title;
      }
    } else {
      // 最初のメッセージでない場合は、更新日時のみ更新
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });
    }
    
    // Grok APIを使用して応答を生成
    const allMessages = [...messages, userMessage];
    const assistantResponse = await generateGrokResponse(allMessages);

    // アシスタントメッセージを保存
    const assistantMessage = await prisma.message.create({
      data: {
        content: assistantResponse,
        role: "assistant",
        chatId,
        contentType: "text" // アシスタントの応答は常にテキスト
      },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage,
      chatTitle: chat.title // 更新されたチャットタイトルを返す
    });
  } catch (error) {
    console.error("メッセージ送信エラー:", error);
    return NextResponse.json(
      { error: "メッセージの送信に失敗しました" },
      { status: 500 }
    );
  }
}
