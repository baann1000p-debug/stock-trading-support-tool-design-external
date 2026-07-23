const fs = require('fs');

async function run() {
  const githubToken = process.env.GITHUB_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const prNumber = process.env.PR_NUMBER;
  const githubRepository = process.env.GITHUB_REPOSITORY;
  const apiUrl = process.env.GITHUB_API_URL || 'https://api.github.com';

  if (!githubToken || !geminiApiKey || !prNumber || !githubRepository) {
    console.error('必要な環境変数が不足しています。');
    console.error(`GITHUB_TOKEN: ${githubToken ? '設定あり' : '未設定'}`);
    console.error(`GEMINI_API_KEY: ${geminiApiKey ? '設定あり' : '未設定'}`);
    console.error(`PR_NUMBER: ${prNumber || '未設定'}`);
    console.error(`GITHUB_REPOSITORY: ${githubRepository || '未設定'}`);
    process.exit(1);
  }

  const [owner, repo] = githubRepository.split('/');

  console.log(`PRの差分を取得中... (Repository: ${githubRepository}, PR: ${prNumber})`);

  // 1. GitHub APIからPRのdiffを取得
  let diffText = '';
  try {
    const response = await fetch(`${apiUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3.diff',
        'User-Agent': 'gemini-review-script'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub APIエラー: ${response.status} ${response.statusText}\n${errText}`);
    }

    diffText = await response.text();
  } catch (error) {
    console.error('PRの差分取得に失敗しました:', error);
    process.exit(1);
  }

  if (!diffText.trim()) {
    console.log('差分が空です。レビューをスキップします。');
    try {
      await postComment(apiUrl, owner, repo, prNumber, githubToken, '🤖 **Geminiによるコードレビュー結果:**\n\n検出された差分コードが空であるため、レビューをスキップしました。');
    } catch (commentError) {
      console.error('スキップコメントの投稿に失敗しました:', commentError);
    }
    return;
  }

  // 差分が長すぎる場合の対策 (例: 100,000文字で切り詰める)
  const MAX_DIFF_CHARS = 100000;
  let isTruncated = false;
  if (diffText.length > MAX_DIFF_CHARS) {
    diffText = diffText.substring(0, MAX_DIFF_CHARS);
    isTruncated = true;
  }

  console.log(`Gemini APIに問い合わせ中... (diff文字数: ${diffText.length})`);

  // 2. Gemini APIの呼び出し
  let reviewComment = '';
  try {
    // 最新モデル gemini-3.6-flash を使用
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;
    
    const prompt = `あなたはプロフェッショナルなソフトウェアエンジニアです。
以下のGitHub Pull Requestの差分（diff）を注意深くレビューし、改善点、潜在的なバグ、セキュリティ上の脆弱性、またはリファクタリングの提案を日本語で回答してください。

特に問題がない場合は、「コードに大きな問題は見つかりませんでした。素晴らしい実装です！」のようにポジティブなフィードバックを簡潔に伝えてください。

指摘がある場合は、以下のガイドラインに従ってください：
- 改善案がある場合は、具体的なコード例を提示してください。
- 重要な問題（バグやセキュリティ脆弱性）と、軽微な提案（可読性やスタイル）を分けて記載してください。

---
差分データ${isTruncated ? '（文字数制限のため一部切り詰められています）' : ''}:
\`\`\`diff
${diffText}
\`\`\`
`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini APIエラー: ${response.status} ${response.statusText}\n${errText}`);
    }

    const resData = await response.json();
    reviewComment = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reviewComment) {
      throw new Error('Gemini APIから期待する応答が得られませんでした。');
    }
  } catch (error) {
    console.error('Gemini APIとの通信に失敗しました:', error);
    process.exit(1);
  }

  if (isTruncated) {
    reviewComment = `⚠️ **警告**: PRの差分が大きすぎるため、先頭の ${MAX_DIFF_CHARS} 文字のみを対象にレビューしました。\n\n` + reviewComment;
  }

  console.log('PRにレビューコメントを投稿中...');

  // 3. 結果をGitHubのPRコメントとして投稿
  try {
    await postComment(apiUrl, owner, repo, prNumber, githubToken, `🤖 **Geminiによるコードレビュー結果:**\n\n${reviewComment}`);
    console.log('レビューコメントの投稿が完了しました！');
  } catch (error) {
    console.error('PRコメントの投稿に失敗しました:', error);
    process.exit(1);
  }
}

async function postComment(apiUrl, owner, repo, prNumber, token, body) {
  const response = await fetch(`${apiUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'gemini-review-script'
    },
    body: JSON.stringify({ body })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`コメント投稿エラー: ${response.status} ${response.statusText}\n${errText}`);
  }
}

run();
