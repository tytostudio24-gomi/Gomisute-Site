const fs = require('fs');
const path = require('path');

const API_KEY = "ZZUf1ASi5lIbZbP1AMf2eXoNJdzvmUtAcz5D";
const ENDPOINT = "https://tytostudio-gomisute.microcms.io/api/v1/blogs";
const FAQ_ENDPOINT = "https://tytostudio-gomisute.microcms.io/api/v1/faq";

// 本番稼働するホスティングドメイン（暫定として .vercel.app を設定）
// 開発後や独自ドメイン設定後にここを更新します。
const SITE_URL = "https://gomisute-site.vercel.app";

const SUPABASE_URL = "https://eqxwitkdemuumhecepdq.supabase.co";
const SUPABASE_KEY = "sb_publishable_ul_TYPyHBtS9uXKxMMa0zg_NpibVewn";

const prefNames = {
  1: "北海道", 2: "青森県", 3: "岩手県", 4: "宮城県", 5: "秋田県", 6: "山形県", 7: "福島県",
  8: "茨城県", 9: "栃木県", 10: "群馬県", 11: "埼玉県", 12: "千葉県", 13: "東京都", 14: "神奈川県",
  15: "新潟県", 16: "富山県", 17: "石川県", 18: "福井県", 19: "山梨県", 20: "長野県", 21: "岐阜県",
  22: "静岡県", 23: "愛知県", 24: "三重県", 25: "滋賀県", 26: "京都府", 27: "大阪府", 28: "兵庫県",
  29: "奈良県", 30: "和歌山県", 31: "鳥取県", 32: "島根県", 33: "岡山県", 34: "広島県", 35: "山口県",
  36: "徳島県", 37: "香川県", 38: "愛媛県", 39: "高知県", 40: "福岡県", 41: "佐賀県", 42: "長崎県",
  43: "熊本県", 44: "大分県", 45: "宮崎県", 46: "鹿児島県", 47: "沖縄県"
};

async function fetchMunicipalities() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/municipalities?select=id,name,prefecture_code,has_official_app,app_name,garbage_page_url,homepage_url&order=prefecture_code.asc,name.asc`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch municipalities: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

async function fetchBlogs() {
  const res = await fetch(ENDPOINT, {
    headers: { "X-MICROCMS-API-KEY": API_KEY }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch blogs: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.contents;
}

async function fetchFaqs() {
  const res = await fetch(FAQ_ENDPOINT, {
    headers: { "X-MICROCMS-API-KEY": API_KEY }
  });
  if (!res.ok) {
    // If endpoint doesn't exist yet, return empty array to prevent build crash
    console.warn(`Failed to fetch FAQs: ${res.status} ${res.statusText}`);
    return [];
  }
  const data = await res.json();
  return data.contents;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

const getNavHtml = (basePath) => `
  <nav class="navbar">
    <div class="nav-content">
      <div class="logo">
        <a href="${basePath}index.html">
          <img src="${basePath}gomisute-logo.jpg" alt="Logo" class="nav-logo-icon">
          ゴミ捨てリマインダー
        </a>
      </div>
      <div class="nav-actions">
        <div class="nav-desktop-links">
          <a href="${basePath}faq.html" class="nav-link">よくあるご質問</a>
          <a href="${basePath}blog.html" class="nav-link">ブログ</a>
          <a href="${basePath}privacy.html" class="nav-link">プライバシーポリシー</a>
        </div>
        <a href="https://apps.apple.com/jp/app/%E3%82%B4%E3%83%9F%E6%8D%A8%E3%81%A6%E3%83%AA%E3%83%9E%E3%82%A4%E3%83%B3%E3%83%80%E3%83%BC/id6758884149" target="_blank" class="nav-btn">ダウンロード</a>
        <button class="menu-toggle" id="menu-toggle" aria-label="Menu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu">
      <a href="${basePath}faq.html" class="mobile-nav-link">よくあるご質問</a>
      <a href="${basePath}blog.html" class="mobile-nav-link">ブログ</a>
      <a href="${basePath}privacy.html" class="mobile-nav-link">プライバシーポリシー</a>
    </div>
  </nav>
