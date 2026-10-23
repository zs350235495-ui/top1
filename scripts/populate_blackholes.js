const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Blackholes data definition
const blackholes = [
    {
        id: "bh-01",
        name: "速鹰 666 (SuYing666)",
        status: "官网关闭 / 长期失联",
        date: "2024 - 2025",
        severity: "高危跑路",
        lossEstimate: "涉及大量年付用户，工单无回复",
        reason: "曾是运营多年的老牌廉价中转机场，后出现大面积节点超时、官网打不开与管理员注销退群，已被社区列为已跑路黑名单。",
        tips: "切勿对异常机场抱有侥幸心理，一旦出现大面积超时且TG群禁言，请立即止损切换备用。"
    },
    {
        id: "bh-02",
        name: "喵帕斯 (MiaoPass)",
        status: "不可抗力停运关闭",
        date: "2020",
        severity: "已停运",
        lossEstimate: "邀请制高端老用户受影响",
        reason: "曾经口碑极佳的邀请制高端机场，因受外部监管调查与压力被迫关停退场，属于行业早期典型的不可抗力关闭案例。",
        tips: "即便是口碑再好的老牌/邀请制机场，也无法保证 100% 永久运营，坚持按月或按季付费。"
    },
    {
        id: "bh-03",
        name: "极客云 (GeekCloud 跑路分支)",
        status: "大促后拔线跑路",
        date: "2024-11",
        severity: "高危跑路",
        lossEstimate: "双十一充值被割，用户被拉黑",
        reason: "双十一大促以“买一年送一年/充值返现翻倍”吸金后突然关闭节点拔线，TG官方交流群开启全员禁言并注销管理员账号。",
        tips: "凡是大促期间搞“买一年送一年/充值翻倍”的低价机场，大促结束后往往是跑路高发期。"
    },
    {
        id: "bh-04",
        name: "速云网络 (SuYun Net)",
        status: "域名失联 / 停止维护",
        date: "2025-02",
        severity: "高危失联",
        lossEstimate: "官网DNS污染，全节点超时红字",
        reason: "域名被污染后无力维护，站长失联退群，服务器到期后节点陆续挂掉无人处理，沦为弃站。",
        tips: "如果机场长时间不上线备用域名且客服不处理工单，说明团队已放弃运营。"
    },
    {
        id: "bh-05",
        name: "云翼加速 (YunYi VIP)",
        status: "套路改名 / 二次收割",
        date: "2024-08",
        severity: "恶意套路",
        lossEstimate: "老用户年付套餐直接清零",
        reason: "站长将数据库出售给新团队，新团队不承认老用户的年付套餐，要求重新付费购买新套餐才给迁移。",
        tips: "遇到要求老用户“强制二次付费”才给迁站的套路机场，请直接放弃止损。"
    },
    {
        id: "bh-06",
        name: "微云加速 (WeiYun Speed)",
        status: "卷款潜逃",
        date: "2025-04",
        severity: "高危跑路",
        lossEstimate: "充值用户群集体被拉黑踢出",
        reason: "以“5元/月无限量不限速”低价大肆宣传拉人，运营不到三个月即关站卷款潜逃。",
        tips: "远离廉价无限流量套餐，专线与带宽都是有真实物理成本的。"
    },
    {
        id: "bh-07",
        name: "星河互联 (StarNet)",
        status: "频繁更换域名 / 跑路预警",
        date: "2025-09",
        severity: "高危预警",
        lossEstimate: "上游机房欠费断线，TG禁言",
        reason: "未发生大规模网络管制的情况下一个月内连续更换 5 次主站域名，TG 群开启禁言，上游机房追讨带宽欠费导致大面积断网。",
        tips: "一旦遇到 TG 频道全员禁言且断流超 48 小时，应立即做好迁移准备。"
    },
    {
        id: "bh-08",
        name: "云霄网络 (YunXiao Net)",
        status: "节点超时 / 无人维护",
        date: "2025-05",
        severity: "僵尸假活",
        lossEstimate: "全节点瘫痪，工单无人处理",
        reason: "入口服务器多次遭遇攻击封锁后无力修复，大部分节点长期处于超时红字状态，实际上已处于弃站假活状态。",
        tips: "准备一个异构线路的不限时按量包，主机场出现瘫痪时能应急联网。"
    }
];

