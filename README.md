# 外部仕様書サイト (External Specification Docs)

**個人投資家向け投資判断支援ツール** の外部仕様書・操作手順書を [VitePress](https://vitepress.dev/) で静的サイトとして公開するためのリポジトリです。

システム利用者（エンドユーザー）および全体仕様を把握したい関係者を対象に、システムの機能概要・各画面の詳細仕様・操作手順を体系的に整理しています。

---

## 📚 ドキュメント構成

| ドキュメント | ファイル | 概要 |
|---|---|---|
| **機能仕様書** | [docs-site/functional-spec.md](./docs-site/functional-spec.md) | システムの目的・全体機能・画面仕様・バッチワークフロー・非機能要件 |
| **操作手順書** | [docs-site/user-manual.md](./docs-site/user-manual.md) | 画面操作手順・バッチ実行手順・トラブルシューティング |
| **サイト設定** | [docs-site/.vitepress/config.mjs](./docs-site/.vitepress/config.mjs) | VitePress サイト設定（ナビ・サイドバー・Mermaid等） |

---

## 🚀 外部仕様の公開手順

### 前提条件

- Node.js v20 以上（v18 では一部警告が出る場合があります）
- npm v9 以上

### 1. セットアップ

```bash
# 依存パッケージをインストール
npm install
```

### 2. ローカルでプレビュー

```bash
npm run docs:dev
```

ブラウザで `http://localhost:5173/stock-trading-support-tool/` にアクセスして内容を確認します。

### 3. ビルド（本番用静的ファイルを生成）

```bash
npm run docs:build
```

`docs-site/.vitepress/dist/` に静的ファイルが生成されます（このフォルダは `.gitignore` で除外済み）。

### 4. ビルド結果をローカルで確認

```bash
npm run docs:preview
```

### 5. GitHub Pages へ公開（手動デプロイ）

```bash
# ビルド
npm run docs:build

# dist フォルダの内容を gh-pages ブランチへプッシュ
cd docs-site/.vitepress/dist
git init
git add -A
git commit -m "docs: deploy"
git push -f https://github.com/baann1000p-debug/stock-trading-support-tool-design-external.git main:gh-pages
```

公開 URL: `https://baann1000p-debug.github.io/stock-trading-support-tool/`

### 6. GitHub Actions で自動デプロイ（推奨）

`.github/workflows/` に CI/CD ワークフローを配置することで、`main` ブランチへのプッシュ時に自動でビルド・デプロイできます。

---

## 🛠 スクリプト一覧

| コマンド | 説明 |
|---|---|
| `npm run docs:dev` | ローカル開発サーバー起動 |
| `npm run docs:build` | 本番用静的ファイルをビルド |
| `npm run docs:preview` | ビルド済みファイルをローカルでプレビュー |

---

## 📁 ディレクトリ構成

```
stock-trading-support-tool-design-external/
├── docs-site/                  # VitePress ソースファイル
│   ├── .vitepress/
│   │   └── config.mjs          # サイト設定
│   ├── index.md                # トップページ
│   ├── functional-spec.md      # 外部機能仕様書
│   └── user-manual.md          # 操作手順書
├── docs/                       # その他ドキュメント資料
├── .github/                    # GitHub Actions ワークフロー
├── .gitignore
├── package.json
└── README.md
```

---

## 🔗 関連リポジトリ

- **アプリ本体**: [stock-trading-support-tool](https://github.com/baann1000p-debug/stock-trading-support-tool) — ソースコード・内部設計ドキュメント
