(() => {
  const isSubPage = location.pathname.includes('/pages/');
  const base = isSubPage ? '../' : '';
  const dataUrl = `${base}data/articles.json`;
  const categoryIcons = {basic:'▤',technical:'⌁',fundamental:'▦',market:'◫',strategy:'◇'};
  const categoryNames = window.STOCKWIKI_CATEGORY_NAMES || {};
  const categories = window.STOCKWIKI_CATEGORIES || [];

  async function getArticles(){
    try {
      const response = await fetch(dataUrl);
      if(!response.ok) throw new Error('無法讀取文章資料');
      return await response.json();
    } catch(error) {
      console.error(error);
      return [];
    }
  }
  function articleUrl(id){ return `${base}pages/article.html?id=${encodeURIComponent(id)}`; }
  function categoryUrl(id){ return `${base}pages/categories.html?category=${encodeURIComponent(id)}`; }
  function escapeHtml(value=''){
    return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }
  function renderCategoryCard(category, articles){
    const count = articles.filter(a => a.category === category.id).length;
    return `<a class="category-card" href="${categoryUrl(category.id)}"><span class="category-icon">${categoryIcons[category.id] || '•'}</span><h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.description)}</p><span class="category-meta">${count} 篇文章　→</span></a>`;
  }
  function renderArticleCard(article){
    return `<a class="article-card" href="${articleUrl(article.id)}"><span class="article-category">${escapeHtml(categoryNames[article.category] || '其他知識')}</span><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.description)}</p><div class="article-card-bottom"><span>${escapeHtml(article.date || '')}</span><span class="read-more">閱讀文章 →</span></div></a>`;
  }
  function goSearch(keyword){
    const q = keyword.trim();
    if(!q) return;
    location.href = `${base}pages/categories.html?q=${encodeURIComponent(q)}`;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if(menuButton && nav){
      menuButton.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(open));
      });
    }

    const articles = await getArticles();
    const homeCategories = document.getElementById('home-categories');
    if(homeCategories) homeCategories.innerHTML = categories.map(c => renderCategoryCard(c, articles)).join('');

    const featured = document.getElementById('featured-articles');
    if(featured){
      const preferred = ['stock-basics','ma-indicator','rsi-indicator','eps-basics','macd-indicator','risk-management'];
      const sorted = preferred.map(id => articles.find(a => a.id === id)).filter(Boolean);
      featured.innerHTML = sorted.slice(0,3).map(renderArticleCard).join('');
    }

    const categoryContainer = document.getElementById('category-articles');
    if(categoryContainer){
      const params = new URLSearchParams(location.search);
      let selected = params.get('category') || 'all';
      const query = (params.get('q') || '').trim().toLowerCase();
      const filters = document.getElementById('category-filters');
      const count = document.getElementById('result-count');
      const choices = [{id:'all',name:'全部文章'}, ...categories];
      function update(){
        const filtered = articles.filter(a => (selected === 'all' || a.category === selected) &&
          (!query || [a.title,a.description,a.category,...(a.tags||[]),...(a.content||[]).flatMap(s=>[s.heading,...(s.paragraphs||[])])].join(' ').toLowerCase().includes(query)));
        filters.querySelectorAll('.filter-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.category === selected));
        count.textContent = query ? `「${params.get('q')}」的搜尋結果：${filtered.length} 篇` : `共 ${filtered.length} 篇文章`;
        categoryContainer.innerHTML = filtered.length ? filtered.map(renderArticleCard).join('') : '<div class="empty-state">目前找不到符合條件的文章，請試試其他關鍵字。</div>';
      }
      filters.innerHTML = choices.map(c => `<button class="filter-tab ${c.id===selected?'active':''}" data-category="${c.id}">${escapeHtml(c.name)}</button>`).join('');
      filters.addEventListener('click', event => {
        const btn = event.target.closest('[data-category]');
        if(!btn) return;
        selected = btn.dataset.category;
        const next = new URL(location.href);
        if(selected === 'all') next.searchParams.delete('category'); else next.searchParams.set('category',selected);
        history.replaceState({},'',next);
        update();
      });
      update();
    }

    const articleContent = document.getElementById('article-content');
    if(articleContent){
      const id = new URLSearchParams(location.search).get('id');
      const article = articles.find(a => a.id === id);
      if(!article){
        articleContent.innerHTML = '<div class="empty-state">找不到這篇文章。<br><a class="link-arrow" href="categories.html">返回知識分類 →</a></div>';
      } else {
        document.title = `${article.title}｜StockWiki`;
        const sections = (article.content || []).map(section => `<section class="article-body"><h2>${escapeHtml(section.heading)}</h2>${(section.paragraphs||[]).map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('');
        articleContent.innerHTML = `<div class="breadcrumb"><a href="../index.html">首頁</a>　/　<a href="categories.html?category=${encodeURIComponent(article.category)}">${escapeHtml(categoryNames[article.category]||'知識文章')}</a>　/　文章內容</div><span class="article-category">${escapeHtml(categoryNames[article.category]||'知識文章')}</span><h1>${escapeHtml(article.title)}</h1><p class="article-lead">${escapeHtml(article.description)}</p><div class="article-meta"><span>發布日期：${escapeHtml(article.date||'')}</span><span>StockWiki 知識整理</span></div>${sections}<div class="article-tags">${(article.tags||[]).map(tag=>`<span class="tag"># ${escapeHtml(tag)}</span>`).join('')}</div>`;
      }
    }

    const searchForm = document.getElementById('hero-search');
    if(searchForm) searchForm.addEventListener('submit', event => {
      event.preventDefault();
      goSearch(document.getElementById('hero-search-input').value);
    });
    document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', () => goSearch(button.dataset.search)));
  });
})();
