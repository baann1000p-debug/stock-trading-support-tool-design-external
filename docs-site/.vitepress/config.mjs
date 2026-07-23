import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    // サイト基本設定
    base: "/stock-trading-support-tool/",
    lang: "ja",
    title: "投資判断支援ツール",
    description:
      "個人投資家向け投資判断支援ツール (Investment Decision Support Tool) の外部仕様書・操作手順書",

    // ヘッダーナビ
    themeConfig: {
      logo: "📊",
      siteTitle: "投資判断支援ツール",

      nav: [
        { text: "ホーム", link: "/" },
        { text: "機能仕様書", link: "/functional-spec" },
        { text: "操作手順書", link: "/user-manual" },
      ],

      sidebar: [
        {
          text: "はじめに",
          items: [{ text: "トップページ", link: "/" }],
        },
        {
          text: "ドキュメント",
          items: [
            { text: "外部機能仕様書", link: "/functional-spec" },
            { text: "操作手順書", link: "/user-manual" },
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
          "https://github.com/baann1000p-debug/stock-trading-support-tool/edit/main/docs/external/:path",
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
          link: "https://github.com/baann1000p-debug/stock-trading-support-tool",
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
  }),
);
