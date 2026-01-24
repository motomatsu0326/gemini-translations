# Gemini Translation Tool

macOS用の常駐型翻訳ツール。選択したテキストをGemini APIで翻訳し、クリップボードにコピーします。

## 機能

- **グローバルショートカット**: `⌘⌥T`で選択テキストを翻訳
- **自動言語検出**: 日本語⇄英語を自動判定
- **メニューバー常駐**: Dockに表示せず、メニューバーから操作
- **シンプルなUI**: 設定画面でAPIキーと翻訳方向を管理

## 必要要件

- macOS (Apple Silicon / Intel 両対応)
- Node.js 18以上
- Gemini API キー
## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Gemini API キーの設定

アプリを起動後、設定画面でAPIキーを入力します。

### 3. macOS権限の設定

初回起動時に以下の権限を許可してください：

- **アクセシビリティ**: テキストの自動コピーに必要
- **入力監視**: キーボードショートカットの実行に必要

設定場所: `システム設定 > プライバシーとセキュリティ > アクセシビリティ`

## 開発

### 開発モードで起動

```bash
npm run dev
```

### ビルド

```bash
# 開発ビルド
npm run build

# macOS用DMGを作成
npm run dist:dmg

# macOS用ZIP付きビルド
npm run dist
```

出力先: `dist/Gemini Translation-1.0.0.dmg`

### TypeScript チェック

```bash
npm run typecheck
```

## 配布

### DMGファイルの作成

```bash
npm run dist:dmg
```

生成されるファイル:
- `dist/Gemini Translation-1.0.0.dmg` - インストーラー
- `dist/Gemini Translation-1.0.0-mac.zip` - ZIPアーカイブ

## 使い方

1. 任意のアプリケーションでテキストを選択
2. `⌘⌥T` を押す
3. 翻訳されたテキストがクリップボードにコピーされる
4. `⌘V` で貼り付け

## プロジェクト構成

```
gemini-translation/
├── src/
│   ├── main/              # Electronメインプロセス
│   │   ├── index.ts       # アプリケーションエントリーポイント
│   │   ├── applescript.ts # テキスト取得 (AppleScript)
│   │   ├── language.ts    # 言語検出
│   │   ├── gemini.ts      # Gemini API クライアント
│   │   ├── translator.ts  # 翻訳オーケストレーター
│   │   ├── shortcut.ts    # グローバルショートカット
│   │   └── ipc.ts         # IPC通信ハンドラー
│   ├── preload/           # Preloadスクリプト
│   │   └── index.ts       # セキュアなIPC橋渡し
│   └── renderer/          # Reactレンダラープロセス
│       ├── src/
│       │   ├── main.tsx   # Reactエントリーポイント
│       │   ├── App.tsx    # メインコンポーネント
│       │   └── components/
│       │       └── Settings.tsx  # 設定UI
│       └── index.html
├── scripts/
│   └── copyText.scpt      # テキストコピー用AppleScript
└── package.json
```

## 技術スタック

- **Electron**: デスクトップアプリケーションフレームワーク
- **React**: UI構築
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: スタイリング
- **Vite**: 高速ビルドツール
- **Gemini API**: Google の生成AI

## トラブルシューティング

### ショートカットが動作しない

- macOSのアクセシビリティ権限を確認
- 他のアプリと同じショートカットを使用していないか確認

### 翻訳が実行されない

- Gemini API キーが正しく設定されているか確認
- インターネット接続を確認
- APIの利用制限に達していないか確認

### テキストが取得できない

- アクセシビリティ権限を確認
- テキストが選択されているか確認

## ライセンス

MIT
