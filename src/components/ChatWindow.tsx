import { useRef, useEffect } from 'react';
import { Chat } from '@/lib/store';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  chat: Chat | null;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

export function ChatWindow({ chat, isLoading, onSendMessage }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたときに自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <h2 className="text-2xl font-semibold mb-2">Grokチャットボット</h2>
          <p>左側のメニューから会話を選択するか、新しい会話を始めてください。</p>
        </div>
      </div>
    );
  }

  // messagesが未定義の場合、空の配列をデフォルト値として使用
  const messages = chat.messages || [];

  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-lg truncate">{chat.title}</h2>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>メッセージがありません。会話を始めてください。</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
} 