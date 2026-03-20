const fs = require('fs');
const path = require('path');

const API_KEY = "ZZUf1ASi5lIbZbP1AMf2eXoNJdzvmUtAcz5D";
const ENDPOINT = "https://tytostudio-gomisute.microcms.io/api/v1/blogs";

// 本番稼働するホスティングドメイン（暫定として .vercel.app を設定）
// 開発後や独自ドメイン設定後にここを更新します。
const SITE_URL = "https://gomisute.vercel.app";

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
      <a href="${basePath}blog.html" class="mobile-nav-link">ブログ</a>
      <a href="${basePath}privacy.html" class="mobile-nav-link">プライバシーポリシー</a>
    </div>
  </nav>
`;

const getFooterHtml = (basePath) => `
  <footer class="footer">
    <div class="footer-content">
      <ul class="footer-links">
        <li><a href="${basePath}blog.html">ブログ</a></li>
        <li><a href="${basePath}privacy.html">プライバシーポリシー</a></li>
        <li><a href="${basePath}contact.html">お問い合わせ</a></li>
        <li><a href="#">X (Twitter)</a></li>
      </ul>
      <p class="copyright">&copy; 2026 TytoStudio All rights reserved.</p>
    </div>
  </footer>
`;

function generateBlogIndex(blogs) {
  const cardsHtml = blogs.map(blog => {
    const imageUrl = blog.eyecatch ? blog.eyecatch.url : 'gomisute-logo.jpg';
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
  const imageUrl = blog.eyecatch ? blog.eyecatch.url : '../gomisute-logo.jpg';
  
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

function generateSitemap(blogs) {
  const currentDate = new Date().toISOString();
  let urls = `
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog.html</loc>
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
    // publishedAt or updatedAt
    let modDate = new Date(blog.updatedAt || blog.publishedAt).toISOString();
    urls += `
  <url>
    <loc>${SITE_URL}/blog/${blog.id}.html</loc>
    <lastmod>${modDate}</lastmod>
    <priority>0.7</priority>
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

  const blogDir = path.join(__dirname, 'blog');
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir);
  }

  console.log("Generating article pages...");
  for (const blog of blogs) {
    const articleHtml = generateArticlePage(blog);
    fs.writeFileSync(path.join(blogDir, `${blog.id}.html`), articleHtml);
    console.log(` -> Created blog/${blog.id}.html`);
  }

  console.log("Generating SEO files (sitemap.xml and robots.txt)...");
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), generateSitemap(blogs));
  fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`);

  console.log("Blog generation successfully completed 🎉");
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
