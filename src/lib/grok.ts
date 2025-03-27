export type Message = {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
  chatId: string;
};

export type GrokMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// messageの型に応じて処理を分岐する関数
export async function generateGrokResponse(messages: Message[]): Promise<string>;
export async function generateGrokResponse(messages: GrokMessage[]): Promise<string>;
export async function generateGrokResponse(messages: Message[] | GrokMessage[]): Promise<string> {
  try {
    const apiUrl = process.env.GROK_API_URL;
    const apiKey = process.env.XAI_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('API設定が見つかりません');
    }

    console.log(`API URL: ${apiUrl}`); // URL確認用ログ

    // 会話履歴を適切な形式に変換
    const formattedMessages: GrokMessage[] = [];
    
    // システムメッセージを追加（最初のアシスタントメッセージの前に配置）
    formattedMessages.push({
      role: 'system',
      content: 'あなたは親切なアシスタントです。'
    });
    
    // ユーザーとアシスタントの会話履歴を追加
    // Messageタイプの場合のみ変換が必要
    if (messages.length > 0 && 'id' in messages[0]) {
      (messages as Message[]).forEach(message => {
        formattedMessages.push({
          role: message.role as 'user' | 'assistant',
          content: message.content
        });
      });
    } else {
      // すでにGrokMessage型の場合はそのまま追加
      formattedMessages.push(...(messages as GrokMessage[]));
    }

    console.log('リクエスト送信中...'); // デバッグ用

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log(`ステータスコード: ${response.status}`); // ステータスコード確認

    if (!response.ok) {
      const errorText = await response.text();
      console.error('APIエラーレスポンス:', errorText);
      
      let errorMessage = `API エラー: HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += ` - ${errorData.error?.message || errorData.message || response.statusText}`;
      } catch (e) {
        errorMessage += ` - ${response.statusText || errorText.slice(0, 100)}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API呼び出しエラー:', error);
    // フォールバックレスポンスを返す
    return "申し訳ありませんが、現在AIサービスに接続できません。しばらく経ってからもう一度お試しください。";
  }
} 