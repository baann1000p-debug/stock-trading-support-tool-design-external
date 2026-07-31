# システム概要仕様書 (System Overview Specification)

> **ドキュメントID**: SPEC-EXT-000  
> **対象システム**: 個人投資家向け投資判断支援ツール (Investment Decision Support Tool)  
> **最終更新日**: 2026-07-31

---

> [!NOTE]
> **💡 30秒でわかる本ツールの全体像**
>
> - **目的**: 感情や直感を排除し、データとAI主導で勝率の高い日本株投資を行う支援ツール
> - **核となる機能**:
>   1. 毎日 8:30 / 12:00 / 15:00 にAIが自動スクリーニング & レポート配信
>   2. 買える市場環境か一目でわかる「**買い環境スコア (0〜100点)**」
>   3. 資産の1%損失に抑える「**適正購入株数の自動ポジションサイジング**」
>   4. 売り時を逃さない「**4大出口シグナル自動警告**（目標到達/損切/RSI過熱/決算直前）」

---

## 1. システム概要と目的

### 1.1 解決する課題とビフォーアフター

個人投資家が陥りがちな「感情的な売買」をシステムとAIが自動排除します。

| 比較項目 | 従来の投資スタイルの課題 ❌ | 本ツール導入後のアプローチ ⭕ |
| :--- | :--- | :--- |
| **環境判断** | ニュースや雰囲気で「なんとなく買い」 | **買い環境スコア (0〜100点)** で客観評価 |
| **銘柄選択** | SNSの話題株や思いつきで選定 | **AIスクリーニング & ファンダメンタルズ厳選** |
| **購入株数** | 資金限界まで勘で購入 (リスク過大) | **1%許容リスク法則**で安全な購入株数を自動計算 |
| **損切り・利確** | 損切りできずに塩漬け / 焦って利確 | **トレーリングストップ & 4大出口シグナル**で機械的売り |
| **振り返り** | 勝ち負けの原因が分からず再現性なし | **投資日記 & AIレポートアーカイブ**で継続改善 |

### 1.2 システムの目的と概要

本システムは、個人投資家が感情や直感に惑わされず、**「データとAIに基づいた客観的かつ体系的な投資判断」** を行えるよう支援する投資管理・意思決定プラットフォームです。

---

## 2. ツール活用シナリオ & 取引運用ライフサイクル

本ツールは、ユーザーのトレードスタイルや利用環境に応じて**「メール通知駆動型」**と**「Web UI直接操作型」**の2つの独立した取引運用ワークフローを提供します。

---

### 2.1 【ワークフロー A】メール通知駆動型 運用ワークフロー (Batch & Email Workflow)

日中忙しい投資家や、メールで迅速にトレード判断を行いたいユーザー向けのワークフローです。  
定期バッチ（08:30 / 12:00 / 15:00）により配信される「AI投資アドバイスメール」を起点として、購入から売り時の判定までをメールメインでスムーズに実行します。

#### メール通知駆動シーケンス図

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 投資家 (ユーザー)
    participant Batch as ⏰ 定期バッチ (8:30/12:00/15:00)
    participant AI as 🧠 AIエンジン (Gemini/Claude)
    participant Mail as ✉️ メールサーバー (Nodemailer)
    participant Broker as 🏦 証券会社 (SBI/楽天等)
    participant Web as 💻 Web UI (登録用)

    Note over Batch, AI: 【08:30 前場寄り付き前: 自動分析・スクリーニング】
    Batch->>AI: ニュース・株価・マクロ指標から分析依頼
    AI-->>Batch: 日次AI分析レポート & 厳選銘柄リスト
    Batch->>Mail: HTMLメール生成・送信依頼
    Mail-->>User: 1. 📩 AI投資アドバイスメール受信

    Note over User: 【メール受信後のエントリー判断】
    User->>User: 2. 買い環境スコア (60点以上) & 許容リスク株数を確認
    User->>Broker: 3. 証券口座で指値/寄成注文 & 損切OCO予約発注
    Broker-->>User: 4. 約定完了

    Note over User, Web: 【任意: Web UIでの記録 & 出口監視設定】
    User->>Web: 5. エントリー結果（銘柄・単価・株数）をWeb UIへ入力登録
    
    Note over Batch, Mail: 【12:00 / 15:00 定時配信: 出口シグナル診断】
    Batch->>Mail: 保有株の4大出口シグナル判定メール送信
    Mail-->>User: 6. 📩 後場/大引け後 レポート & 売り警告受信
    alt 出口シグナル検知 (要売り🔴 / 警告🟡)
        User->>Broker: 7. 証券口座で対象株の返済・売却注文発注
        User->>Web: 8. Web UIで売却結果を確定登録
    end
