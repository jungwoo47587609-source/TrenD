// TrenD - 숏폼 트렌드 차트 앱 로직
// 데이터/상태/차트/랭킹을 한 곳에서 관리
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---------- 플랫폼 정의 ----------
  const PLATFORMS = [
    { id: "tiktok", label: "TikTok", color: "#00f2ea", badge: "틱톡" },
    { id: "instagram", label: "Instagram", color: "#e1306c", badge: "인스타" },
    { id: "youtube", label: "YouTube Shorts", color: "#ff0000", badge: "숏츠" },
  ];

  // ---------- 샘플 키워드 풀 ----------
  const KEYWORDS = [
    "챌린지",
    "댄스",
    "밈",
    "코미디",
    "브이로그",
    "운동",
    "요리",
    "OOTD",
    "뷰티",
    "게임",
    "반려동물",
    "ASMR",
    "튜토리얼",
    "리액션",
    "숏폼 트렌드",
  ];

  // ---------- 트렌딩 영상 샘플 생성 ----------
  // 실제 연동 전에는 이 생성기를 쓰고, 연동 시 fetch 함수로 교체
  function makeSampleVideos() {
    const creators = [
      "@trendwatch",
      "@viralzone",
      "@shortspick",
      "@dailyviral",
      "@nextwave",
      "@clipboom",
      "@hotclipss",
      "@reelsradar",
      "@shortsbuzz",
      "@cliptrend",
    ];

    const styles = [
      "🔥 급상승 챌린지",
      "😂 폭풍 웃음 모음",
      "⚡ 3초 만에 끝나는",
      "🎯 정확도 미친",
      "✨ 비주얼 대박",
      "🤯 예측불가 전개",
      "💃 유행 템포",
      "🎵 중독성 사운드",
      "📸 시선 강탈",
      "🫣 편집 센스",
    ];

    const videos = [];
    for (let i = 0; i < 120; i++) {
      const platform = PLATFORMS[i % PLATFORMS.length];
      const kw =
        KEYWORDS[(Math.floor(i / 7) + i) % KEYWORDS.length];
      const viewsBase = 1200000 + ((i * 3711) % 980000);
      const viewsNow = viewsBase + Math.floor(Math.random() * 400000) - 200000;
      const score =
        Math.round(
          (viewsNow / 100000) * (0.7 + Math.random() * 0.6) +
            (Math.random() * 20)
        );
      videos.push({
        id: `v-${i}`,
        platform: platform.id,
        title: `${styles[i % styles.length]} · ${kw} 편`,
        creator: creators[i % creators.length],
        views: Math.max(10000, viewsNow),
        score: Math.max(1, score),
        trend: Math.round(0.5 + Math.random() * 4.5), // 급상승 정도
        posted: `${Math.floor(Math.random() * 23) + 1}h 전`,
      });
    }
    return videos;
  }

  // ---------- 상태 ----------
  const state = {
    videos: makeSampleVideos(),
    selectedKeywords: new Set(),
    timeSeries: [], // 차트용 시계열
    chartMode: "score", // score | views
    sortBy: "score",
  };

  // ---------- 시계열 데이터 생성 (그래프용) ----------
  function buildTimeSeries() {
    const points = [];
    const now = Date.now();
    for (let i = 10; i >= 0; i--) {
      const t = now - i * 60000;
      const row = { time: new Date(t) };
      for (const p of PLATFORMS) {
        // 플랫폼별 트렌드 점수 흐름 (더미)
        row[p.id] = Math.round(
          40 + Math.sin(i * 0.6 + PLATFORMS.indexOf(p)) * 18 +
            (Math.random() * 8)
        );
      }
      points.push(row);
    }
    state.timeSeries = points;
  }
  buildTimeSeries();

  // ---------- 랭킹 계산 ----------
  function computeRank() {
    const v = state.videos;
    let list = v.map((item) => ({ ...item }));

    if (state.selectedKeywords.size > 0) {
      list = list.filter((item) => {
        const kw = item.title.replace(/[^\w\s]/g, "").toLowerCase();
        return [...state.selectedKeywords].some(
          (k) => kw.includes(k.toLowerCase())
        );
      });
    }

    // 점수 가중: 플랫폼별 보너스 + 트렌드 가중치
    list.forEach((item) => {
      const platformBonus = { tiktok: 1.08, instagram: 1.04, youtube: 1.02 }[
        item.platform
      ] || 1;
      item.rankScore =
        item.score * (item.trend * 0.6 + 1) * platformBonus *
        (1 + Math.min(item.views / 5000000, 0.5));
    });

    list.sort((a, b) => b.rankScore - a.rankScore);
    return list.slice(0, 100).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }

  // ---------- 순위 변동 시뮬 (실시간-ish) ----------
  function jitterVideos() {
    state.videos.forEach((item) => {
      item.views += Math.floor((Math.random() - 0.48) * 8000);
      item.views = Math.max(10000, item.views);
      item.score = Math.max(1, item.score + (Math.random() - 0.5) * 6);
      item.trend = Math.max(0.2, item.trend + (Math.random() - 0.5) * 0.5);
    });
  }

  // ---------- 차트 렌더링 (SVG) ----------
  function renderChart() {
    const container = $("#chart");
    if (!container) return;

    const series = state.timeSeries;
    if (!series.length) return;

    const w = 720,
      h = 240,
      pad = { top: 20, right: 20, bottom: 36, left: 44 };
    const innerW = w - pad.left - pad.right;
    const innerH = h - pad.top - pad.bottom;

    const platforms = state.chartMode === "score"
      ? PLATFORMS
      : PLATFORMS.slice(0, 1)
          .concat(
            PLATFORMS
          );

    // Y 최대값
    let maxVal = 60;
    const values = series.flatMap((r) => platforms.map((p) => r[p.id]));
    const rawMax = Math.max(...values, maxVal);
    maxVal = Math.ceil(rawMax / 10) * 10;

    const xFor = (i) => pad.left + (i / (series.length - 1)) * innerW;
    const yFor = (v) => pad.top + innerH - ((v / maxVal) * innerH);

    let svg = `
      <svg viewBox="0 0 ${w} ${h}" class="chart-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaT" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00f2ea" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#00f2ea" stop-opacity="0.02"/>
          </linearGradient>
          <linearGradient id="areaI" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e1306c" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#e1306c" stop-opacity="0.02"/>
          </linearGradient>
          <linearGradient id="areaY" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff0000" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#ff0000" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <g class="grid">
    `;

    // Y 격자
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = (maxVal / ticks) * i;
      const y = yFor(v);
      svg += `<line x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}" stroke="#eef0f2" stroke-width="1"/>`;
      svg += `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" class="axis-text">${v}</text>`;
    }

    // X 라벨 (시간)
    const step = Math.max(1, Math.floor(series.length / 5));
    series.forEach((row, i) => {
      if (i % step === 0 || i === series.length - 1) {
        const x = xFor(i);
        svg +=
          `<text x="${x}" y="${h - 10}" text-anchor="middle" class="axis-text">${formatTime(row.time)}</text>`;
      }
    });

    svg += `</g>`;

    // 플랫폼별 라인 + 영역
    for (const p of PLATFORMS) {
      const color = p.color;
      const gradId =
        state.chartMode === "views" ? `area${p.id.slice(0,1).toUpperCase()+p.id.slice(1)}`
        : `area${p.id.slice(0,1).toUpperCase()+p.id.slice(1)}`;

      const pts = series.map((r, i) => `${xFor(i)},${yFor(r[p.id])}`).join(" ");
      const areaPts =
        `${xFor(0)},${pad.top + innerH} ${pts} ${xFor(series.length-1)},${pad.top + innerH}`;

      svg += `
        <polygon points="${areaPts}" class="area" fill="url(#${gradId})"/>
        <polyline points="${pts}" class="line" stroke="${color}" fill="none" stroke-width="2.5" stroke-linejoin="round"/>
      `;

      // 마지막 포인트
      const last = series[series.length - 1];
      svg += `
        <circle cx="${xFor(series.length-1)}" cy="${yFor(last[p.id])}" r="4.5" fill="${color}" stroke="#fff" stroke-width="2"/>
        <text x="${xFor(series.length-1) + 8}" y="${yFor(last[p.id]) + 4}" class="legend-text" fill="${color}">
          ${p.label} ${last[p.id]}
        </text>
      `;
    }

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  // ---------- 시간 포맷 ----------
  function formatTime(d) {
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }

  // ---------- 순위 리스트 렌더링 ----------
  function renderList(rank) {
    const list = $("#rank-list");
    if (!list) return;

    if (!rank.length) {
      list.innerHTML = `
        <div class="empty">
          <div class="empty-icon">📭</div>
          <div class="empty-title">해당 키워드에 맞는 영상이 없어요</div>
          <div class="empty-sub">키워드를 바꾸거나 전체 보기를 눌러보세요</div>
        </div>
      `;
      return;
    }

    list.innerHTML = rank
      .map(
        (item) => `
        <div class="rank-row platform--${item.platform}">
          <div class="rank-num">
            ${item.rank}
          </div>
          <div class="rank-main">
            <div class="rank-title">${esc(item.title)}</div>
            <div class="rank-meta">
              <span class="rank-platform platform-badge platform--${item.platform}">${platformLabel(item.platform)}</span>
              <span class="rank-creator">${esc(item.creator)}</span>
              <span class="rank-views">${formatViews(item.views)}</span>
            </div>
          </div>
          <div class="rank-score-wrap">
            <div class="rank-score">${item.rankScore.toFixed(1)}</div>
            <div class="rank-trend ${item.trend >= 2.5 ? 'up' : item.trend >= 1.5 ? 'steady' : 'down'}">
              ${item.trend >= 2.5 ? '상승' : item.trend >= 1.5 ? '유지' : '둔화'}
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  // ---------- 유틸 ----------
  function platformLabel(id) {
    return (PLATFORMS.find((p) => p.id === id) || { label: id }).label;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatViews(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  }

  // ---------- 키워드 필터 UI ----------
  function renderKeywords() {
    const wrap = $("#keyword-wrap");
    if (!wrap) return;
    wrap.innerHTML = state.selectedKeywords.size
      ? KEYWORDS
          .map((k) => {
            const active = state.selectedKeywords.has(k);
            return `
              <button class="kw-btn ${active ? 'active' : ''}"
                      data-kw="${esc(k)}">
                ${active ? '✔' : '▢'} ${esc(k)}
              </button>
            `;
          })
          .join("")
      : KEYWORDS
          .map((k) => `
            <button class="kw-btn" data-kw="${esc(k)}">
              ▢ ${esc(k)}
            </button>
          `)
          .join("");

    $$(".kw-btn", wrap).forEach((btn) => {
      btn.addEventListener("click", () => {
        const kw = btn.dataset.kw;
        if (state.selectedKeywords.has(kw)) {
          state.selectedKeywords.delete(kw);
        } else {
          state.selectedKeywords.add(kw);
        }
        refresh();
      });
    });
  }

  // ---------- 탭/모드 ----------
  function setChartMode(mode) {
    state.chartMode = mode;
    const btns = $$(".chart-mode-btn");
    btns.forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    refresh();
  }

  // ---------- 전체 갱신 ----------
  function refresh() {
    renderKeywords();
    const rank = computeRank();
    renderList(rank);
    renderChart();
  }

  // ---------- 초기 바인딩 ----------
  function init() {
    // 차트 모드 스위치
    const modeWrap = $("#chart-mode");
    if (modeWrap) {
      $$(".chart-mode-btn", modeWrap).forEach((b) => {
        b.addEventListener("click", () => setChartMode(b.dataset.mode));
      });
    }

    // 전체 보기 버튼
    const allBtn = $("#btn-all");
    if (allBtn) {
      allBtn.addEventListener("click", () => {
        state.selectedKeywords.clear();
        refresh();
      });
    }

    // 실시간-ish 갱신 (4초마다 살짝 변동 + 차트 갱신)
    setInterval(() => {
      jitterVideos();
      // 시계열도 살짝 밀어줌
      state.timeSeries.shift();
      const last = state.timeSeries[state.timeSeries.length - 1];
      const lastRow = {
        time: new Date(),
      };
      for (const p of PLATFORMS) {
        lastRow[p.id] = Math.round(
          (last ? last[p.id] : 50) + (Math.random() - 0.5) * 6
        );
      }
      state.timeSeries.push(lastRow);
      renderChart();
      renderList(computeRank());
    }, 4000);

    refresh();
    $("#live-toggle")?.addEventListener("click", () => {
      const on = $("#live-toggle").dataset.on === "1";
      $("#live-toggle").dataset.on = on ? "0" : "1";
      $("#live-toggle").classList.toggle("active", !on);
      $("#live-stream").classList.toggle("paused", on);
      $("#live-toggle").setAttribute(
        "aria-pressed",
        (!on).toString()
      );
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
