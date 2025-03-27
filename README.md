# Grokチャットボット

GrokのAPIを使用した個人用チャットボットアプリケーションです。過去の会話履歴を考慮した対話を行うことができます。

## 機能

- 複数のチャットスレッドの作成と管理
- チャット履歴の永続化
- 過去のコンテキストを考慮した応答
- シンプルで使いやすいUI

## 技術スタック

- フロントエンド: Next.js (App Router), TypeScript, Tailwind CSS
- 状態管理: Zustand
- データベース: PostgreSQL (Neon)
- ORM: Prisma
- API: Grok API

## セットアップ方法

### 前提条件

- Node.js 18以上
- NPM または Yarn
- Grok API キー
- PostgreSQLデータベース (Neonを推奨)

### インストール手順

1. リポジトリをクローン:

**PowerShell/CMD:**
```powershell
git clone <リポジトリURL>
cd llm-chatbot
```

**Bash (Linux/macOS):**
```bash
git clone <リポジトリURL>
cd llm-chatbot
```

2. 依存関係をインストール:

**PowerShell/CMD:**
```powershell
npm install
```

**Bash (Linux/macOS):**
```bash
npm install
# または
yarn install
```

3. 環境変数の設定:

`.env.local`ファイルを作成し、以下の環境変数を設定:

```
DATABASE_URL="postgresql://username:password@host:port/database"
GROK_API_KEY="your-grok-api-key"
GROK_API_URL="https://api.x.ai/v1"
```
llm-app/prismaディレクトリに.envファイルを作製し、以下の環境変数を設定:

```
DATABASE_URL="postgresql://username:password@host:port/database" 
```

4. データベースマイグレーションを実行:

**PowerShell/CMD:**
```powershell
npx prisma migrate dev --name init
```

**Bash (Linux/macOS):**
```bash
npx prisma migrate dev --name init
```

5. アプリケーションを起動:

**PowerShell/CMD:**
```powershell
npm run dev
```

**Bash (Linux/macOS):**
```bash
npm run dev
# または
yarn dev
```

ブラウザで http://localhost:3000 にアクセスしてアプリケーションを使用できます。 
## 使用方法

1. 「新規チャット」ボタンをクリックして新しい会話を開始
2. チャットのタイトルを入力
3. メッセージを入力して送信
4. 左側のサイドバーからチャット履歴を閲覧・管理

## 開発者向け情報

- APIエンドポイントは `/api/chat` と `/api/messages` に実装されています
- Prismaスキーマは `prisma/schema.prisma` にあります
- 状態管理は `src/lib/store.ts` で行なっています

## ライセンス

MIT