`;

const getFooterHtml = (basePath) => `
  <footer class="footer">
    <div class="footer-content">
      <ul class="footer-links">
        <li><a href="${basePath}faq.html">よくあるご質問</a></li>
        <li><a href="${basePath}blog.html">ブログ</a></li>
        <li><a href="${basePath}privacy.html">プライバシーポリシー</a></li>
        <li><a href="${basePath}contact.html">お問い合わせ</a></li>
        <li><a href="https://x.com/TytoStudi0" target="_blank">X (Twitter)</a></li>
      </ul>
      <p class="copyright">&copy; 2026 TytoStudio All rights reserved.</p>
    </div>
  </footer>
`;

function generateBlogIndex(blogs) {
  const cardsHtml = blogs.map(blog => {
    const imageUrl = blog.eyecatch ? blog.eyecatch.url : 'default-thumbnail.jpg';
    return `
      <a href="blog/${blog.id}.html" class="blog-card">
        <div class="blog-card-image" style="background-image: url('${imageUrl}?w=600&h=338&fit=crop');"></div>
        <div class="blog-card-content">
          <span class="blog-card-date">${formatDate(blog.publishedAt)}</span>
          <h2 class="blog-card-title">${blog.title}</h2>
        </div>
      </a>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ブログ - ゴミ捨てリマインダー</title>
  
  <!-- SEO & OGP Tags -->
  <meta name="description" content="ゴミ捨てリマインダーの開発裏話や、新機能のアップデート情報をお届けする公式ブログです。">
  <meta property="og:title" content="お知らせ・ブログ - ゴミ捨てリマインダー">
  <meta property="og:description" content="ゴミ捨てリマインダーの開発裏話や、新機能のアップデート情報をお届けする公式ブログです。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/blog.html">
  <meta property="og:image" content="${SITE_URL}/gomisute-logo.jpg">
  <meta property="og:site_name" content="ゴミ捨てリマインダー">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="google-site-verification" content="XZkDY7y-GVfQq3cuGQ9Szlr42o10cL_jCbJs-I0aBD8" />

  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  ${getNavHtml('')}
  <main class="blog-index-page">
    <div class="blog-header">
      <h1 class="headline">お知らせ・ブログ</h1>
      <p class="feature-desc" style="font-size:18px;">アップデート情報や開発の裏側をお届けします。</p>
    </div>
    <div class="blog-grid">
      ${cardsHtml}
    </div>
  </main>
  ${getFooterHtml('')}
  <script src="js/scripts.js"></script>
</body>
</html>`;
}

function generateArticlePage(blog) {
  const imageUrl = blog.eyecatch ? blog.eyecatch.url : '../default-thumbnail.jpg';

  // Create a plain text description from MicroCMS rich text (strip HTML tags, limit to 100 chars)
  let description = "";
  if (blog.content) {
    description = blog.content.replace(/<[^>]+>/g, '').substring(0, 100).replace(/\s+/g, ' ').trim() + (blog.content.length > 100 ? "..." : "");
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blog.title} - ゴミ捨てリマインダー</title>
  <link rel="stylesheet" href="../css/styles.css">
  
  <!-- OGP & SEO Tags -->
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${blog.title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${SITE_URL}/blog/${blog.id}.html" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="${imageUrl}?w=1200&h=630&fit=crop" />
  <meta property="og:site_name" content="ゴミ捨てリマインダー" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="google-site-verification" content="XZkDY7y-GVfQq3cuGQ9Szlr42o10cL_jCbJs-I0aBD8" />
</head>
<body>
  ${getNavHtml('../')}
  
  <article class="article-page reveal active">
    <div class="article-hero">
      <div class="article-hero-image" style="background-image: url('${imageUrl}?w=2400&h=1000&fit=crop');"></div>
    </div>
    <div class="article-container">
      <header class="article-header">
        <div class="article-meta">
          <span class="article-date">${formatDate(blog.publishedAt)}</span>
          ${blog.category ? `<span class="article-category">${blog.category.name}</span>` : ''}
        </div>
        <h1 class="article-title">${blog.title}</h1>
      </header>
      
      <div class="article-content">
        ${blog.content}
      </div>
      
      <div class="article-footer">
        <a href="../blog.html" class="back-to-blog">&larr; ブログ一覧へ戻る</a>
      </div>
    </div>
  </article>

  ${getFooterHtml('../')}
  <script src="../js/scripts.js"></script>
</body>
</html>`;
}

