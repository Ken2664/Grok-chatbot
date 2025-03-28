# xAI チャットボット

xAI の API を使用した個人用チャットボットアプリケーションです。過去の会話履歴を考慮した対話を行うことができます。

## 機能

- 複数のチャットスレッドの作成と管理
- チャット履歴の永続化
- 過去のコンテキストを考慮した応答
- シンプルで使いやすい UI

## 技術スタック

- フロントエンド: Next.js (App Router), TypeScript, Tailwind CSS
- 状態管理: Zustand
- データベース: PostgreSQL (Neon)
- ORM: Prisma
- API: xAI API

## セットアップ方法

### 前提条件

- Node.js 18 以上
- NPM または Yarn
- xAI API キー
- PostgreSQL データベース (Neon を推奨)

### インストール手順

### 1. リポジトリをクローン:

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

### 2. 依存関係をインストール:

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

### 3. Neon データベースのセットアップ

#### Neon アカウントの作成

1. [Neon 公式サイト](https://neon.tech)にアクセスし、アカウントを作成します。

#### プロジェクト作成

1. ダッシュボードから「New Project」を選択します。
2. プロジェクト名を入力します（例：「grok-chatbot」）。
3. リージョンを選択します（通常は最も近い地域）。
4. 「Create Project」をクリックします。

#### 接続情報の取得

1. 作成したプロジェクトの接続情報（接続文字列）をコピーします。
2. 接続文字列の形式: `postgresql://user:password@hostname:port/database`

### 4. 環境変数の設定:

`.env.local`ファイルを作成し、以下の環境変数を設定:

```
DATABASE_URL="postgresql://username:password@host:port/database"
XAI_API_KEY="your-xAI-api-key"
XAI_API_URL="https://api.x.ai/v1"
```

llm-app/prisma ディレクトリに.env ファイルを作製し、以下の環境変数を設定:

```
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 5. データベースマイグレーションを実行:

**PowerShell/CMD:**

```powershell
npx prisma migrate dev --name init
```

**Bash (Linux/macOS):**

```bash
npx prisma migrate dev --name init
```

### 6. アプリケーションを起動:

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

- API エンドポイントは `/api/chat` と `/api/messages` に実装されています
- Prisma スキーマは `prisma/schema.prisma` にあります
- 状態管理は `src/lib/store.ts` で行なっています

## バージョン管理


### Ver 1.4.0
LaTexレンダリング実装

### Ver 1.3.0
画像入力機能実装 03/28/2025

### Ver 1.2.0
検索機能実装 03/28/2025

### Ver 1.1.1
コンフリクトエラー対応 03/28/2025

### Ver 1.1.0
チャットタイトル自動入力機能実装, AI生成中表示追加,　チャットデザイン変更 03/28/2025

### Ver 1.0.0
初期機能実装 03/27/2025

## ライセンス

MIT
