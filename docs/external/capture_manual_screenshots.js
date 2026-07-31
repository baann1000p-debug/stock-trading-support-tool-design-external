const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// DBに直接テスト用売却履歴を挿入するためのモジュール取得
let dbHelpers = null;
try {
  dbHelpers = require('../../src/workflow/core/db.js');
} catch (e) {
  console.log('db.js module require note:', e.message);
}

async function captureScreenshots() {
  const outputDir = path.join(__dirname, 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // DBシードの直接実行
  if (dbHelpers && dbHelpers.getUserByUsername) {
    try {
      const user = await dbHelpers.getUserByUsername('manual_user');
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const recResult = await dbHelpers.addCustomRecommendation(
          '7203.T',
          'トヨタ自動車',
          2500,
          2500,
          100,
          'テストエントリー',
          today,
          '景気敏感',
          user.id,
          'BUY'
        );
        console.log('addCustomRecommendation result:', recResult);

        const recs = await dbHelpers.getAllRecommendations(user.id);
        if (recs && recs.length > 0) {
          const targetRec = recs.find((r) => r.ticker === '7203.T') || recs[0];
          const sellRes = await dbHelpers.sellRecommendation(targetRec.id, 50, 2750, user.id, today);
          console.log('🎉 Successfully seeded test trade via DB helpers!', sellRes);
        }
      }
    } catch (e) {
      console.log('Direct DB seeding error:', e.message);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1850, height: 1050 } });

  try {
    const targetUrls = [
      'http://localhost:5173/stock-trading-support-tool/',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5174/stock-trading-support-tool/',
    ];
    let connected = false;
    for (const url of targetUrls) {
      try {
        console.log(`Trying to navigate to ${url}...`);
        await page.goto(url, { timeout: 5000 });
        console.log(`Successfully connected to ${url}`);
        connected = true;
        break;
      } catch (e) {
        console.log(`Failed to connect to ${url}: ${e.message}`);
      }
    }
    if (!connected) {
      throw new Error('Could not connect to any running dev server URL.');
    }
    await page.waitForTimeout(1000);

    // ログアウト状態を確認
    const logoutBtn = page.locator('.logout-btn');
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
    }

    // 01. ログイン画面の確認（未ログインの場合）
    const usernameInput = page.locator('#login-username');
    if (await usernameInput.count() > 0) {
      console.log('Capturing 01_login.png...');
      await page.screenshot({ path: path.join(outputDir, '01_login.png') });

      // ログイン処理 (manual_user / Pass123456!)
      console.log('Filling login form with created user...');
      await page.fill('#login-username', 'manual_user');
      await page.fill('#login-password', 'Pass123456!');
      await page.click('.login-btn-submit');
      await page.waitForTimeout(3000);
    } else {
      console.log('Already logged in, bypassing login form fill.');
    }

    // 各種モーダル撮影で必要な「エントリー中銘柄」および「売却履歴」をAPI経由で事前にデータ追加しておく
    try {
      console.log('Seeding initial trade and recommendation data via API...');
      await page.evaluate(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // 1. エントリー追加
        const addRes = await fetch('/api/recommendations/custom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ticker: '7203.T',
            entryPrice: 2500,
            quantity: 100,
            recommendationType: 'BUY',
            entryDate: new Date().toISOString().split('T')[0],
            memo: 'テスト用エントリー'
          })
        });
        
        if (addRes.ok) {
          const resData = await addRes.json();
          const itemId = resData.id || (resData.item && resData.item.id);
          if (itemId) {
            // 2. 追加した銘柄の一部を売却して確定取引履歴(Trade)を作成
            await fetch(`/api/recommendations/${itemId}/sell`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                quantity: 50,
                price: 2750,
                sellDate: new Date().toISOString().split('T')[0]
              })
            });
          }
        }
      });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('Data seeding failed:', e.message);
    }

    // 02. ダッシュボード画面
    console.log('Capturing 02_dashboard.png...');
    await page.screenshot({ path: path.join(outputDir, '02_dashboard.png') });

    // Helper: close modal safely
    const closeModal = async () => {
      try {
        const closeBtn = page.locator('.close-btn, button:has-text("閉じる"), button:has-text("キャンセル"), button:has-text("×")').first();
        if (await closeBtn.count() > 0 && await closeBtn.isVisible()) {
          await closeBtn.click({ force: true });
        } else {
          await page.keyboard.press('Escape');
        }
      } catch (e) {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(800);
      // もしオーバーレイがまだあればオーバーレイ端をクリック
      const overlay = page.locator('.modal-overlay');
      if (await overlay.count() > 0 && await overlay.isVisible()) {
        await overlay.click({ position: { x: 10, y: 10 }, force: true });
        await page.waitForTimeout(500);
      }
    };

    // 10. 画面ガイド・ヘルプモーダル (PageInfoModal)
    const pageInfoBtn = page.locator('button[title="この画面について"]').first();
    if (await pageInfoBtn.count() > 0) {
      console.log('Capturing modal_10_page_info.png...');
      await pageInfoBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outputDir, 'modal_10_page_info.png') });
      await closeModal();
    }

    // 08. 市場アノマリー詳細モーダル (AnomalyModal)
    const anomalyBtn = page.locator('.anomaly-item .memo-edit-btn, button:has-text("アノマリーを追加"), button:has-text("追加")').first();
    if (await anomalyBtn.count() > 0) {
      console.log('Capturing modal_08_anomaly.png...');
      await anomalyBtn.click({ force: true });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outputDir, 'modal_08_anomaly.png') });
      await closeModal();
    }

    // 3. 推奨銘柄画面
    console.log('Navigating to 推奨銘柄...');
    const recNav = page.locator('.nav-btn:has-text("推奨銘柄")').first();
    if (await recNav.count() > 0) {
      await recNav.click();
      await page.waitForTimeout(3000);
      console.log('Capturing 03_recommendations.png...');
      await page.screenshot({ path: path.join(outputDir, '03_recommendations.png') });

      // 01. AI評価スコア判定根拠モーダル (RecommendationLogicModal)
      const logicBtn = page.locator('button[title*="算出ロジック"], button:has-text("ロジック")').first();
      if (await logicBtn.count() > 0) {
        console.log('Capturing modal_01_logic.png...');
        await logicBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_01_logic.png') });
        await closeModal();
      }

      // 06. ポジションサイジング・意思決定メモ登録モーダル (MemoModal)
      const entryBtn = page.locator('button.entry-btn, button:has-text("エントリー")').filter({ hasText: 'エントリー' }).first();
      if (await entryBtn.count() > 0 && await entryBtn.isVisible()) {
        console.log('Capturing modal_06_memo.png & modal_02_position_sizing.png...');
        await entryBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outputDir, 'modal_06_memo.png') });
        await page.screenshot({ path: path.join(outputDir, 'modal_02_position_sizing.png') });
        await page.screenshot({ path: path.join(outputDir, '03b_position_sizing_modal.png') });
        await closeModal();
      }

      // 03. 詳細チャート表示モーダル (RecommendationChartModal)
      const chartBtn = page.locator('button:has-text("チャート")').first();
      if (await chartBtn.count() > 0) {
        console.log('Capturing modal_03_chart.png...');
        await chartBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_03_chart.png') });
        await closeModal();
      }

      // 07. 関連ニュース一覧モーダル (NewsModal)
      const newsBtn = page.locator('button:has-text("ニュース")').first();
      if (await newsBtn.count() > 0) {
        console.log('Capturing modal_07_news.png...');
        await newsBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_07_news.png') });
        await closeModal();
      }
    }

    // 4. エントリー中銘柄画面
    console.log('Navigating to エントリー中銘柄...');
    const posNav = page.locator('.nav-btn:has-text("エントリー中銘柄")').first();
    if (await posNav.count() > 0) {
      await posNav.click();
      await page.waitForTimeout(3000);
      console.log('Capturing 04_active_positions.png with expanded viewport...');
      await page.setViewportSize({ width: 1850, height: 1350 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outputDir, '04_active_positions.png') });
      await page.setViewportSize({ width: 1850, height: 1050 });

      // 04. 手動銘柄追加モーダル (AddCustomStockModal)
      const addStockBtn = page.locator('button:has-text("銘柄を手動追加"), button:has-text("手動追加")').first();
      if (await addStockBtn.count() > 0 && await addStockBtn.isVisible()) {
        console.log('Capturing modal_04_add_custom_stock.png...');
        await addStockBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_04_add_custom_stock.png') });
        
        // 確実に入力して登録
        const tickerInput = page.locator('#modal-ticker-input');
        if (await tickerInput.count() > 0 && await tickerInput.isVisible()) {
          await tickerInput.fill('7203.T');
          await page.fill('#modal-entry-price-input', '2500');
          const submitAddBtn = page.locator('button[type="submit"].submit-btn, form button[type="submit"]').first();
          if (await submitAddBtn.count() > 0) {
            await submitAddBtn.click({ force: true });
            await page.waitForTimeout(2000);
          } else {
            await closeModal();
          }
        } else {
          await closeModal();
        }
      }

      // 05. 売却決済モーダル (SellModal)
      const sellBtn = page.locator('button:has-text("売却"), button:has-text("決済")').first();
      if (await sellBtn.count() > 0 && await sellBtn.isVisible()) {
        console.log('Capturing modal_05_sell.png...');
        await sellBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_05_sell.png') });
        
        // 売却を確定させて DB に確定損益・取引履歴を作成
        const sellQtyInput = page.locator('#sell-quantity-input');
        if (await sellQtyInput.count() > 0 && await sellQtyInput.isVisible()) {
          await sellQtyInput.fill('100');
          await page.fill('#sell-price-input', '2700');
          const submitSellBtn = page.locator('button[type="submit"].submit-btn, form button[type="submit"]').first();
          if (await submitSellBtn.count() > 0) {
            await submitSellBtn.click({ force: true });
            await page.waitForTimeout(2000);
          } else {
            await closeModal();
          }
        } else {
          await closeModal();
        }
      }
    }

    // 5. チャート分析画面
    console.log('Navigating to チャート分析...');
    const chartNav = page.locator('.nav-btn:has-text("チャート分析")').first();
    if (await chartNav.count() > 0) {
      await chartNav.click();
      await page.waitForTimeout(3500);
      console.log('Capturing 05_chart_analysis.png with expanded viewport...');
      await page.setViewportSize({ width: 1366, height: 1600 });
      await page.waitForTimeout(1000);
      const combinedCard = page.locator('.tab-pane.active').first();
      if (await combinedCard.count() > 0) {
        await combinedCard.screenshot({ path: path.join(outputDir, '05_chart_analysis.png') });
      } else {
        await page.screenshot({ path: path.join(outputDir, '05_chart_analysis.png'), fullPage: true });
      }
      await page.setViewportSize({ width: 1366, height: 850 });
    }

    // 6. 運用状況画面
    console.log('Navigating to 運営状況 / 運用状況...');
    const tradeNav = page.locator('.nav-btn:has-text("運営状況"), .nav-btn:has-text("運用状況")').first();
    if (await tradeNav.count() > 0) {
      // 売却履歴データが無い場合に備えて API 経由でテスト売却履歴データを登録
      try {
        await page.evaluate(async () => {
          const token = localStorage.getItem('token');
          await fetch('/api/trades', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ticker: '7203.T',
              name: 'トヨタ自動車',
              trade_type: 'BUY',
              entry_price: 2500,
              sell_price: 2750,
              quantity: 100,
              realized_pnl: 25000,
              memo: '検証用売却メモ',
              sold_at: new Date().toISOString()
            })
          });
        });
      } catch (e) {
        console.log('Failed to seed trade data:', e.message);
      }

      await tradeNav.click();
      await page.waitForTimeout(3000);
      console.log('Capturing 06_trade_journal.png...');
      await page.screenshot({ path: path.join(outputDir, '06_trade_journal.png') });

      // 06. 意思決定ログ（メモ）編集モーダル (MemoModal)
      const memoBtn = page.locator('.memo-edit-btn, button:has-text("メモ")').first();
      if (await memoBtn.count() > 0 && await memoBtn.isVisible()) {
        console.log('Capturing modal_06_memo.png...');
        await memoBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_06_memo.png') });
        await closeModal();
      }

      // 09. 取引履歴編集モーダル (TradeEditModal)
      // テーブル一覧モードに切り替える
      const tableToggleBtn = page.locator('button:has-text("一覧表")').first();
      console.log('tableToggleBtn count:', await tableToggleBtn.count());
      if (await tableToggleBtn.count() > 0 && await tableToggleBtn.isVisible()) {
        console.log('Clicking 一覧表 toggle button...');
        await tableToggleBtn.click({ force: true });
        await page.waitForTimeout(1500);
      }

      const tradeRow = page.locator('.data-table tbody tr').first();
      console.log('tradeRow count:', await tradeRow.count());
      if (await tradeRow.count() > 0) {
        console.log('tradeRow isVisible:', await tradeRow.isVisible());
      }
      if (await tradeRow.count() > 0 && await tradeRow.isVisible()) {
        console.log('Capturing modal_09_trade_edit.png...');
        await tradeRow.click({ force: true });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outputDir, 'modal_09_trade_edit.png') });
        await closeModal();
      }
    }

    // 7. シグナル勝率検証画面
    console.log('Navigating to シグナル勝率検証...');
    const sigNav = page.locator('.nav-btn:has-text("シグナル勝率検証")').first();
    if (await sigNav.count() > 0) {
      await sigNav.click();
      await page.waitForTimeout(3500);
      console.log('Capturing 07_signal_performance.png with 2400px height & split card images...');
      await page.setViewportSize({ width: 1850, height: 2400 });
      await page.waitForTimeout(1000);

      // 1. 全体フル画像
      await page.screenshot({ path: path.join(outputDir, '07_signal_performance.png') });

      // 2. 上部サマリー＆シグナル別勝率カード群 (07a)
      const tabPane = page.locator('.tab-pane.active').first();
      if (await tabPane.count() > 0) {
        await page.screenshot({
          path: path.join(outputDir, '07a_signal_performance_summary.png'),
          clip: { x: 260, y: 0, width: 1550, height: 1160 }
        });

        // 3. 下部スコア別勝率ボード＆追跡カード (07b)
        await page.screenshot({
          path: path.join(outputDir, '07b_signal_performance_score.png'),
          clip: { x: 260, y: 1160, width: 1550, height: 1100 }
        });
      }

      await page.setViewportSize({ width: 1850, height: 1050 });
    }

    // 8. 過去のAIレポート画面
    console.log('Navigating to 過去のAIレポート...');
    const repNav = page.locator(`.sidebar button:has-text("過去のAIレポート")`);
    if (await repNav.count() > 0) {
      await repNav.click();
      await page.waitForTimeout(2000);
      console.log('Capturing 08_ai_reports.png...');
      await page.screenshot({ path: path.join(outputDir, '08_ai_reports.png') });
    }

    console.log('🎉 Successfully captured all screens and modal screenshots!');
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();

