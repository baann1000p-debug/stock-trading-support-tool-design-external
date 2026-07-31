const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  const outputDir = path.join(__dirname, 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
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

      // 02. ポジションサイジング計算モーダル (PositionSizingModal)
      const calcBtn = page.locator('button:has-text("ポジションサイズ計算"), button:has-text("ポジションサイジング")').first();
      if (await calcBtn.count() > 0) {
        console.log('Capturing modal_02_position_sizing.png & 03b_position_sizing_modal.png...');
        await calcBtn.click({ force: true });
        await page.waitForTimeout(1500);
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
      if (await addStockBtn.count() > 0) {
        console.log('Capturing modal_04_add_custom_stock.png...');
        await addStockBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_04_add_custom_stock.png') });
        await closeModal();
      }

      // 05. 売却決済モーダル (SellModal)
      const sellBtn = page.locator('button:has-text("売却"), button:has-text("決済")').first();
      if (await sellBtn.count() > 0) {
        console.log('Capturing modal_05_sell.png...');
        await sellBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_05_sell.png') });
        await closeModal();
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
      await tradeNav.click();
      await page.waitForTimeout(3000);
      console.log('Capturing 06_trade_journal.png...');
      await page.screenshot({ path: path.join(outputDir, '06_trade_journal.png') });

      // 06. 意思決定ログ（メモ）編集モーダル (MemoModal)
      const memoBtn = page.locator('.memo-edit-btn, button:has-text("メモ"), button:has-text("編集")').first();
      if (await memoBtn.count() > 0) {
        console.log('Capturing modal_06_memo.png...');
        await memoBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(outputDir, 'modal_06_memo.png') });
        await closeModal();
      }

      // 09. 取引履歴編集モーダル (TradeEditModal)
      const editBtn = page.locator('button:has-text("編集"), .edit-btn').last();
      if (await editBtn.count() > 0) {
        console.log('Capturing modal_09_trade_edit.png...');
        await editBtn.click({ force: true });
        await page.waitForTimeout(1500);
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

