/**
 * 机场 TOP1 - 核心逻辑与交互 App JS
 * 站长笔记式自然交互（去AI机器味）
 */

let state = {
    currentTab: 'home',
    compareList: [], // Array of airport IDs
    filters: {
        type: 'all',
        feature: 'all'
    },
    searchQuery: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    try { renderHome(); } catch (e) { console.error('Error rendering Home:', e); }
    try { renderRecommend(); } catch (e) { console.error('Error rendering Recommend:', e); }
    try { renderDirectory(); } catch (e) { console.error('Error rendering Directory:', e); }
    try { renderReviews(); } catch (e) { console.error('Error rendering Reviews:', e); }
    try { renderBlog(); } catch (e) { console.error('Error rendering Blog:', e); }
    try { renderProtocols(); } catch (e) { console.error('Error rendering Protocols:', e); }
    try { renderBlackholes(); } catch (e) { console.error('Error rendering Blackholes:', e); }
    try { renderCompareTable(); } catch (e) { console.error('Error rendering CompareTable:', e); }
});

// Navigation Switcher
function switchTab(tabId) {
    state.currentTab = tabId;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Mobile Nav Toggle
function toggleMobileNav() {
    const nav = document.getElementById('mobileNav');
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.querySelector('#themeToggle i');
    if (document.body.classList.contains('light-theme')) {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// Top Alert Close
function closeTopAlert() {
    const bar = document.getElementById('topAlertBar');
    if (bar) bar.style.display = 'none';
}

// Toast Notification System
function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-accent"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Copy Discount Code
function copyDiscountCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showToast(`已复制 7 折优惠码：<strong style="color:var(--primary-cyan); font-size: 1.05rem;">${code}</strong>`);
    }).catch(() => {
        showToast(`优惠码：${code}`);
    });
}

/* ==========================================================================
   Renderers
   ========================================================================== */

// 1. Render Home View
function renderHome() {
    const grid = document.getElementById('homeRecommendedGrid');
    const reviewsGrid = document.getElementById('homeReviewsGrid');
    if (!grid || !reviewsGrid) return;

    // Display all airports on home page
    grid.innerHTML = AIRPORTS_DATA.map(ap => createAirportCardHTML(ap)).join('');
    reviewsGrid.innerHTML = REVIEWS_DATA.slice(0, 6).map(rev => createReviewCardHTML(rev)).join('');
}

// 2. Render Recommend View
function renderRecommend() {
    const grid = document.getElementById('recommendGrid');
    if (!grid) return;

    let filtered = AIRPORTS_DATA.filter(ap => {
        if (state.filters.type !== 'all' && ap.type !== state.filters.type) {
            return false;
        }
        if (state.filters.feature !== 'all' && !ap.features.includes(state.filters.feature)) {
            return false;
        }
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            return ap.name.toLowerCase().includes(query) ||
                   ap.tagline.toLowerCase().includes(query) ||
                   ap.protocols.some(p => p.toLowerCase().includes(query));
        }
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);">
            <i class="fa-solid fa-ban" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
            未找到匹配的机场，可以尝试重置筛选条件。
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map(ap => createAirportCardHTML(ap)).join('');
}