```

#### ワークフロー A のステップ別ガイド

1. **Step 1: 朝のメール受信 (08:30)**
   - 毎朝届く「寄り付き前アドバイスメール」で**買い環境スコア**（60点以上か）と**AI推奨銘柄**を確認。
2. **Step 2: 許容リスク株数での発注**
   - メール本文に算出されている「許容リスク1%に応じた推奨購入株数」を確認し、自身の証券口座へ指値・成行注文を発注。
3. **Step 3: アプリへ約定記録入力（任意）**
   - 約定後、Web UIにログインして約定単価と株数を入力し、自動リスク監視（トレーリングストップ）を開始。
4. **Step 4: 後場・大引けメールでの出口シグナル確認 (12:00 / 15:00)**
   - 届いたメールで「4大出口シグナル（目標到達・損切・RSI過熱・決算直前）」の警告がないか確認。
5. **Step 5: 証券会社での手仕舞い発注**
   - 売り警告が発生した場合は、証券口座で売却発注を行い、必要に応じてWeb UIに売却記録と振り返りを入力。

詳しくはこちら: **[メール受信・取引注文運用手順書 (MANUAL-EXT-002)](./02_email_order_manual.md)**

---

### 2.2 【ワークフロー B】Web UI直接操作型 運用ワークフロー (Interactive Web UI Workflow)

PCやタブレットの大きな画面でグラフや詳細データを確認し、ダイレクトに銘柄選定・ポジショニング・損益分析を行いたいユーザー向けのワークフローです。

#### Web UI直接操作シーケンス図

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 投資家 (ユーザー)
    participant Web as 💻 Webダッシュボード
    participant API as ⚙️ バックエンドAPI
    participant Chart as 📈 テクニカルチャート
    participant Broker as 🏦 証券会社 (SBI/楽天等)

    Note over User, Web: 【1. 環境把握 & アノマリーチェック】
    User->>Web: ログイン & 「ダッシュボード」表示
    Web-->>User: 買い環境スコア (0〜100点) & 景気フェーズ & アノマリー表示

    Note over User, Web: 【2. 推奨銘柄検討 & 数量計算】
    User->>Web: 「推奨銘柄」画面でスクリーニング一覧・AI評価ロジックを閲覧
    User->>Web: 「ポジションサイジング」モーダルを開き、エントリー価・損切価を入力
    Web-->>User: 1%許容リスクに基づく適正購入株数をリアルタイム算出

    Note over User, Broker: 【3. 証券口座での発注 & エントリー登録】
    User->>Broker: 証券口座で算出された適正株数を注文
    User->>Web: 「取引記録メモ」からエントリー中銘柄として登録

    Note over User, Chart: 【4. リスク監視 & 出口シグナル判定】
    User->>Web: 「エントリー中銘柄」画面を定期閲覧
    Web-->>User: 評価損益 & トレーリングストップ切り上げ & 4大出口バッジ(🔴/🟡)表示
    User->>Chart: 「チャート分析」画面で移動平均・ボリバン・RSI等を確認

    Note over User, Web: 【5. 売却確定 & 振り返り日記】
    User->>Broker: 売りシグナルに応じて証券会社で売却
    User->>Web: 「売却記録」モーダルを開き、実現損益確定＆「投資日記」を記入
```

#### ワークフロー B のステップ別ガイド

1. **Step 1: ダッシュボードで環境分析**
   - Web UIにログインし、「買い環境スコア」「マクロ景気フェーズ」「市場アノマリー」を確認し、本日のエントリー可否を判断。
2. **Step 2: 推奨銘柄のAI解釈 & チャート分析**
   - 「推奨銘柄」画面で銘柄を選び、「AI評価判定根拠モーダル」や「チャート分析」画面でテクニカル・ファンダメンタルズ根拠を分析。
3. **Step 3: ポジションサイジング機能で適正株数算出**
   - 「ポジションサイジング（`MemoModal`）」でエントリー想定株価と損切りラインを入力し、総資産の1%リスクに収まる「推奨購入株数」を即時計算。
