# 外部仕様書 (External Specifications)

本ディレクトリは、**個人投資家向け投資判断支援ツール (Investment Decision Support Tool)** の外部仕様書および操作手順書を格納しています。

システム利用者（エンドユーザー）およびシステムの全体仕様を把握したい関係者を対象に、システムの機能概要、各画面・機能の詳細仕様、ならびに操作・運用手順を体系的に整理しています。

---

## 📚 ドキュメント構成一覧

| ドキュメント   | ファイル名                                                                                                                         | 概要・対象読者                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **機能仕様書** | [01_functional_spec.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/01_functional_spec.md) | システムの目的、全体機能一覧、各画面の入出力仕様、バッチワークフロー、リスク管理シグナル判定ロジック、外部連携仕様、非機能要件などを網羅的に解説しています。                                            |
| **操作手順書** | [02_user_manual.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/external/02_user_manual.md)         | 利用開始時のセットアップ、Webダッシュボード各画面の具体的な操作手順（ポジションサイジング、トレーリングストップ、投資日記等）、バッチ処理の手動・自動実行手順、トラブルシューティングを掲載しています。 |

---

## 🔗 関連内部ドキュメント

開発者・保守担当者向けの内部構造・詳細設計ドキュメントは [docs/design/](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design) に配置されています。

- [01_system-overview.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/01_system-overview.md): システム全体アーキテクチャ・モジュール構造
- [02_module-design.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/02_module-design.md): 詳細モジュール・ロジック設計
- [03_data-design.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/03_data-design.md): データベース・テーブルスキーマ設計
- [04_operation.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/04_operation.md): 運用・デプロイ設計
- [05_api-spec.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/05_api-spec.md): バックエンド API エンドポイント詳細
- [06_screen-spec.md](file:///c:/Users/b17g0013/Documents/GitHub/stock-trading-support-tool/docs/design/06_screen-spec.md): 画面 UI/UX 内部仕様