// 3. Render Directory View
function renderDirectory() {
    const tbody = document.getElementById('directoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = AIRPORTS_DATA.map(ap => {
        const inCompare = state.compareList.includes(ap.id);
        const logoHtml = ap.logo ? `<img src="${ap.logo}" alt="${ap.name}" style="width: 28px; height: 28px; border-radius: 6px; vertical-align: middle; margin-right: 8px;">` : '';
        const affUrl = ap.affUrl && ap.affUrl !== '#' ? ap.affUrl : '#';

        return `
            <tr class="${ap.id === 'ap-huanqiuti' ? 'row-highlight-cyan' : ''}">
                <td>
                    <div style="display: flex; align-items: center;">
                        ${logoHtml}
                        <div>
                            <strong style="color: var(--text-main); font-size: 0.98rem;">${ap.name}</strong>
                            <div style="font-size: 0.78rem; color: var(--text-dim);">${ap.tagline}</div>
                        </div>
                    </div>
                </td>
                <td><span class="ap-badge">${ap.badge}</span></td>
                <td>${ap.protocols.map(p => `<span class="tag-chip">${p}</span>`).join(' ')}</td>
                <td>
                    <strong style="color: var(--primary-cyan); font-size: 1rem;">￥${ap.priceMin}</strong> 
                    <span style="font-size: 0.75rem; color: var(--text-dim); text-decoration: line-through;">￥${ap.priceOriginal}</span>
                </td>
                <td><span style="font-size: 0.85rem; color: var(--accent-green);"><i class="fa-solid fa-check"></i> ${ap.streamingUnlock}</span></td>
                <td>
                    <div class="coupon-highlight-bar" style="margin:0; padding: 4px 8px;" onclick="copyDiscountCode('${ap.discountCode}')" title="点击复制优惠码">
                        <span class="coupon-tag-badge">${ap.discountPercent}</span>
                        <span class="coupon-code-val" style="font-size: 0.88rem;">${ap.discountCode} <i class="fa-regular fa-copy"></i></span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <a href="${affUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="text-decoration: none;">
                            官网直达
                        </a>
                        <button class="btn btn-sm ${inCompare ? 'btn-secondary' : 'btn-glass'}" onclick="toggleCompare('${ap.id}')">
                            ${inCompare ? '已选' : '+对比'}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. Render Reviews View
function renderReviews() {
    const list = document.getElementById('reviewsList');
    if (!list) return;

    list.innerHTML = REVIEWS_DATA.map(rev => createReviewCardHTML(rev, true)).join('');
}

// Render Blog View (30 SEO Articles)
function renderBlog() {
    const container = document.getElementById('blogArticlesList');
    if (!container) return;

    if (typeof BLOG_ARTICLES_DATA === 'undefined') return;

    let list = BLOG_ARTICLES_DATA;
    if (state.blogCategory && state.blogCategory !== 'all') {
        list = BLOG_ARTICLES_DATA.filter(item => 
            item.category === state.blogCategory || 
            item.tags.includes(state.blogCategory)
        );
    }

    if (list.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-dim);">
            <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px; display: block;"></i>
            未找到该主题的文章。
        </div>`;
        return;
    }

    container.innerHTML = list.map(item => createBlogCardHTML(item)).join('');
}

function createBlogCardHTML(item) {
    const isHuanQiu = item.id === 'blog-04' || item.isHuanQiuFeatured;
    const targetUrl = item.url ? item.url : 'javascript:void(0)';
    const clickHandler = item.url ? `window.location.href='${item.url}'` : `openBlogModal('${item.id}')`;

    return `
        <div class="review-card ${isHuanQiu ? 'card-featured-accent' : ''}" onclick="${clickHandler}" style="cursor: pointer; position: relative;">
            <div class="rev-header">
                <div>
                    <h3 class="rev-title" style="font-size: 1.15rem; margin-bottom: 6px;">
                        ${isHuanQiu ? '<span style="color:var(--primary-cyan); font-size:0.8rem; border:1px solid var(--border-color); padding:2px 8px; border-radius:4px; margin-right:6px;">置顶推荐</span>' : ''}
                        <a href="${targetUrl}" onclick="event.stopPropagation();" style="color:inherit; text-decoration:none;">${item.title}</a>
                    </h3>
                    <div class="rev-meta">
                        <span><i class="fa-solid fa-user"></i> ${item.author}</span>
                        <span><i class="fa-solid fa-calendar"></i> ${item.date}</span>
                        <span><i class="fa-solid fa-eye"></i> ${item.views} 次阅读</span>
                    </div>
                </div>
            </div>
            <p class="rev-summary" style="margin-top: 10px; font-size: 0.92rem; color: var(--text-muted); line-height: 1.6;">${item.summary}</p>
            <div class="ap-tags" style="margin-top: 12px;">
                ${item.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}
            </div>
            <div style="margin-top: 14px; text-align: right; font-size: 0.88rem; color: var(--primary-cyan); font-weight: 600;">
                阅读全文 <i class="fa-solid fa-arrow-right"></i>
            </div>
        </div>
    `;
}

