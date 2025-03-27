'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatList } from '@/components/ChatList';
import { ChatWindow } from '@/components/ChatWindow';

export default function Home() {
  const {
    chats,
    currentChat,
    isLoading,
    error,
    fetchChats,
    fetchChat,
    createChat,
    updateChat,
    deleteChat,
    sendMessage,
    clearCurrentChat,
  } = useChatStore();

  // 新規チャット作成モーダル用の状態
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');

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
    if (newChatTitle.trim()) {
      await createChat(newChatTitle);
      setNewChatTitle('');
      setShowNewChatModal(false);
    }
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
        onCreateChat={() => setShowNewChatModal(true)}
        onDeleteChat={handleDeleteChat}
        onUpdateChat={handleUpdateChat}
      />

      <ChatWindow
        chat={currentChat}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />

      {/* 新規チャット作成モーダル */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">新規チャット</h2>
            <div className="mb-4">
              <label htmlFor="chatTitle" className="block text-sm font-medium text-gray-700 mb-1">
                チャットタイトル
              </label>
              <input
                type="text"
                id="chatTitle"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 旅行プラン相談"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateChat}
                disabled={!newChatTitle.trim()}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}
    </main>
  );
}
