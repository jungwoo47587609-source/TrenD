import { useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Bell, Bookmark, Camera, Check, ChevronRight,
  Clock3, ExternalLink, Flame, History, Menu, Play, Search,
  Share2, Sparkles, TrendingUp, Video, X, Zap
} from 'lucide-react';

const baseTrends = [
  ['APT. Dance Challenge','ROSÉ & Bruno Mars','TikTok','28.4M','댄스'],
  ['오늘부터 1일차, 러닝 브이로그','오운완클럽','YouTube','15.7M','라이프'],
  ['두바이 초콜릿 5분 레시피','먹잘알 민지','Instagram','12.9M','푸드'],
  ['이 노래 모르면 간첩','wave.archive','TikTok','11.2M','음악'],
  ['퇴근 후 한강 피크닉 코스','서울로그','Instagram','9.8M','여행'],
  ['아이폰으로 영화처럼 찍는 법','필름메이커 준','YouTube','8.5M','테크'],
  ['고양이가 집사를 깨우는 방법','냥냥펀치','TikTok','7.9M','동물'],
  ['2026 봄 데일리룩 모음','OOTD.zip','Instagram','7.1M','패션'],
  ['요즘 대학생 가방 속 필수템','스무살의 하루','YouTube','6.8M','라이프'],
  ['30초 만에 끝내는 퍼스널컬러','컬러풀데이','TikTok','6.4M','뷰티'],
  ['새벽 감성 플레이리스트','mood on','YouTube','5.9M','음악'],
  ['성수동 신상 팝업 솔직 후기','핫플레이스','Instagram','5.5M','여행'],
  ['친구랑 꼭 해봐야 할 밸런스게임','밈연구소','TikTok','5.2M','유머'],
  ['자취생 냉장고 털이 레시피','한끼뚝딱','YouTube','4.9M','푸드'],
  ['꾸안꾸 메이크업의 정석','뷰티풀','Instagram','4.7M','뷰티'],
  ['알고리즘이 선택한 신인 아티스트','soundpick','TikTok','4.5M','음악'],
  ['제주 숨은 오션뷰 카페','떠나영','Instagram','4.3M','여행'],
  ['AI로 과제 효율 200% 올리기','테크메이트','YouTube','4.1M','테크'],
  ['직장인 공감 100% 상황극','오늘도출근','TikTok','3.9M','유머'],
  ['5분 복근 홈트 루틴','핏온','YouTube','3.8M','운동'],
];

const oldTrends = [
  ['마라탕후루 챌린지','탕후루언니','TikTok','42.1M','챌린지'],
  ['밤양갱 커버 모음.zip','뮤직캐비닛','YouTube','31.8M','음악'],
  ['푸바오 마지막 출근길','바오패밀리','Instagram','27.6M','동물'],
  ['첫 만남은 계획대로 되지 않아','댄스온','TikTok','24.5M','댄스'],
  ['서울의 봄 관객 리액션','무비로그','YouTube','19.2M','영화'],
  ['요아정 꿀조합 TOP 5','디저트픽','Instagram','17.8M','푸드'],
  ['선재 업고 튀어 명장면','드라마덕후','TikTok','16.4M','드라마'],
  ['한강 라면 제대로 끓이는 법','서울한입','YouTube','14.9M','푸드'],
];

const palettes = [
  ['#bfdbfe','#2563eb'], ['#fecdd3','#f43f5e'], ['#fde68a','#f97316'],
  ['#ddd6fe','#7c3aed'], ['#a7f3d0','#059669'], ['#fbcfe8','#db2777'],
  ['#cffafe','#0891b2'], ['#fed7aa','#ea580c'], ['#d9f99d','#65a30d'], ['#e9d5ff','#9333ea']
];
const emojis = ['🎧','🏃','🍫','🕺','🌇','📱','🐈','👟','🎒','💄','🌙','☕','😂','🍳','✨','🎤','🌊','🤖','💼','💪'];

function platformUrl(platform, title) {
  const q = encodeURIComponent(title);
  if (platform === 'YouTube') return `https://www.youtube.com/results?search_query=${q}`;
  if (platform === 'TikTok') return `https://www.tiktok.com/search?q=${q}`;
  return `https://www.instagram.com/explore/search/keyword/?q=${q}`;
}

function makeData(source, count = 100) {
  return Array.from({length: count}, (_, i) => {
    const src = source[i % source.length];
    const cycle = Math.floor(i / source.length);
    return {
      rank: i + 1,
      title: cycle ? `${src[0]} #${cycle + 1}` : src[0],
      creator: src[1], platform: src[2], views: src[3], category: src[4],
      change: i === 0 ? 0 : ((i * 7) % 15) - 6,
      isNew: i % 13 === 4,
      emoji: emojis[i % emojis.length],
      palette: palettes[i % palettes.length]
    };
  });
}

