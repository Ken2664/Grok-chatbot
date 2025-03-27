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
  error: string | null;
  
  // チャット一覧取得
  fetchChats: () => Promise<void>;
  
  // 特定のチャット取得
  fetchChat: (id: string) => Promise<void>;
  
  // 新規チャット作成
  createChat: (title: string) => Promise<Chat>;
  
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
  error: null,
  
  // チャット一覧取得
  fetchChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/chat');
      const chats = response.data;
      
      // 各チャットのmessagesプロパティを確認し、存在しない場合は空配列として初期化
      chats.forEach((chat: Chat) => {
        if (!chat.messages) {
          chat.messages = [];
        }
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
      const chatData = response.data;
      
      // messagesプロパティが存在しない場合は空配列として初期化
      if (!chatData.messages) {
        chatData.messages = [];
      }
      
      set({ currentChat: chatData, isLoading: false });
    } catch (error) {
      set({ error: 'チャットの取得に失敗しました', isLoading: false });
      console.error('チャット取得エラー:', error);
    }
  },
  
  // 新規チャット作成
  createChat: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/chat', { title });
      const newChat = response.data;
      
      // messagesプロパティが存在しない場合は空配列として初期化
      if (!newChat.messages) {
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
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/messages', {
        content,
        chatId
      });
      
      const { userMessage, assistantMessage } = response.data;
      
      set((state) => {
        if (state.currentChat && state.currentChat.id === chatId) {
          return {
            currentChat: {
              ...state.currentChat,
              messages: Array.isArray(state.currentChat.messages) 
                ? [...state.currentChat.messages, userMessage, assistantMessage]
                : [userMessage, assistantMessage]
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
    } catch (error) {
      set({ error: 'メッセージの送信に失敗しました', isLoading: false });
      console.error('メッセージ送信エラー:', error);
    }
  },
  
  // 現在のチャットをクリア
  clearCurrentChat: () => {
    set({ currentChat: null });
  }
})); 