4. **Step 4: エントリー登録とリアルタイム監視**
   - 約定後「エントリー中銘柄」に登録。最高値更新に合わせたトレーリングストップや、4大出口シグナルを画面上で視覚的に監視。
5. **Step 5: 売却記録 & 投資日記でのノウハウ蓄積**
   - 手仕舞い後、「運営状況・投資日記」画面で取引履歴を確定し、勝因・敗因の反省メモを残して次回トレードへ活かす。

詳しくはこちら: **[Web UI画面操作手順書 (MANUAL-EXT-003)](./03_web_ui_manual.md)**

---

## 3. 画面・機能ブロック概要

Webダッシュボードは、投資の各段階（状況把握 → 銘柄選択 → 数量決定 → リスク管理 → 振返り）に対応する6つの画面と1つのモーダル機能で構成されています。

```mermaid
flowchart TD
    subgraph DashboardGroup ["1. マクロ環境 & 全体分析"]
        Dash["① ダッシュボード (Dashboard.jsx)<br/>マクロ環境・買い環境スコア・アノマリー"]
    end

    subgraph SelectionGroup ["2. 銘柄選定 & エントリー準備"]
        Rec["② 推奨銘柄 (Recommendations.jsx)<br/>AI厳選スクリーニング"]
        Modal["③ ポジションサイジング (MemoModal.jsx)<br/>1%許容リスク計算"]
    end

    subgraph PortfolioGroup ["3. ポジション管理 & チャート分析"]
        Pos["④ エントリー中銘柄 (Performance.jsx)<br/>出口シグナル・トレーリングストップ"]
        Chart["⑤ チャート分析 (ChartAnalysis.jsx)<br/>MA / ボリバン / RSI / MACD"]
    end

    subgraph RecordGroup ["4. 振り返り & アーカイブ"]
        Trades["⑥ 運用状況・投資日記 (Trades.jsx)<br/>売買記録・振り返り・CSV出力"]
        Reports["⑦ 過去のAIレポート (Reports.jsx)<br/>アーカイブ検索"]
    end

    Dash --> Rec
    Rec --> Modal
    Modal --> Pos
    Pos --> Chart
    Pos --> Trades
    Dash --> Reports
```

### 画面・機能一覧と概要

| 画面・機能 | 主要コンポーネント | 役割と主な機能 |
| :--- | :--- | :--- |
| **① ダッシュボード** | `Dashboard.jsx` | 現在の景気フェーズ、推奨アロケーション、**買い環境スコア（0〜100点）**、ソーシャルトレンド、市場アノマリー情報の可視化 |
| **② 推奨銘柄** | `Recommendations.jsx` | スクリーニングされた注目銘柄の一覧、スコア、目標株価、損切ライン、AIによる選定理由の閲覧 |
| **③ ポジションサイジング** | `MemoModal.jsx` | 総資産の1%を最大許容損失とする最適購入株数・必要投資額・ポートフォリオ占有率の自動計算モーダル<br/>`推奨株数 = (総資産 × 1%) ÷ (エントリー株価 - 損切株価)` |
| **④ エントリー中銘柄** | `Performance.jsx` | 保有ポジションの評価損益、トレーリングストップ切り上げ表示、**4大出口シグナル（要売り/警告）** の自動判定 |
| **⑤ チャート分析** | `ChartAnalysis.jsx` | 移動平均線(5日/25日)、ボリンジャーバンド(±2σ)、RSI(14日)、MACDおよびエントリー/損切水平線の表示 |
| **⑥ 運用状況・投資日記** | `Trades.jsx` | 約定履歴の記録、売買理由・振り返りメモの記述、実現損益計算、CSVエクスポート機能 |
| **⑦ 過去のAIレポート** | `Reports.jsx` | 過去にバッチで配信された日次AI分析レポートのアーカイブ参照 |

---

## 4. 買い環境スコア & 出口シグナル判定ロジック

本システムを象徴する2つの主要ロジックの判定フローです。

### 4.1 買い環境スコア算出フロー (100点満点)

4つの主要指標（VIX、25日騰落レシオ、信用評価損益率、マクロ景気フェーズ）を配点・加算し、総合評価を算出します。

