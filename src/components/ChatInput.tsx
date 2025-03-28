import { useState, FormEvent, useRef, ChangeEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string, imageData?: string, imageType?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const hasContent = message.trim() || imageData;
    
    if (hasContent && !isLoading) {
      onSendMessage(
        message.trim(), 
        imageData || undefined, 
        imageType || undefined
      );
      setMessage('');
      setImageData(null);
      setImageType(null);
      setImagePreview(null);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 許可するMIMEタイプを確認
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG、PNG、GIF、WEBP形式の画像のみアップロードできます。');
      return;
    }
    
    // ファイルサイズの上限を確認 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('ファイルサイズは10MB以下にしてください。');
      return;
    }
    
    // 画像ファイルをBase64エンコード
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Base64データのプレフィックス（例：data:image/jpeg;base64,）を削除
      const base64Data = result.split(',')[1];
      
      setImageData(base64Data);
      setImageType(file.type);
      setImagePreview(result); // プレビュー用にはプレフィックス付きのデータを使用
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = () => {
    setImageData(null);
    setImageType(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      {imagePreview && (
        <div className="mb-3 relative">
          <img 
            src={imagePreview} 
            alt="プレビュー" 
            className="max-h-40 rounded-md object-contain border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
            aria-label="画像を削除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleClickUpload}
          disabled={isLoading || !!imageData}
          className="px-2 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="画像をアップロード"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          type="submit"
          disabled={(!message.trim() && !imageData) || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          送信
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
      </div>
    </form>
  );
} 