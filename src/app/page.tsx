'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatList } from '@/components/ChatList';
import { ChatWindow } from '@/components/ChatWindow';

export default function Home() {
  const {
    chats,
    currentChat,
    isLoading,
    isResponding,
    error,
    fetchChats,
    fetchChat,
    createChat,
    updateChat,
    deleteChat,
    sendMessage,
    clearCurrentChat,
  } = useChatStore();

  // 初回読み込み時にチャット一覧を取得
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // チャット選択時の処理
  const handleChatSelect = (chatId: string) => {
    fetchChat(chatId);
  };

  // 新規チャット作成時の処理
  const handleCreateChat = async () => {
    await createChat();
  };

  // チャット名前変更時の処理
  const handleUpdateChat = (chatId: string, title: string) => {
    updateChat(chatId, title);
  };

  // チャット削除時の処理
  const handleDeleteChat = (chatId: string) => {
    if (window.confirm('このチャットを削除してもよろしいですか？')) {
      deleteChat(chatId);
    }
  };

  // メッセージ送信時の処理
  const handleSendMessage = (content: string) => {
    if (currentChat) {
      sendMessage(content, currentChat.id);
    }
  };

  return (
    <main className="flex h-screen bg-white">
      <ChatList
        chats={chats}
        currentChatId={currentChat?.id || null}
        onChatSelect={handleChatSelect}
        onCreateChat={handleCreateChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChat={handleUpdateChat}
      />

      <ChatWindow
        chat={currentChat}
        isLoading={isLoading}
        isResponding={isResponding}
        onSendMessage={handleSendMessage}
      />

      {/* エラーメッセージ */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}
    </main>
  );
}