```mermaid
flowchart LR
    subgraph InputIndicators ["市場データ入力"]
        VIX["VIX指数"]
        TR["25日騰落レシオ"]
        CR["信用評価損益率"]
        MacroP["マクロ景気フェーズ"]
    end

    subgraph ScoringEngine ["スコアリングロジック"]
        VIX -->|"25点満点"| S1["VIXスコア<br/>(20未満: 高得点)"]
        TR -->|"25点満点"| S2["騰落レシオスコア<br/>(70〜120%: 適正)"]
        CR -->|"25点満点"| S3["信用損益率スコア<br/>(-15%以下: 底値圏高得点)"]
        MacroP -->|"25点満点"| S4["マクロスコア<br/>(回復期/拡大期: 高得点)"]
    end

    S1 & S2 & S3 & S4 --> Sum["合計スコア (0〜100点)"]

    Sum --> ScoreEval{"スコア区分"}
    ScoreEval -->|"75点以上"| R1["絶好の買い場 🟢"]
    ScoreEval -->|"55〜74点"| R2["買い場 🟢"]
    ScoreEval -->|"35〜54点"| R3["中立 🟡"]
    ScoreEval -->|"15〜34点"| R4["様子見推奨 🟠"]
    ScoreEval -->|"14点以下"| R5["買い見送り推奨 🔴"]
```

### 4.3 銘柄スクリーニングスコア（BUY / SELL加減点 & 動的学習補正）

個別銘柄の判定では、ファンダメンタルズ足切り（自己資本比率20%以上、ROE 8%以上、信用倍率10倍以下）を通過した銘柄に対し、RSI・MACD・ボリンジャーバンド・出来高・信用倍率・TOPIX相対強度などのテクニカル・需給シグナルを加減点採点（生スコア算出）します。

- **BUYモード（買い候補）**: 強気反転（RSI売られすぎ +3点, MACDゴールデンクロス +3点 等）や順張り上昇を大きく加点し、下降トレンド逆張り（-1点〜-3点）を減点ペナルティ。
- **SELLモード（売り/空売り候補）**: 過熱・天井打ち（RSI買われすぎ +3点, MACDデスクロス +3点 等）や下降継続を加点し、空売り後の買い戻しリスク（RSI売られすぎ -3点 等）を減点ペナルティ。
- **100点満点換算 (`normScore`)**: 判定区分に応じた理論最大点に対する割合を100点満点に正規化（80点以上：バイオレット表示 🟣, 60〜79点：エメラルド表示 🟢）。
- **動的配点調整 (Dynamic Learning)**: 過去の推奨ウォークフォワード追跡データに基づき、確定勝率40%未満の不調シグナルには `0.5x` の動的減額補正を自動適用して精度を継続向上。

### 4.2 エントリー中銘柄の4大出口シグナル判定

保有ポジションに対して毎日自動判定を行い、手仕舞いが必要な場合にバッジ表示します。

```mermaid
flowchart TD
    Start["保有銘柄の最新株価・データ取得"] --> C1{"現在値 ≧ 目標株価?"}
    C1 -- "Yes" --> S1["🔴 要売り: 目標株価到達 (利益確定)"]
    C1 -- "No" --> C2{"現在値 ≦ 損切設定値?"}

    C2 -- "Yes" --> S2["🔴 要売り: 損切ライン到達 (損切り実行)"]
    C2 -- "No" --> C3{"14日RSI ≧ 70 または ≦ 30?"}

    C3 -- "Yes" --> S3["🟡 警告: RSI過熱 (買われすぎ / 売られすぎ)"]
    C3 -- "No" --> C4{"決算発表日まで 3日以内?"}

    C4 -- "Yes" --> S4["🟡 警告: 決算直前警戒 (イベントリスク)"]
    C4 -- "No" --> Safe["🟢 保持継続 (正常)"]
```

---

## 5. システムアーキテクチャ

本システムは、ReactベースのWebフロントエンド、Express APIサーバー、バックエンドバッチ処理パイプライン、SQLite/JSONデータベース、および外部AI（Google Gemini / Anthropic Claude）から構成されています。

