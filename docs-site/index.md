---
layout: home

hero:
  name: "投資判断支援ツール"
  text: "個人投資家向け AI 活用ツール"
  tagline: データとAIに基づいた客観的・体系的な投資判断をサポートします。マクロ経済分析からポジション管理まで一貫して支援。
  actions:
    - theme: brand
      text: 機能仕様書を読む
      link: /functional-spec
    - theme: alt
      text: 操作手順書を読む
      link: /user-manual

features:
  - icon: 📊
    title: マクロ経済分析
    details: Google Gemini / Claude AIが景気フェーズ（回復期・拡大期・後退期）を自動判定し、推奨アセットアロケーション比率を提示します。
  - icon: 🎯
    title: AI銘柄スクリーニング
    details: PER・PBR・ROE・配当利回り・出来高増加率などの複合フィルタで日本株・米国株を自動厳選。AIによる個別コメント付き。
  - icon: 💼
    title: リスク管理（トレーリングストップ）
    details: 保有ポジションの損切ラインを株価上昇に連動して自動切り上げ。目標到達・RSI過熱・決算前警戒の出口シグナルをリアルタイム表示。
  - icon: 🧮
    title: ポジションサイジング計算機
    details: 総資産・許容リスク率・損切り幅から最適購入株数と必要投資金額を自動計算。資金管理を徹底して大損を防ぎます。
  - icon: 📈
    title: テクニカルチャート分析
    details: ローソク足・移動平均線・ボリンジャーバンド・RSIをインタラクティブに表示。期間切替と指標トグルに対応。
  - icon: 📝
    title: 投資日記・運用記録
    details: 売買履歴・エントリー理由・エグジット理由・反省点を記録してトレードスキルを継続的に向上。CSVエクスポート対応。
---

## システム概要

本ツールは、個人投資家が感情に左右されず、**データとAIに基づいた客観的かつ体系的な投資判断**を行えるよう支援するツールです。

市場データ・マクロ指標・ファンダメンタルズ・テクニカル指標の自動収集と AI 分析から、リスク管理・投資日記まで一貫してサポートします。

| コンポーネント | 技術スタック |
|---|---|
| フロントエンド | React 18 + Vite |
| バックエンド API | Node.js + Express |
| データベース | PostgreSQL |
| AI エンジン | Google Gemini API / Claude API |
| 認証 | JWT (JSON Web Token) |

[機能仕様書を見る →](./functional-spec)
[操作手順書を見る →](./user-manual)