const currentData = makeData(baseTrends);
const historyData = makeData(oldTrends, 24);

function PlatformIcon({platform, size=18}) {
  if (platform === 'YouTube') return <Video size={size}/>;
  if (platform === 'Instagram') return <Camera size={size}/>;
  return <span className="tiktok-icon">♪</span>;
}

function Thumb({item, large=false}) {
  return <div className={`thumb ${large ? 'thumb-large' : ''}`} style={{background:`linear-gradient(145deg, ${item.palette[0]}, ${item.palette[1]})`}}>
    <span>{item.emoji}</span><div className="play"><Play size={large ? 18 : 13} fill="currentColor"/></div>
  </div>;
}

function PlatformBadge({platform}) {
  return <span className={`platform platform-${platform.toLowerCase()}`}><PlatformIcon platform={platform} size={14}/>{platform}</span>
}

function RankMove({item}) {
  if (item.isNew) return <span className="rank-new">NEW</span>;
  if (item.change > 0) return <span className="rank-up"><ArrowUpRight size={14}/>{item.change}</span>;
  if (item.change < 0) return <span className="rank-down"><ArrowDownRight size={14}/>{Math.abs(item.change)}</span>;
  return <span className="rank-same">―</span>;
}

function App() {
  const [page, setPage] = useState('now');
  const [platform, setPlatform] = useState('ALL');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(20);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  const data = page === 'now' ? currentData : historyData;
  const filtered = useMemo(() => data.filter(item =>
    (platform === 'ALL' || item.platform === platform) &&
    (`${item.title} ${item.creator} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
  ), [data, platform, query]);
  const display = filtered.slice(0, visible);

  const switchPage = (next) => { setPage(next); setVisible(20); setPlatform('ALL'); window.scrollTo({top:0, behavior:'smooth'}); };
  const toggleSaved = (rank) => setSaved(v => v.includes(rank) ? v.filter(x=>x!==rank) : [...v, rank]);

  return <div className="app">
    <div className="noise" />
    <header>
      <a className="logo" href="#top" aria-label="TrenD 홈">Tren<span>D</span><i>.</i></a>
      <nav className={mobileMenu ? 'open' : ''}>
        <button className={page==='now'?'active':''} onClick={()=>{switchPage('now');setMobileMenu(false)}}>지금 뜨는</button>
        <button className={page==='history'?'active':''} onClick={()=>{switchPage('history');setMobileMenu(false)}}>1년 전 오늘</button>
        <a href="#chart" onClick={()=>setMobileMenu(false)}>TOP 100</a>
      </nav>
      <div className="header-actions">
        <button className="icon-btn" aria-label="알림"><Bell size={19}/><b/></button>
        <button className="menu-btn" onClick={()=>setMobileMenu(!mobileMenu)}>{mobileMenu?<X/>:<Menu/>}</button>
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span><Zap size={13} fill="currentColor"/> LIVE</span> 10분 전 업데이트</div>
          {page === 'now' ? <>
            <h1>지금, 세상이<br/><em>좋아하는 것들.</em></h1>
            <p>유행에 누구보다 민감한 10대·20대를 위해,<br className="desktop"/> 지금 가장 뜨는 콘텐츠 100개를 한눈에 모았어요.</p>
          </> : <>
            <h1>그때 우린,<br/><em>뭘 보고 있었지?</em></h1>
            <p>정확히 1년 전 오늘, 우리의 피드를 가득 채웠던<br className="desktop"/> 추억의 트렌드를 다시 플레이해 보세요.</p>
          </>}
          <a className="hero-cta" href="#chart">차트 둘러보기 <ChevronRight size={18}/></a>
        </div>
        <div className="hero-visual">
          <div className="orb" />
          {(page === 'now' ? currentData : historyData).slice(0,3).map((item, i)=><a key={item.title} className={`float-card card-${i+1}`} href={platformUrl(item.platform,item.title)} target="_blank" rel="noreferrer">
            <Thumb item={item} large/>
            <div><small>0{i+1}</small><strong>{item.title}</strong><span><PlatformIcon platform={item.platform} size={13}/>{item.views} views</span></div>
          </a>)}
          <div className="spark spark-1">✦</div><div className="spark spark-2">✦</div>
        </div>
      </section>

      <section className="ticker"><div>{['YOUTUBE','TIKTOK','INSTAGRAM','WHAT’S HOT NOW','TOP 100'].map((x,i)=><span key={i}>{x}<i>✦</i></span>)}</div></section>

      {page === 'history' && <section className="memory-section">
        <div className="section-label"><History size={15}/> ONE YEAR AGO</div>
        <div className="memory-head"><div><h2>2025. 09. 13</h2><p>그날의 피드, 기억나?</p></div><span className="nostalgia">NOSTALGIA MODE <Sparkles size={14}/></span></div>
        <div className="memory-grid">{historyData.slice(0,8).map((item,i)=><article key={i} className="memory-card" onClick={()=>setSelected(item)}>
          <Thumb item={item} large/><div className="memory-rank">#{String(i+1).padStart(2,'0')}</div>
          <PlatformBadge platform={item.platform}/><h3>{item.title}</h3><p>@{item.creator}</p>
        </article>)}</div>
      </section>}

      <section className="chart-section" id="chart">
        <div className="chart-head">
          <div><div className="section-label"><Flame size={15} fill="currentColor"/>{page==='now'?'REAL-TIME CHART':'THROWBACK CHART'}</div><h2>{page==='now'?'지금 뜨는 TOP 100':'1년 전 오늘의 TOP 100'}</h2></div>
          <div className="chart-date"><Clock3 size={16}/><span>{page==='now'?'2026. 09. 13  ·  15:50 기준':'2025. 09. 13 아카이브'}</span></div>
        </div>

        <div className="toolbar">
          <div className="filters">{['ALL','YouTube','TikTok','Instagram'].map(p=><button key={p} className={platform===p?'active':''} onClick={()=>{setPlatform(p);setVisible(20)}}>{p!=='ALL'&&<PlatformIcon platform={p}/>} {p}</button>)}</div>
          <label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="콘텐츠, 크리에이터 검색"/><kbd>⌘ K</kbd></label>
        </div>

        <div className="chart-table">
          <div className="table-header"><span>RANK</span><span>CONTENT</span><span>PLATFORM</span><span>VIEWS</span><span>CHANGE</span><span/></div>
          {display.map(item=><article className={`chart-row ${item.rank<=3?'top-row':''}`} key={item.rank} onClick={()=>setSelected(item)}>
            <div className="rank"><strong>{String(item.rank).padStart(2,'0')}</strong></div>
            <div className="content-cell"><Thumb item={item}/><div><h3>{item.title}</h3><p>@{item.creator} <i>·</i> {item.category}</p></div></div>
            <PlatformBadge platform={item.platform}/>
            <strong className="views">{item.views}</strong>
            <RankMove item={item}/>
            <a className="go-btn" href={platformUrl(item.platform,item.title)} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} aria-label={`${item.platform}에서 보기`}><ExternalLink size={17}/></a>
          </article>)}
          {!display.length && <div className="empty"><Search size={36}/><h3>검색 결과가 없어요</h3><p>다른 키워드로 다시 찾아보세요.</p></div>}
        </div>
        {visible < filtered.length && <button className="more-btn" onClick={()=>setVisible(v=>v+20)}>더 많은 순위 보기 <span>{visible} / {filtered.length}</span><ChevronRight size={18}/></button>}
      </section>

      <section className="newsletter"><div className="newsletter-icon"><TrendingUp/></div><div><small>DON’T MISS THE TREND</small><h2>오늘의 트렌드, 놓치지 마세요.</h2><p>매일 저녁 가장 뜨거웠던 콘텐츠만 모아 보내드릴게요.</p></div><form onSubmit={e=>e.preventDefault()}><input type="email" placeholder="이메일 주소를 입력하세요"/><button>구독하기 <ChevronRight size={17}/></button></form></section>
    </main>

    <footer><a className="logo" href="#top">Tren<span>D</span><i>.</i></a><p>10대·20대의 트렌드를 가장 빠르게.</p><div><a href="#chart">차트</a><button onClick={()=>switchPage('history')}>1년 전 오늘</button><a href="mailto:hello@trend.kr">문의</a></div><small>© 2026 TrenD. ALL RIGHTS RESERVED.</small></footer>

    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={()=>setSelected(null)}><X/></button>
      <Thumb item={selected} large/>
      <div className="modal-body"><div className="modal-top"><PlatformBadge platform={selected.platform}/><span>#{String(selected.rank).padStart(2,'0')}</span></div><h2>{selected.title}</h2><p>@{selected.creator} · {selected.category}</p><div className="modal-stats"><div><small>VIEWS</small><strong>{selected.views}</strong></div><div><small>RANK</small><strong>#{selected.rank}</strong></div><div><small>STATUS</small><strong className="hot"><Flame size={16}/> HOT</strong></div></div><div className="modal-actions"><a href={platformUrl(selected.platform,selected.title)} target="_blank" rel="noreferrer"><Play size={17} fill="currentColor"/>{selected.platform}에서 보기</a><button className={saved.includes(selected.rank)?'saved':''} onClick={()=>toggleSaved(selected.rank)}>{saved.includes(selected.rank)?<Check/>:<Bookmark/>}</button><button onClick={()=>navigator.clipboard?.writeText(platformUrl(selected.platform,selected.title))}><Share2/></button></div></div>
    </div></div>}
  </div>;
}

export default App;