function updateIndexHtmlWithLatest(blogs) {
  const updates = blogs
    .filter(blog => blog.category && blog.category.name === 'アップデート情報')
    .slice(0, 3);

  let itemsHtml = '';
  if (updates.length > 0) {
    itemsHtml = updates.map(blog => `
      <a href="blog/${blog.id}.html" class="update-item">
        <span class="update-date">${formatDate(blog.publishedAt)}</span>
        <span class="update-tag">${blog.category.name}</span>
        <h3 class="update-title">${blog.title}</h3>
      </a>
    `).join('');
  } else {
    itemsHtml = '<p style="color:var(--color-text-light); padding:20px 0;">まだアップデート情報はありません。</p>';
  }

  const indexPath = path.join(__dirname, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Replace content between <!-- LATEST_UPDATES_START --> and <!-- LATEST_UPDATES_END -->
  const startIndex = indexContent.indexOf('<!-- LATEST_UPDATES_START -->');
  const endIndex = indexContent.indexOf('<!-- LATEST_UPDATES_END -->');

  if (startIndex !== -1 && endIndex !== -1) {
    const before = indexContent.substring(0, startIndex + '<!-- LATEST_UPDATES_START -->'.length);
    const after = indexContent.substring(endIndex);
    const newContent = before + '\n' + itemsHtml + '\n      ' + after;
    fs.writeFileSync(indexPath, newContent);
    console.log(" -> index.html successfully updated with latest updates.");
  } else {
    console.warn(" -> Warning: LATEST_UPDATES placeholders not found in index.html.");
  }
}

function updateIndexHtmlWithFaqs(faqs) {
  if (faqs.length === 0) return;
  const topFaqs = faqs.slice(0, 3);
  const itemsHtml = topFaqs.map(faq => `
        <div class="qa-item">
          <button class="qa-question">
            <span>${faq.question}</span>
            <svg class="qa-icon" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
          </button>
          <div class="qa-answer">
            <div style="padding-bottom: 24px; font-size: 16px; color: var(--color-text-light); line-height: 1.6;">
              ${faq.answer || ''}
            </div>
          </div>
        </div>
  `).join('');

  const indexPath = path.join(__dirname, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Replace content between <!-- LATEST_FAQ_START --> and <!-- LATEST_FAQ_END -->
  const startIndex = indexContent.indexOf('<!-- LATEST_FAQ_START -->');
  const endIndex = indexContent.indexOf('<!-- LATEST_FAQ_END -->');

  if (startIndex !== -1 && endIndex !== -1) {
    const before = indexContent.substring(0, startIndex + '<!-- LATEST_FAQ_START -->'.length);
    const after = indexContent.substring(endIndex);
    const newContent = before + '\n' + itemsHtml + '\n        ' + after;
    fs.writeFileSync(indexPath, newContent);
    console.log(" -> index.html successfully updated with latest FAQs.");
  } else {
    console.warn(" -> Warning: LATEST_FAQ placeholders not found in index.html.");
  }
}

function generateFaqPage(faqs) {
  const itemsHtml = faqs.map(faq => `
        <div class="qa-item">
          <button class="qa-question">
            <span>${faq.question}</span>
            <svg class="qa-icon" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
          </button>
          <div class="qa-answer">
            <div style="padding-bottom: 24px; font-size: 16px; color: var(--color-text-light); line-height: 1.6;">
              ${faq.answer || ''}
            </div>
          </div>
        </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>よくあるご質問 - ゴミ捨てリマインダー</title>
  
  <!-- SEO & OGP Tags -->
  <meta name="description" content="ゴミ捨てリマインダーに関するよくあるご質問（FAQ）をまとめています。">
  <meta property="og:title" content="よくあるご質問 - ゴミ捨てリマインダー">
  <meta property="og:description" content="ゴミ捨てリマインダーに関するよくあるご質問（FAQ）をまとめています。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/faq.html">
  <meta property="og:image" content="${SITE_URL}/gomisute-logo.jpg">
  <meta property="og:site_name" content="ゴミ捨てリマインダー">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  ${getNavHtml('')}
  <main class="blog-index-page">
    <div class="blog-header">
      <h1 class="headline">よくあるご質問</h1>
      <p class="feature-desc" style="font-size:18px;">アプリに関するご不明な点はこちらをご確認ください。</p>
    </div>
    
    <section class="qa" style="padding-top: 0; margin-top: -40px;">
      <div class="qa-content">
        <div class="qa-list">
${itemsHtml}
        </div>
      </div>
    </section>
  </main>
  ${getFooterHtml('')}
  <script src="js/scripts.js"></script>
</body>
</html>`;
}

function generateMunicipalityPage(muni, allInPref) {
  const prefName = prefNames[muni.prefecture_code];
  const title = `${muni.name}のゴミ収集カレンダー・分別アプリをお探しの方へ - ゴミ捨てリマインダー`;
  const description = `${muni.name}（${prefName}）で公式のゴミ収集通知アプリがないとお困りではありませんか？AI分析の結果、${muni.name}には現在公式アプリがないと思われます。ゴミ捨てリマインダーなら、配布される紙のカレンダーをスキャンするだけでリマインダーが作成できます。`;

  // List of other municipalities in same prefecture for internal linking
  const relatedLinksHtml = allInPref
    .filter(m => m.id !== muni.id)
    .slice(0, 10)
    .map(m => {
      const statusLabel = m.has_official_app ? "（公式アプリあり）" : "";
      return `<li><a href="${m.name}.html">${m.name}${statusLabel}</a></li>`;
    }).join('');

  const officialAppNotice = muni.has_official_app
    ? `<div class="info-banner success">
         <p><strong>公式アプリがあるようです：</strong> ${muni.name}には公式のゴミ関連アプリが提供されているようです。まずは公式アプリを確認されることをお勧めします。${muni.app_name ? `<br>アプリ名: ${muni.app_name}` : ''}</p>
         ${muni.garbage_page_url ? `<a href="${muni.garbage_page_url}" target="_blank" class="text-link">自治体のゴミページはこちら &rarr;</a>` : ''}
       </div>`
    : `<div class="info-banner warning">
         <p><strong>公式アプリがないと思われます：</strong> AIによる調査の結果、${muni.name}には現在、公式のスマートフォン向けゴミ収集通知アプリが提供されていない、もしくは限定的な提供にとどまっている可能性が高いです。</p>
       </div>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_URL}/area/${muni.name}.html">
  <meta property="og:image" content="${SITE_URL}/gomisute-logo.jpg">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="stylesheet" href="../css/styles.css">
  <style>
    .area-content { max-width: 800px; margin: 120px auto 80px; padding: 0 20px; line-height: 1.8; }
    .area-header { text-align: center; margin-bottom: 50px; }
    .area-header h1 { font-size: clamp(24px, 5vw, 36px); margin-bottom: 20px; color: var(--color-text); }
    .info-banner { padding: 24px; border-radius: 16px; margin-bottom: 40px; }
    .info-banner.warning { background-color: #fff9e6; border: 1px solid #ffeeba; }
    .info-banner.success { background-color: #e6f7ff; border: 1px solid #bae7ff; }
    .info-banner p { margin: 0; color: #856404; font-size: 16px; }
    .info-banner.success p { color: #0050b3; }
    .feature-card { background: white; border-radius: 24px; padding: 32px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .feature-card h2 { font-size: 22px; margin-bottom: 16px; color: var(--color-accent); }
    .related-areas { margin-top: 60px; padding-top: 40px; border-top: 1px solid #eee; }
    .related-areas ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; list-style: none; padding: 0; }
    .related-areas a { color: var(--color-text-light); text-decoration: none; font-size: 14px; }
    .related-areas a:hover { color: var(--color-accent); text-decoration: underline; }
    .cta-area { text-align: center; margin-top: 50px; }
    .text-link { color: var(--color-accent); text-decoration: none; font-weight: 500; display: inline-block; margin-top: 10px; }
  </style>
</head>
<body>
  ${getNavHtml('../')}
  <main class="area-content">
    <div class="area-header">
      <span style="color: var(--color-accent); font-weight: 600;">${prefName} ${muni.name}</span>
      <h1>${muni.name}のゴミ捨てを、<br>もっとスマートに。</h1>
    </div>

    ${officialAppNotice}

    <div class="feature-card">
      <h2>自治体のデータ提供状況に左右されません</h2>
      <p>「ゴミ捨てリマインダー」は、自治体がオープンデータを提供しているか・公式のアプリがあるかに関わりなく、<strong>全戸に配布される紙のごみ収集カレンダーをAIカメラで撮影するだけ</strong>で、あなた専用の通知スケジュールを作成できます。</p>
      <p>公式アプリがない地域や、PDFしか公開されていない地域でも、今日からすぐに「忘れないゴミ捨て」を始められます。</p>
    </div>

    <div class="feature-card">
      <h2>Apple Watch & Siri でさらに便利に</h2>
      <p>iPhoneだけでなくApple Watchでの確認や、Siriに「明日のゴミは何？」と聞くだけで回答してくれる機能など、公式アプリを上回る利便性を提供します。</p>
    </div>

    <div class="cta-area">
      <a href="https://apps.apple.com/jp/app/%E3%82%B4%E3%83%9F%E6%8D%A8%E3%81%A6%E3%83%AA%E3%83%9E%E3%82%A4%E3%83%B3%E3%83%80%E3%83%BC/id6758884149" target="_blank" class="cta-button">App Storeで無料ダウンロード</a>
      <p style="font-size: 14px; color: var(--color-text-light); margin-top: 15px;">※AIによる分析の結果であり、最新の配信状況と異なる場合があります。</p>
    </div>

    <div class="related-areas">
      <h3>${prefName}の他の自治体</h3>
      <ul>
        ${relatedLinksHtml}
      </ul>
    </div>
  </main>
  ${getFooterHtml('../')}
  <script src="../js/scripts.js"></script>
</body>
</html>`;
}

function generateAreaIndex(municipalities) {
  const stats = {
    total: municipalities.length,
    noApp: municipalities.filter(m => !m.has_official_app).length
  };
  const percentage = Math.round((stats.noApp / stats.total) * 100);

  const muniDataJson = JSON.stringify(municipalities.map(m => ({
    n: m.name,
    p: m.prefecture_code,
    h: m.has_official_app
  })));

  const prefOptionsHtml = Object.entries(prefNames).map(([code, name]) => `<option value="${code}">${name}</option>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全国自治体ゴミアプリ導入状況調査 - ゴミ捨てリマインダー</title>
  <link rel="stylesheet" href="../css/styles.css">
  <style>
    .area-index { max-width: 900px; margin: 120px auto 80px; padding: 0 20px; }
    .stats-card { background: var(--color-accent); color: white; padding: 40px; border-radius: 32px; text-align: center; margin-bottom: 50px; }
    .stats-number { font-size: 64px; font-weight: 800; display: block; margin: 10px 0; }
    .search-section { background: white; padding: 40px; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
    .search-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
    select { width: 100%; padding: 15px; border-radius: 12px; border: 1px solid #ddd; font-size: 16px; appearance: none; background: #f9f9f9; }
    .result-box { margin-top: 40px; padding: 30px; border-radius: 20px; display: none; text-align: center; animation: fadeIn 0.5s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  ${getNavHtml('../')}
  <main class="area-index">
    <div class="stats-card">
      <h1>全国自治体ゴミアプリ調査</h1>
      <p>AIによる分析の結果、日本全国の市町村のうち</p>
      <span class="stats-number">約 ${percentage}%</span>
      <p>の自治体には、公式アプリがないと思われます。</p>
    </div>

    <div class="search-section">
      <h2>お住まいの地域の状況を調べる</h2>
      <div class="search-grid">
        <select id="pref-select">
          <option value="">都道府県を選択</option>
          ${prefOptionsHtml}
        </select>
        <select id="muni-select" disabled>
          <option value="">市区町村を選択</option>
        </select>
      </div>
      <div id="result-box" class="result-box"></div>
    </div>
  </main>

  <script>
    const munis = ${muniDataJson};
    const prefSelect = document.getElementById('pref-select');
    const muniSelect = document.getElementById('muni-select');
    const resultBox = document.getElementById('result-box');

    prefSelect.addEventListener('change', () => {
      const prefCode = parseInt(prefSelect.value);
      muniSelect.innerHTML = '<option value="">市区町村を選択</option>';
      if (prefCode) {
        const filtered = munis.filter(m => m.p === prefCode);
        filtered.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.n;
          opt.textContent = m.n;
          muniSelect.appendChild(opt);
        });
        muniSelect.disabled = false;
      } else {
        muniSelect.disabled = true;
      }
      resultBox.style.display = 'none';
    });

    muniSelect.addEventListener('change', () => {
      const muniName = muniSelect.value;
      if (muniName) {
        const muni = munis.find(m => m.n === muniName);
        resultBox.style.display = 'block';
        if (muni.h) {
          resultBox.style.backgroundColor = '#e6f7ff';
          resultBox.innerHTML = \\\`<h3>\\\${muniName}には公式アプリがあるようです</h3><p>便利な公式アプリを活用しましょう。さらにApple Watch等での通知を希望される場合は、ゴミ捨てリマインダーも併用いただけます。</p><a href="\\\${muniName}.html" class="text-link">詳しく見る &rarr;</a>\\\`;
        } else {
          resultBox.style.backgroundColor = '#fff9e6';
          resultBox.innerHTML = \\\`<h3>\\\${muniName}には公式アプリがないと思われます</h3><p>ゴミ捨てリマインダーなら、紙のカレンダーをスキャンするだけでリマインダーを作成できます。</p><a href="\\\${muniName}.html" class="cta-button" style="margin-top:20px; display:inline-block;">詳しく見る</a>\\\`;
        }
      } else {
        resultBox.style.display = 'none';
      }
    });
  </script>
  ${getFooterHtml('../')}
</body>
</html>`;
}

function generateSitemap(blogs, municipalities) {
  const currentDate = new Date().toISOString();
  let urls = `
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/area/index.html</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog.html</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/faq.html</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy.html</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/siri-setup.html</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/alexa-setup.html</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact.html</loc>
    <priority>0.5</priority>
  </url>`;

  blogs.forEach(blog => {
    let modDate = new Date(blog.updatedAt || blog.publishedAt).toISOString();
    urls += `
  <url>
    <loc>${SITE_URL}/blog/${blog.id}.html</loc>
    <lastmod>${modDate}</lastmod>
    <priority>0.7</priority>
  </url>`;
  });

  municipalities.forEach(muni => {
    urls += `
  <url>
    <loc>${SITE_URL}/area/${encodeURIComponent(muni.name)}.html</loc>
    <priority>0.6</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

async function build() {
  console.log("Fetching blogs from MicroCMS...");
  const blogs = await fetchBlogs();
  console.log(`Fetched ${blogs.length} articles.`);

  console.log("Generating blog.html...");
  const indexHtml = generateBlogIndex(blogs);
  fs.writeFileSync(path.join(__dirname, 'blog.html'), indexHtml);

  console.log("Updating index.html with latest updates...");
  updateIndexHtmlWithLatest(blogs);

  console.log("Fetching FAQs from MicroCMS...");
  const faqs = await fetchFaqs();
  console.log(`Fetched ${faqs.length} FAQs.`);

  console.log("Generating faq.html...");
  const faqHtml = generateFaqPage(faqs);
  fs.writeFileSync(path.join(__dirname, 'faq.html'), faqHtml);

  console.log("Updating index.html with latest FAQs...");
  updateIndexHtmlWithFaqs(faqs);

  const blogDir = path.join(__dirname, 'blog');
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir);
  }

  console.log("Generating article pages...");
  for (const blog of blogs) {
    const articleHtml = generateArticlePage(blog);
    fs.writeFileSync(path.join(blogDir, `${blog.id}.html`), articleHtml);
    console.log(` -> Created blog / ${blog.id}.html`);
  }

  console.log("Fetching municipalities from Supabase...");
  const municipalities = await fetchMunicipalities();
  console.log(`Fetched ${municipalities.length} municipalities.`);

  const areaDir = path.join(__dirname, 'area');
  if (!fs.existsSync(areaDir)) {
    fs.mkdirSync(areaDir);
  }

  console.log("Generating area pages...");
  const areaIndexHtml = generateAreaIndex(municipalities);
  fs.writeFileSync(path.join(areaDir, 'index.html'), areaIndexHtml);

  for (const muni of municipalities) {
    // Only generate pages for those without apps, or all of them?
    // User requested: "自治体のアプリがあるならそのアプリのリンクを出してあげる"
    // This implies we should generate pages for all municipalities to show either 
    // "No app, use this" or "Official app exists, but this is also good".
    const inPref = municipalities.filter(m => m.prefecture_code === muni.prefecture_code);
    const muniHtml = generateMunicipalityPage(muni, inPref);
    fs.writeFileSync(path.join(areaDir, `${muni.name}.html`), muniHtml);
  }
  console.log(` -> Created ${municipalities.length} area pages.`);

  console.log("Generating SEO files (sitemap.xml and robots.txt)...");
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), generateSitemap(blogs, municipalities));
  fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User - agent: *
    Allow: /
  Sitemap: ${SITE_URL}/sitemap.xml
    `);

  console.log("Blog and Area generation successfully completed 🎉");
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