```mermaid
flowchart TB
    subgraph UserInterface ["ユーザーインターフェース (Web UI)"]
        UI["Webダッシュボード (React / Vite)"]
    end

    subgraph BackendServer ["バックエンド API サーバー (Express)"]
        API["REST API Controller"]
        Auth["JWT 認証モジュール"]
        Calc["ポジションサイジング & リスク計算エンジン"]
    end

    subgraph BatchEngine ["自動ワークフローバッチ"]
        Cron["定時バッチ (8:30 / 12:00 / 15:00)"]
        Fetcher["市場データ収集 (Yahoo Finance / J-Quants)"]
        Scorer["買い環境スコアリングモジュール"]
        AIService["AI分析エンジン (Gemini / Claude)"]
        Mailer["メール通知サービス (Nodemailer)"]
    end

    subgraph Storage ["データストレージ"]
        DB[("SQLite / Local DB")]
        JSONFile[("設定 & アノマリー JSON")]
    end

    subgraph ExternalServices ["外部サービス・API"]
        YF["Yahoo Finance API"]
        MacroAPI["マクロ指標データ源 (VIX, 騰落レシオ)"]
        LLM["Google Gemini / Claude API"]
        SMTP["SMTP メールサーバー"]
    end

    UI <-->|"HTTP / REST API (JWT)"| API
    API <--> Storage
    Cron --> Fetcher
    Cron --> Scorer
    Cron --> AIService
    Cron --> Mailer

    Fetcher <--> YF
    Fetcher <--> MacroAPI
    AIService <--> LLM
    Mailer --> SMTP

    Scorer --> Storage
    AIService --> Storage
```

---

## 6. 自動分析・通知ワークフローバッチ

システムは日本時間の毎日 **8:30 (前場寄せ前)**、**12:00 (後場寄せ前)**、**15:00 (大引け後)** にバックエンドバッチを定期実行します。

```mermaid
flowchart TD
    Trigger["定時タイマー / 手動CLI起動"] --> Step1["Step 1: マーケットニュース & 海外市場データ取得"]
    Step1 --> Step2["Step 2: ファンダメンタルズ一次フィルタリング<br/>PER / PBR / ROE / 自己資本比率"]
    Step2 --> Step3["Step 3: テクニカル指標算出 & 二次フィルタリング<br/>ゴールデンクロス / RSI / MACD"]
    Step3 --> Step4["Step 4: AI 景気フェーズ判定 & 注目銘柄スクリーニング<br/>Gemini / Claude LLM 連携"]
    Step4 --> Step5["Step 5: 買い環境スコア算出 & 総合レポート生成"]
    Step5 --> Step6["Step 6: データベース保存"]
    Step6 --> Step7["Step 7: Nodemailer によるHTMLメール送信"]
    Step7 --> End["処理完了"]
```

---

## 7. データ構造 & エンティティ関係図 (ER図)

本システムで管理される主要なデータの関連性です。

```mermaid
erDiagram
    USER ||--o{ TRADE_RECORD : "owns"
    USER ||--o{ ASSET_SETTING : "sets"
    USER ||--o{ ANOMALY_ITEM : "manages"

    TRADE_RECORD }|--|| RECOMMENDATION : "references"

    RECOMMENDATION }|--|| MACRO_ANALYSIS : "based_on"
    AI_REPORT ||--|| MACRO_ANALYSIS : "contains"

    USER {
        string id PK
        string username
        string passwordHash
        datetime createdAt
    }

    TRADE_RECORD {
        string id PK
        string userId FK
        string symbol
        string tradeType
        number price
        number shares
        number targetPrice
        number stopLoss
        string entryReason
        string exitReason
        string reflection
        datetime tradeDate
    }

    RECOMMENDATION {
        string id PK
        string symbol
        string name
        string sector
        number score
        number recommendPrice
        number targetPrice
        number stopLoss
        string aiComment
        datetime generatedAt
    }

    MACRO_ANALYSIS {
        string id PK
        string phase
        number buyEnvironmentScore
        string trendSentiment
        datetime analyzedAt
    }

    ANOMALY_ITEM {
        string id PK
        string title
        string category
        string period
        number probability
        string description
    }
```

---

## 8. 詳細仕様書・マニュアルへの案内

各画面の入出力パラメータの詳細や、具体的なセットアップ手順については以下のドキュメントを参照してください。

- **[外部機能仕様書 (詳細版)](./01_functional_spec.md)**
  - APIエンドポイント仕様、画面コンポーネント詳細、例外処理・非機能要件
- **[メール受信・取引注文運用手順書](./02_email_order_manual.md)**
- **[Web UI画面操作手順書](./03_web_ui_manual.md)**
  - Web UIのセットアップ・ログイン手順、買い環境スコアの見方、取引メモ・投資日記の使い方、トラブルシューティング
- **[GitHub リポジトリトップ README](https://github.com/baann1000p-debug/stock-trading-support-tool-design-external/blob/main/README.md)**
  - インストール、動作環境、環境変数設定など

---