function filterBlogCategory(category, el) {
    state.blogCategory = category;
    if (el) {
        document.querySelectorAll('#view-blog .filter-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
    }
    renderBlog();
}

function openBlogModal(blogId) {
    const article = BLOG_ARTICLES_DATA.find(b => b.id === blogId);
    if (!article) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
        <div class="review-meta" style="margin-bottom: 12px;">
            <span><i class="fa-solid fa-user"></i> ${article.author}</span>
            <span><i class="fa-solid fa-calendar"></i> ${article.date}</span>
            <span><i class="fa-solid fa-folder"></i> ${article.category}</span>
            <span><i class="fa-solid fa-eye"></i> ${article.views} 次阅读</span>
        </div>
        <h1 style="font-family: var(--font-heading); font-size: 1.75rem; margin-bottom: 16px; line-height: 1.35; color: #fff;">${article.title}</h1>
        
        <div class="coupon-highlight-bar" style="padding: 12px 18px; margin-bottom: 24px;" onclick="copyDiscountCode('HQ66')">
            <div>
                <span class="coupon-tag-badge"><i class="fa-solid fa-crown"></i> 环球梯独家 7 折</span>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">全专线 IEPL 架构，看 8K 不卡，解锁 ChatGPT & Netflix</div>
            </div>
            <span class="coupon-code-val" style="font-size: 1.2rem;">HQ66 <i class="fa-regular fa-copy"></i></span>
        </div>

        <div style="line-height: 1.85; font-size: 1.02rem;">
            ${article.content}
        </div>

        <div style="text-align: center; margin-top: 35px; padding-top: 24px; border-top: 1px solid var(--border-color); display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="https://123pps01.huanqiutiaff.com/#/?code=j5VBUvw0" target="_blank" rel="noopener noreferrer" class="btn btn-lg btn-primary spotlight-btn-glow" style="text-decoration: none;">
                <i class="fa-solid fa-rocket"></i> 访问环球梯官网首页 (7折码: HQ66)
            </a>
            <button class="btn btn-lg btn-glass" onclick="closeModal()">
                返回文章列表
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// 5. Render Protocols View
function renderProtocols() {
    const grid = document.getElementById('protocolGrid');
    if (!grid) return;

    grid.innerHTML = PROTOCOLS_DATA.map(proto => `
        <div class="protocol-card-std" id="${proto.id}">
            <div>
                <h3 class="proto-std-name">${proto.name}</h3>
                <p class="proto-std-position">${proto.positionDesc}</p>
                <div class="proto-fields-list">
                    <div class="proto-field-item">
                        <strong>传输特点：</strong>${proto.feature}
                    </div>
                    <div class="proto-field-item">
                        <strong>适合场景：</strong>${proto.scenario}
                    </div>
                    <div class="proto-field-item">
                        <strong>注意事项：</strong>${proto.notice}
                    </div>
                </div>
            </div>
            <a href="javascript:void(0)" onclick="openProtoDetailModal('${proto.id}')" class="proto-detail-link">查看详情 &rarr;</a>
        </div>
    `).join('');
}

function scrollToProtoAnchor(anchorId, btn) {
    if (btn) {
        document.querySelectorAll('.proto-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    const target = document.getElementById(anchorId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function openProtoDetailModal(protoId) {
    const proto = PROTOCOLS_DATA.find(p => p.id === protoId);
    if (!proto) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-heading); margin-bottom: 8px;">${proto.name} 技术细节</h2>
        <p style="font-size: 0.92rem; color: var(--primary-cyan); margin-bottom: 16px;">${proto.positionDesc}</p>
        <div style="line-height: 1.8; font-size: 0.95rem; color: var(--text-main); margin-bottom: 24px;">
            ${proto.details}
        </div>
        <div style="text-align: right;">
            <button class="btn btn-glass" onclick="closeModal()">关闭</button>
        </div>
    `;

    modal.classList.add('active');
}

// 6. Render Blackholes View
function renderBlackholes() {
    const grid = document.getElementById('blackholesGrid');
    if (!grid) return;

    grid.innerHTML = BLACKHOLES_DATA.map(bh => `
        <div class="blackhole-card">
            <div class="bh-header">
                <span class="bh-title">${bh.name}</span>
                <span class="bh-status">${bh.status}</span>
            </div>
            <div class="bh-meta"><i class="fa-solid fa-clock"></i> 确认时间：${bh.date}</div>
            <p class="bh-reason">${bh.reason}</p>
            <div class="bh-tips"><i class="fa-solid fa-lightbulb"></i> 防坑提醒：${bh.tips}</div>
        </div>
    `).join('');
}

/* ==========================================================================
   Card Creators
   ========================================================================== */

function createAirportCardHTML(ap) {
    const inCompare = state.compareList.includes(ap.id);
    const logoImg = ap.logo ? `<img src="${ap.logo}" alt="${ap.name} Logo" style="width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--border-color); margin-right: 12px; vertical-align: middle;">` : '';
    const affUrl = ap.affUrl && ap.affUrl !== '#' ? ap.affUrl : '#';

    const couponBarHtml = ap.discountCode ? `
        <div class="coupon-highlight-bar" onclick="copyDiscountCode('${ap.discountCode}')" title="点击复制 7 折优惠码">
            <span class="coupon-tag-badge"><i class="fa-solid fa-gift"></i> ${ap.discountPercent}</span>
            <span class="coupon-code-val">优惠码: <strong>${ap.discountCode}</strong> <i class="fa-regular fa-copy"></i></span>
        </div>
    ` : '';

    let cardClass = '';
    if (ap.id === 'ap-huanqiuti') cardClass = 'card-featured-accent';

    return `
        <div class="airport-card ${cardClass}">
            <div>
                <div class="ap-header">
                    <div style="display: flex; align-items: center;">
                        ${logoImg}
                        <div>
                            <span class="ap-name">${ap.name}</span>
                            <div class="ap-rating">
                                <span class="stars"><i class="fa-solid fa-star"></i> ${ap.rating}</span>
                                <span>速度: ${ap.speedScore}</span> | <span>稳定: ${ap.stabilityScore}%</span>
                            </div>
                        </div>
                    </div>
                    <span class="ap-badge">
                        ${ap.id === 'ap-huanqiuti' ? '置顶推荐' : ap.badge}
                    </span>
                </div>
                <p class="ap-desc">${ap.tagline}</p>
                
                ${couponBarHtml}

                <div class="ap-specs">
                    <div class="spec-item">
                        <span>线路架构</span>
                        <strong>${ap.bandwidth}</strong>
                    </div>
                    <div class="spec-item">
                        <span>节点数量</span>
                        <strong>${ap.nodesCount}</strong>
                    </div>
                    <div class="spec-item">
                        <span>协议支持</span>
                        <strong>${ap.protocols.join(', ')}</strong>
                    </div>
                    <div class="spec-item">
                        <span>流媒体/AI</span>
                        <strong>${ap.streamingUnlock}</strong>
                    </div>
                </div>
                <div class="ap-tags">
                    ${ap.features.map(f => `<span class="tag-chip">${f.toUpperCase()}</span>`).join('')}
                </div>
            </div>
            <div class="ap-footer">
                <div class="ap-price">
                    <span style="font-size: 0.72rem; color: var(--primary-cyan); border: 1px solid var(--border-color); padding: 1px 6px; border-radius: 4px; display: inline-block; margin-bottom: 2px;">
                        7折到手价
                    </span>
                    <div style="font-weight: 700; color: var(--text-main);">
                        ￥${ap.priceMin} <span style="font-size: 0.78rem; color: var(--text-dim); text-decoration: line-through;">￥${ap.priceOriginal}</span>
                    </div>
                </div>
                <div class="ap-actions">
                    <a href="${affUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="text-decoration: none;">
                        官网直达
                    </a>
                    <button class="btn btn-sm btn-glass" onclick="openAirportDetail('${ap.id}')">方案</button>
                    <button class="btn btn-sm ${inCompare ? 'btn-secondary' : 'btn-glass'}" onclick="toggleCompare('${ap.id}')">
                        ${inCompare ? '已对比' : '+对比'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createReviewCardHTML(rev, isFull = false) {
    return `
        <div class="review-card" onclick="openReviewModal('${rev.id}')">
            <div class="review-meta">
                <span><i class="fa-solid fa-user"></i> ${rev.author}</span>
                <span><i class="fa-solid fa-calendar"></i> ${rev.date}</span>
                <span><i class="fa-solid fa-eye"></i> ${rev.views} 阅读</span>
            </div>
            <h3 class="review-title">${rev.title}</h3>
            <p class="review-summary">${rev.summary}</p>
            <div class="ap-tags">
                ${rev.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}
            </div>
            <div style="margin-top: 14px; color: var(--primary-cyan); font-size: 0.85rem; font-weight: 700;">
                查看测速笔记 <i class="fa-solid fa-arrow-right"></i>
            </div>
        </div>
    `;
}

/* ==========================================================================
   Interactive Airport Comparison Tool
   ========================================================================== */

function toggleCompare(airportId) {
    const idx = state.compareList.indexOf(airportId);
    if (idx > -1) {
        state.compareList.splice(idx, 1);
        showToast("已从对比列表中移除");
    } else {
        if (state.compareList.length >= 4) {
            showToast("最多同时对比 4 个机场");
            return;
        }
        state.compareList.push(airportId);
        showToast("已加入对比列表");
    }

    updateCompareBadge();
    renderDirectory();
    renderRecommend();
    renderHome();
    renderCompareTable();
}

function clearCompareSelection() {
    state.compareList = [];
    updateCompareBadge();
    renderDirectory();
    renderRecommend();
    renderHome();
    renderCompareTable();
    showToast("已清空对比选择");
}

function updateCompareBadge() {
    const badge = document.getElementById('compareBadge');
    const countSpan = document.getElementById('compareSelectedCount');
    if (badge) badge.innerText = state.compareList.length;
    if (countSpan) countSpan.innerText = state.compareList.length;

    const chipsContainer = document.getElementById('selectedCompareChips');
    if (chipsContainer) {
        chipsContainer.innerHTML = state.compareList.map(id => {
            const ap = AIRPORTS_DATA.find(a => a.id === id);
            return ap ? `<span class="selected-chip">${ap.name} <i class="fa-solid fa-xmark" onclick="toggleCompare('${ap.id}')"></i></span>` : '';
        }).join('');
    }
}

function renderCompareTable() {
    const container = document.getElementById('compareContainer');
    if (!container) return;

    let html = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>机场名称</th>
                    <th>推荐排名</th>
                    <th>线路架构</th>
                    <th>独家 7 折优惠码</th>
                    <th>折后到手价 (7折后)</th>
                    <th>折算日均单价</th>
                    <th>流媒体 / AI解锁</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${AIRPORTS_DATA.map(ap => {
                    const isMain = ap.id === 'ap-huanqiuti';
                    const dailyCost = (parseFloat(ap.priceMin) / 30).toFixed(2);
                    const affUrl = ap.affUrl && ap.affUrl !== '#' ? ap.affUrl : '#';
                    return `
                        <tr class="${isMain ? 'row-highlight-cyan' : ''}">
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    ${ap.logo ? `<img src="${ap.logo}" alt="${ap.name}" style="width: 32px; height: 32px; border-radius: 8px;">` : ''}
                                    <strong style="color: var(--text-main); font-size: 1.02rem;">${ap.name}</strong>
                                </div>
                            </td>
                            <td>
                                <span class="ap-badge">
                                    ${isMain ? '置顶主推' : ap.badge}
                                </span>
                            </td>
                            <td><span class="tag-chip cyan" style="font-size:0.75rem;">${ap.bandwidth}</span></td>
                            <td>
                                <div class="coupon-highlight-bar" style="margin:0; padding:4px 8px;" onclick="copyDiscountCode('${ap.discountCode}')" title="点击复制 7 折优惠码">
                                    <span class="coupon-tag-badge" style="font-size:0.72rem;">${ap.discountPercent}</span>
                                    <span class="coupon-code-val" style="font-size: 0.88rem;">${ap.discountCode} <i class="fa-regular fa-copy"></i></span>
                                </div>
                            </td>
                            <td>
                                <strong style="color: var(--primary-cyan); font-size: 1.1rem;">￥${ap.priceMin}</strong>
                                <span style="font-size: 0.75rem; color: var(--text-dim); text-decoration: line-through; margin-left: 2px;">￥${ap.priceOriginal}</span>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${ap.priceUnit}</div>
                            </td>
                            <td>
                                <span style="color: var(--primary-cyan); font-weight: 600; font-size:0.88rem;">约 ￥${dailyCost} 元/天</span>
                            </td>
                            <td><span style="font-size: 0.8rem; color: var(--text-muted);">${ap.streamingUnlock}</span></td>
                            <td>
                                <div style="display: flex; gap: 6px;">
                                    <a href="${affUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="text-decoration: none;">
                                        直达官网
                                    </a>
                                    <button class="btn btn-sm btn-glass" onclick="openPlansModal('${ap.id}')">
                                        套餐资费
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

/* ==========================================================================
   Modals & Details (Pure Text Plans Layout)
   ========================================================================== */

function openReviewModal(reviewId) {
    const rev = REVIEWS_DATA.find(r => r.id === reviewId);
    if (!rev) return;

    const ap = AIRPORTS_DATA.find(a => a.id === rev.airportId);
    const affUrl = ap && ap.affUrl ? ap.affUrl : '#';

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
        <div class="review-meta" style="margin-bottom: 12px;">
            <span><i class="fa-solid fa-user"></i> ${rev.author}</span>
            <span><i class="fa-solid fa-calendar"></i> ${rev.date}</span>
        </div>
        <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 16px; line-height: 1.3;">${rev.title}</h2>
        
        <div class="coupon-highlight-bar" style="padding: 12px 18px; margin-bottom: 24px;" onclick="copyDiscountCode('${ap ? ap.discountCode : 'HQ66'}')">
            <div>
                <span class="coupon-tag-badge"><i class="fa-solid fa-fire"></i> 7 折优惠码</span>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">结账输入此优惠码享 7 折</div>
            </div>
            <span class="coupon-code-val" style="font-size: 1.2rem;">${ap ? ap.discountCode : 'HQ66'} <i class="fa-regular fa-copy"></i></span>
        </div>

        <div style="line-height: 1.8; font-size: 0.98rem;">
            ${rev.content}
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color);">
            <a href="${affUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-lg btn-primary" style="text-decoration: none;">
                直达官网 (7折码: ${ap ? ap.discountCode : 'HQ66'})
            </a>
        </div>
    `;

    modal.classList.add('active');
}

function openAirportDetail(airportId) {
    const ap = AIRPORTS_DATA.find(a => a.id === airportId);
    if (!ap) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    const affUrl = ap.affUrl && ap.affUrl !== '#' ? ap.affUrl : '#';

    let plansHtml = '';
    if (ap.plans && ap.plans.length > 0) {
        plansHtml = `
            <h3 style="font-family: var(--font-heading); font-size: 1.3rem; margin: 24px 0 16px; color: var(--primary-cyan); display: flex; align-items: center; justify-content: space-between;">
                <span><i class="fa-solid fa-list"></i> 订阅方案一览</span>
                <span style="font-size: 0.85rem; color: var(--text-dim); font-weight: normal;">* 结账输入优惠码 <strong>${ap.discountCode}</strong> 享7折</span>
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
                ${ap.plans.map(p => `
                    <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #fff; font-size: 1.05rem;">${p.name}</strong>
                                <span class="ap-badge" style="font-size: 0.72rem;">${p.badge || '套餐'}</span>
                            </div>
                            
                            <div style="margin: 8px 0;">
                                <div style="font-size: 0.75rem; color: var(--text-dim);">
                                    7折到手价：
                                </div>
                                <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--primary-cyan); line-height: 1.1;">
                                    ${p.priceDiscount} 
                                    <span style="font-size: 0.8rem; color: var(--text-dim); text-decoration: line-through; font-weight: normal;">原价${p.priceOriginal}</span>
                                </div>
                            </div>

                            <div style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 4px;">
                                <i class="fa-solid fa-database text-accent"></i> ${p.traffic}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 8px;">
                                <i class="fa-solid fa-laptop text-accent"></i> ${p.devices}
                            </div>
                            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px;">
                                ${p.feature}
                            </p>
                        </div>
                        <a href="${affUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="width: 100%; text-decoration: none;">
                            7折价 ${p.priceDiscount} 订阅
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const logoHeader = ap.logo ? `<img src="${ap.logo}" alt="${ap.name}" style="width: 54px; height: 54px; border-radius: 12px; border: 1px solid var(--border-color); vertical-align: middle; margin-right: 14px;">` : '';

    content.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center;">
                ${logoHeader}
                <div>
                    <h2 style="font-family: var(--font-heading); font-size: 1.8rem;">${ap.name}</h2>
                    <span class="ap-badge">${ap.badge}</span>
                </div>
            </div>
            <a href="${affUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="text-decoration: none;">
                官网直达
            </a>
        </div>
        <p style="font-size: 1.05rem; color: var(--primary-cyan); margin-bottom: 12px;">${ap.tagline}</p>

        <!-- Prominent Coupon Banner -->
        <div class="coupon-highlight-bar" style="padding: 12px 18px; margin-bottom: 20px;" onclick="copyDiscountCode('${ap.discountCode}')">
            <div>
                <span class="coupon-tag-badge" style="font-size: 0.82rem;"><i class="fa-solid fa-tags"></i> 7 折优惠码</span>
                <div style="font-size: 0.84rem; color: var(--text-muted); margin-top: 4px;">结账输入优惠码打 7 折（点击可复制）</div>
            </div>
            <span class="coupon-code-val" style="font-size: 1.2rem;">${ap.discountCode} <i class="fa-regular fa-copy"></i></span>
        </div>

        <p style="line-height: 1.6; color: var(--text-muted); margin-bottom: 20px; font-size: 0.95rem;">${ap.desc}</p>
        
        ${plansHtml}

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <a href="${affUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="text-decoration: none;">
                访问官网
            </a>
            <button class="btn btn-glass" onclick="closeModal()">关闭</button>
        </div>
    `;

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
}

// Global Filter Handler
function setFilter(category, val, btn) {
    state.filters[category] = val;

    btn.parentElement.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    renderRecommend();
}

// Filter category by Quick Card click
function filterCategory(catType) {
    switchTab('recommend');
    if (catType === 'iepl') {
        state.filters.type = 'iepl';
    } else if (catType === 'streaming') {
        state.filters.feature = 'streaming';
    } else if (catType === 'budget') {
        state.filters.type = 'budget';
    } else if (catType === 'backup') {
        state.filters.feature = 'paybydata';
    }
    renderRecommend();
}

// Global Search Input
function handleSearch(query) {
    state.searchQuery = query.trim();
    if (state.currentTab !== 'recommend' && state.searchQuery) {
        switchTab('recommend');
    }
    renderRecommend();
}
