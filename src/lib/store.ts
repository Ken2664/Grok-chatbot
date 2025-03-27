import { create } from 'zustand';
import axios from 'axios';

// チャットの型定義
export type Chat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

// メッセージの型定義
export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  chatId: string;
};

// ストアの状態型定義
interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  isResponding: boolean;
  error: string | null;
  
  // チャット一覧取得
  fetchChats: () => Promise<void>;
  
  // 特定のチャット取得
  fetchChat: (id: string) => Promise<void>;
  
  // 新規チャット作成（タイトルはオプション）
  createChat: (title?: string) => Promise<Chat>;
  
  // チャット更新
  updateChat: (id: string, title: string) => Promise<void>;
  
  // チャット削除
  deleteChat: (id: string) => Promise<void>;
  
  // メッセージ送信
  sendMessage: (content: string, chatId: string) => Promise<void>;
  
  // 現在のチャットをクリア
  clearCurrentChat: () => void;
}

// ストア作成
export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  isResponding: false,
  error: null,
  
  // チャット一覧取得
  fetchChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/chat');
      // 各チャットのmessagesプロパティを確認し、必要に応じて初期化
      const chats = response.data.map((chat: Chat) => {
        if (!Array.isArray(chat.messages)) {
          return { ...chat, messages: [] };
        }
        return chat;
      });
      set({ chats, isLoading: false });
    } catch (error) {
      set({ error: 'チャット一覧の取得に失敗しました', isLoading: false });
      console.error('チャット一覧取得エラー:', error);
    }
  },
  
  // 特定のチャット取得
  fetchChat: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/chat/${id}`);
      // messagesプロパティがない場合は空の配列を設定
      const chatData = response.data;
      if (!Array.isArray(chatData.messages)) {
        chatData.messages = [];
      }
      set({ currentChat: chatData, isLoading: false });
    } catch (error) {
      set({ error: 'チャットの取得に失敗しました', isLoading: false });
      console.error('チャット取得エラー:', error);
    }
  },
  
  // 新規チャット作成（タイトルはオプション）
  createChat: async (title = '新しいチャット') => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/chat', { title });
      const newChat = response.data;
      
      // messagesプロパティを空の配列として初期化
      if (!Array.isArray(newChat.messages)) {
        newChat.messages = [];
      }
      
      set((state) => ({ 
        chats: [newChat, ...state.chats], 
        currentChat: newChat,
        isLoading: false 
      }));
      return newChat;
    } catch (error) {
      set({ error: 'チャットの作成に失敗しました', isLoading: false });
      console.error('チャット作成エラー:', error);
      throw error;
    }
  },
  
  // チャット更新
  updateChat: async (id: string, title: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.patch(`/api/chat/${id}`, { title });
      set((state) => ({
        chats: state.chats.map(chat => 
          chat.id === id ? { ...chat, title } : chat
        ),
        currentChat: state.currentChat && state.currentChat.id === id 
          ? { ...state.currentChat, title } 
          : state.currentChat,
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'チャットの更新に失敗しました', isLoading: false });
      console.error('チャット更新エラー:', error);
    }
  },
  
  // チャット削除
  deleteChat: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`/api/chat/${id}`);
      set((state) => ({
        chats: state.chats.filter(chat => chat.id !== id),
        currentChat: state.currentChat && state.currentChat.id === id 
          ? null 
          : state.currentChat,
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'チャットの削除に失敗しました', isLoading: false });
      console.error('チャット削除エラー:', error);
    }
  },
  
  // メッセージ送信
  sendMessage: async (content: string, chatId: string) => {
    // ユーザーメッセージをローカルに追加
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      content,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
      chatId
    };
    
    // ユーザーメッセージを即座に表示
    set((state) => {
      if (state.currentChat && state.currentChat.id === chatId) {
        const messages = state.currentChat.messages;
        const existingMessages = Array.isArray(messages) ? messages : [];
        
        return {
          currentChat: {
            ...state.currentChat,
            messages: [...existingMessages, tempUserMessage]
          },
          isResponding: true // 応答待ち状態をtrueに設定
        };
      }
      return { isResponding: true };
    });
    
    try {
      const response = await axios.post('/api/messages', {
        content,
        chatId
      });
      
      const { userMessage, assistantMessage, chatTitle } = response.data;
      
      set((state) => {
        if (state.currentChat && state.currentChat.id === chatId) {
          // currentChatまたはmessagesがnullやundefinedの場合に対応
          const messages = state.currentChat.messages;
          const existingMessages = Array.isArray(messages) ? messages : [];
          
          // 一時メッセージを削除して実際のメッセージに置き換え
          const filteredMessages = existingMessages.filter(msg => msg.id !== tempUserMessage.id);
          
          // チャットタイトルの更新があれば適用する
          const updatedTitle = chatTitle || state.currentChat.title;
          
          // 現在のチャットの状態を更新
          const updatedCurrentChat = {
            ...state.currentChat,
            title: updatedTitle,
            messages: [...filteredMessages, userMessage, assistantMessage]
          };
          
          // chatsリストも更新
          const updatedChats = state.chats.map(chat => 
            chat.id === chatId ? { ...chat, title: updatedTitle } : chat
          );
          
          return {
            chats: updatedChats,
            currentChat: updatedCurrentChat,
            isResponding: false,
            isLoading: false
          };
        }
        return { isResponding: false, isLoading: false };
      });
    } catch (error) {
      set({ error: 'メッセージの送信に失敗しました', isResponding: false, isLoading: false });
      console.error('メッセージ送信エラー:', error);
    }
  },
  
  // 現在のチャットをクリア
  clearCurrentChat: () => {
    set({ currentChat: null });
  }
})); 