function generateCardsHtml() {
    return blackholes.map(bh => `
                <div class="blackhole-card">
                    <div class="bh-header">
                        <span class="bh-title"><i class="fa-solid fa-triangle-exclamation text-danger" style="margin-right: 6px;"></i>${bh.name}</span>
                        <span class="bh-status">${bh.status}</span>
                    </div>
                    <div class="bh-meta">
                        <span><i class="fa-regular fa-calendar-xmark"></i> 确认时间：${bh.date}</span>
                        <span style="margin-left: 8px; color: #DC2626; font-weight: 600;"><i class="fa-solid fa-radiation"></i> ${bh.severity}</span>
                    </div>
                    <p class="bh-reason"><strong>跑路原因分析：</strong>${bh.reason}</p>
                    <div class="bh-tips"><i class="fa-solid fa-lightbulb"></i> <strong>避坑提醒：</strong>${bh.tips}</div>
                </div>`).join('\n');
}

function generateTableHtml() {
    const rows = blackholes.map(bh => `
                        <tr>
                            <td><strong style="color: var(--text-main); font-size: 0.95rem;">${bh.name}</strong></td>
                            <td><span class="bh-status">${bh.status}</span></td>
                            <td style="font-size: 0.85rem; color: var(--text-muted);">${bh.date}</td>
                            <td><span style="color: #DC2626; font-weight: 700; font-size: 0.85rem;">${bh.severity}</span></td>
                            <td style="font-size: 0.88rem; color: var(--text-muted);">${bh.lossEstimate}</td>
                        </tr>`).join('\n');

    return `
            <!-- 黑名单速查表格 -->
            <div class="directory-table-wrapper" style="margin-top: 24px; margin-bottom: 32px; background: #FFFFFF; border-radius: 8px; border: 1px solid var(--border-color); overflow-x: auto;">
                <table class="directory-table" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #F8FAFC; border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px 16px;">异常服务商名称</th>
                            <th style="padding: 12px 16px;">当前核实状态</th>
                            <th style="padding: 12px 16px;">确认时间</th>
                            <th style="padding: 12px 16px;">风险定级</th>
                            <th style="padding: 12px 16px;">典型受害特征与征兆</th>
                        </tr>
                    </thead>
                    <tbody>
${rows}
                    </tbody>
                </table>
            </div>`;
}

// 2. Update blackholes.html
const bhFile = path.join(rootDir, 'blackholes.html');
let bhContent = fs.readFileSync(bhFile, 'utf8');

const cardsHtml = generateCardsHtml();
const tableHtml = generateTableHtml();

const newSection = `
        <!-- 跑路黑名单数据全景档案表与卡片集 -->
        <section style="margin-bottom: 40px;">
            <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 2px solid #FEE2E2; padding-bottom: 12px;">
                <h2 style="font-size: 1.45rem; font-weight: 800; color: #DC2626; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-list-check"></i> 2026 跑路机场与异常失联黑名单公示档案
                </h2>
                <span style="font-size: 0.85rem; color: var(--text-muted); background: #FEF2F2; border: 1px solid #FECACA; padding: 4px 10px; border-radius: 20px;">
                    已核实收录 <strong>8</strong> 家
                </span>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">
                由机场 TOP1 实验室依据节点探针连通率、官方 TG 频道禁言状态与社区工单实测汇总，持续追踪已跑路或处于停运失联状态的典型机场服务商：
            </p>

${tableHtml}

            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-heading); margin: 28px 0 16px;">
                <i class="fa-solid fa-shield-virus text-danger"></i> 详细失联案例与跑路特征复盘
            </h3>

            <div class="blackholes-grid" id="blackholesGrid">
${cardsHtml}
            </div>
        </section>
`;

// Insert the new section right before <!-- 自救建议 -->
if (!bhContent.includes('2026 跑路机场与异常失联黑名单公示档案')) {
    bhContent = bhContent.replace('<!-- 自救建议 -->', `${newSection}\n        <!-- 自救建议 -->`);
    fs.writeFileSync(bhFile, bhContent, 'utf8');
    console.log('[成功更新 blackholes.html] 已注入 8 家黑名单列表与速查表格');
} else {
    console.log('[跳过 blackholes.html] 内容已存在');
}

// 3. Update index.html view-blackholes
const indexFile = path.join(rootDir, 'index.html');
let indexContent = fs.readFileSync(indexFile, 'utf8');

const indexGridRegex = /<div class="blackholes-grid" id="blackholesGrid">\s*<!-- Dynamic rendering -->\s*<\/div>/;
if (indexGridRegex.test(indexContent)) {
    const replacement = `<div class="blackholes-grid" id="blackholesGrid">\n${cardsHtml}\n            </div>`;
    indexContent = indexContent.replace(indexGridRegex, replacement);
    fs.writeFileSync(indexFile, indexContent, 'utf8');
    console.log('[成功更新 index.html] 已在 view-blackholes 中注入静态预渲染黑名单卡片');
} else {
    console.log('[index.html] 未匹配到占位符或已填充');
}
