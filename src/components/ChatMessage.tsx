import React from 'react';
import { Message } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasImage = message.contentType === 'image' && message.imageData;
  
  // LaTeX構文を処理する関数
  const processLatex = (content: string): string => {
    if (!content) return '';
    
    // LaTeX記法を変換
    const processed = content
      .replace(/\\\[/g, '$$$')
      .replace(/\\\]/g, '$$$')
      .replace(/\\\(/g, '$$')
      .replace(/\\\)/g, '$$');
    
    return processed;
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-[80%] ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {isUser ? (
          <div>
            {message.content && <div className="mb-2">{message.content}</div>}
            {hasImage && (
              <div className="mt-2">
                <img 
                  src={`data:${message.imageType || 'image/jpeg'};base64,${message.imageData}`}
                  alt="ユーザーがアップロードした画像"
                  className="max-w-full rounded-md max-h-60 object-contain"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[
                [rehypeKatex, { 
                  output: 'html',
                  throwOnError: false, 
                  trust: true,
                  strict: false,
                  macros: {
                    "\\mathbf": "\\boldsymbol"
                  }
                }]
              ]}
            >
              {processLatex(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage; 