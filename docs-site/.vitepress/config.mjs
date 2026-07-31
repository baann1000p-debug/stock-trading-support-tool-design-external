import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    // サイト基本設定
    base: "/stock-trading-support-tool-design-external/",
    lang: "ja",
    title: "投資判断支援ツール",
    description:
      "個人投資家向け投資判断支援ツール (Investment Decision Support Tool) の外部仕様書・操作手順書",

    // docs/external を唯一のソースとし、docs-site 側にコンテンツを二重管理しない
    srcDir: "../docs/external",
    srcExclude: ["README.md", "capture_manual_screenshots.js"],

    // 番号プレフィックス付きのファイル名を読みやすいURLに変換
    rewrites: {
      "00_system_overview.md": "system-overview.md",
      "01_functional_spec.md": "functional-spec.md",
      "02_email_order_manual.md": "email-order-manual.md",
      "03_web_ui_manual.md": "web-ui-manual.md",
    },

    // ヘッダーナビ
    themeConfig: {
      logo: "📊",
      siteTitle: "投資判断支援ツール",

      nav: [
        { text: "ホーム", link: "/" },
        { text: "システム概要", link: "/system-overview" },
        { text: "機能仕様書", link: "/functional-spec" },
        { text: "操作手順書", link: "/web-ui-manual" },
      ],

      sidebar: [
        {
          text: "はじめに",
          items: [{ text: "トップページ", link: "/" }],
        },
        {
          text: "仕様書",
          items: [
            { text: "システム概要仕様書", link: "/system-overview" },
            { text: "外部機能仕様書", link: "/functional-spec" },
          ],
        },
        {
          text: "操作・運用手順書",
          items: [
            { text: "Web UI画面操作手順書", link: "/web-ui-manual" },
            {
              text: "メール受信・取引注文運用手順書",
              link: "/email-order-manual",
            },
          ],
        },
      ],

      // フッター
      footer: {
        message: "個人投資家向け投資判断支援ツール 外部仕様書",
        copyright: "© 2026 Investment Decision Support Tool",
      },

      // 編集リンク
      editLink: {
        pattern:
          "https://github.com/baann1000p-debug/stock-trading-support-tool-design-external/edit/main/docs/external/:path",
        text: "GitHub でこのページを編集",
      },

      // 検索
      search: {
        provider: "local",
      },

      // SNS リンク
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/baann1000p-debug/stock-trading-support-tool-design-external",
        },
      ],

      // 目次設定
      outline: {
        label: "このページの目次",
        level: [2, 3],
      },

      lastUpdated: {
        text: "最終更新",
      },

      docFooter: {
        prev: "前のページ",
        next: "次のページ",
      },
    },

    // mermaid設定
    mermaid: {
      theme: "default",
    },

    // markdown オプション
    markdown: {
      lineNumbers: true,
    },

    // 最終更新日を有効化
    lastUpdated: true,

    // ローカル開発用URLへの言及をデッドリンク判定から除外
    ignoreDeadLinks: [/^http:\/\/localhost/],
  }),
);
