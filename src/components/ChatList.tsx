import { useState, useEffect, useRef } from 'react';
import { Chat } from '@/lib/store';

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onUpdateChat: (chatId: string, title: string) => void;
}

export function ChatList({
  chats,
  currentChatId,
  onChatSelect,
  onCreateChat,
  onDeleteChat,
  onUpdateChat,
}: ChatListProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>(chats);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // チャットリストが更新されたとき、または検索クエリが変更されたときにフィルタリングを行う
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter(chat => 
        chat.title.toLowerCase().includes(query)
      );
      setFilteredChats(filtered);
    }
  }, [chats, searchQuery]);

  const handleEditStart = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = (chatId: string) => {
    if (editTitle.trim()) {
      onUpdateChat(chatId, editTitle);
    }
    setEditingChatId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleEditSave(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  const handleSearchFocus = () => {
    // Ctrl+F または ⌘+F で検索ボックスにフォーカス
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  };

  // 検索ボックスのキーボードショートカット
  useEffect(handleSearchFocus, []);

  return (
    <div className="w-64 bg-gray-100 h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateChat}
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        >
          新規チャット
        </button>
        
        {/* 検索ボックス */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="チャットを検索..."
            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg 
            className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {chats.length === 0 ? "チャット履歴がありません" : "検索結果がありません"}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <li key={chat.id} className="relative">
                {editingChatId === chat.id ? (
                  <div className="p-2 flex items-center">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleEditSave(chat.id)}
                      onKeyDown={(e) => handleKeyDown(e, chat.id)}
                      className="w-full p-1 border border-gray-300 rounded"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 ${
                      currentChatId === chat.id ? 'bg-gray-200' : ''
                    }`}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="truncate mr-2">{chat.title}</div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(chat);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 