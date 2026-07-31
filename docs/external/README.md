# 外部仕様書 (External Specifications)

本ディレクトリは、**個人投資家向け投資判断支援ツール (Investment Decision Support Tool)** の外部仕様書および操作手順書を格納しています。

システム利用者（エンドユーザー）およびシステムの全体仕様を把握したい関係者を対象に、システムの機能概要、各画面・機能の詳細仕様、ならびに操作・運用手順を体系的に整理しています。

---

## 📚 ドキュメント構成一覧

| ドキュメント   | ファイル名                                                                                                                         | 概要・対象読者                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **システム概要書 (図解版)** | [00_system_overview.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/00_system_overview.md) | システムの目的、全体アーキテクチャ、投資判断ライフサイクル、画面構成、買い環境スコア/出口シグナル判定ロジック、ER図をMermaid図入りでわかりやすく解説しています。 |
| **機能仕様書 (詳細版)** | [01_functional_spec.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/01_functional_spec.md) | システムの目的、全体機能一覧、各画面の入出力仕様、バッチワークフロー、リスク管理シグナル判定ロジック、外部連携仕様、非機能要件などを網羅的に解説しています。                                            |
| **メール受信・取引注文運用手順書** | [02_email_order_manual.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/02_email_order_manual.md) | 自動AI投資アドバイスメールを受信し、個人の証券口座で注文を発注・手仕舞いしてから、約定結果をアプリへ登録するまでの実務運用手順を解説しています。 |
| **Web UI画面操作手順書** | [03_web_ui_manual.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/03_web_ui_manual.md)         | ログイン後のWebダッシュボード各画面の具体的なUI操作手順（ポジションサイジング、トレーリングストップ、テクニカルチャート分析、投資日記等）を掲載しています。 |

---

## 📖 外部仕様書・ドキュメントのプレビュー・閲覧方法

本プロジェクトの外部仕様書および操作手順書は、VitePress を使用したWebドキュメントサイト、またはエディタのMarkdownプレビュー機能で閲覧できます。

### 方法1: VitePress ドキュメントサイトでの閲覧 (推奨・Webブラウザ)

VitePress 開発サーバーを起動することで、サイドバー付きの綺麗なWeb UIで仕様書やマニュアルをリアルタイムに検索・閲覧できます。

```bash
# 1. 外部仕様書ディレクトリへ移動 (プロジェクトルートから)
cd docs/external

# 2. 依存パッケージのインストール (初回のみ)
npm install

# 3. ドキュメント表示用 VitePress 開発サーバーの起動
npm run docs:dev
```

起動後、ターミナルに表示される URL（例: `http://localhost:5174` 等）にブラウザでアクセスしてください。

- **静的ビルドおよびプレビュー実行**:
  ```bash
  # ドキュメントサイトのビルド
  npm run docs:build

  # ビルド成果物のプレビュー表示
  npm run docs:preview
  ```

### 方法2: IDE (VS Code / Antigravity IDE) の Markdown プレビュー機能

エディタ内で直接 Markdown ファイルをレンダリングして確認することも可能です。

1. 閲覧したいドキュメントファイル（[01_functional_spec.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/01_functional_spec.md) や [03_web_ui_manual.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/03_web_ui_manual.md)）を開きます。
2. キーボードショートカットを押してプレビューを表示します：
   - **Windows**: `Ctrl + Shift + V` （または `Ctrl + K` の後に `V`）
   - **Mac**: `Cmd + Shift + V`

---

## 🚀 アプリケーション本体の起動方法 (Quick Start)

### 1. 初回ユーザーアカウントの作成

Web UIにログインするためのユーザーアカウントを事前に作成します。

```bash
# 実行例: ユーザー名 "investor1", パスワード "MyPassword123"
node src/workflow/add-user.js investor1 MyPassword123
```

### 2. サーバーおよびフロントエンドの起動

バックエンド API サーバーとフロントエンド開発サーバーをそれぞれ起動します。

```bash
# ターミナル1: バックエンド API サーバー起動 (Port: 3000)
npm start

# ターミナル2: フロントエンド Vite 開発サーバー起動 (Port: 5173)
npm run dev
```

### 3. Web UI へのアクセス

ブラウザ（Chrome / Edge 等）を開き、以下のURLにアクセスします。

- **URL**: [http://localhost:5173](http://localhost:5173)
- 作成したユーザー名・パスワードを入力してログインします。

### 4. ワークフローバッチの実行 (データ取得・分析)

市場データの最新化やAI推奨銘柄スクリーニングを手動で実行する場合のコマンドです。

```bash
# 日次マクロ分析バッチの実行
npm run workflow:macro

# 推奨銘柄スクリーニング & AI分析バッチの実行
npm run workflow:recommend

# テストモード実行 (メール送信なし)
npm run test-workflow -- --mode recommend
```

> **詳細な操作手順**: 各画面の詳細な使い方や画面のスクリーンショットは [03_web_ui_manual.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/03_web_ui_manual.md) を参照してください。

---

## 🔗 関連内部ドキュメント

開発者・保守担当者向けの内部構造・詳細設計ドキュメントは [docs/design/](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design) に配置されています。

- [01_system-overview.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/01_system-overview.md): システム全体アーキテクチャ・モジュール構造
- [02_module-design.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/02_module-design.md): 詳細モジュール・ロジック設計
- [03_data-design.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/03_data-design.md): データベース・テーブルスキーマ設計
- [04_operation.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/04_operation.md): 運用・デプロイ設計
- [05_api-spec.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/05_api-spec.md): バックエンド API エンドポイント詳細
- [06_screen-spec.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/06_screen-spec.md): 画面 UI/UX 内部仕様
