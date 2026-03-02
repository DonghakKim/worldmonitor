export interface VariantMeta {
  title: string;
  description: string;
  keywords: string;
  url: string;
  siteName: string;
  shortName: string;
  subject: string;
  classification: string;
  categories: string[];
  features: string[];
}

export const VARIANT_META: { full: VariantMeta; [k: string]: VariantMeta } = {
  full: {
    title: 'KVD Monitor - 글로벌 공급망 인텔리전스 대시보드',
    description: '실시간 글로벌 시장 동향, 에너지 가격, 환율, 무역 정책, 해상 운임 등 공급망에 영향을 미치는 핵심 데이터를 한눈에 확인하세요.',
    keywords: '글로벌 인텔리전스, 공급망 모니터링, B2B, 무역 정책, 환율, 에너지 가격, 해상 운임, 한국벤더데이터',
    url: 'https://worldmonitor-kvd.vercel.app/',
    siteName: 'KVD Monitor',
    shortName: 'KVDMonitor',
    subject: '글로벌 공급망 인텔리전스 및 시장 모니터링',
    classification: '공급망 대시보드, 시장 모니터링, B2B 인텔리전스',
    categories: ['news', 'productivity'],
    features: [
      'Real-time news aggregation',
      'Stock market tracking',
      'Military flight monitoring',
      'Ship AIS tracking',
      'Earthquake alerts',
      'Protest tracking',
      'Power outage monitoring',
      'Oil price analytics',
      'Government spending data',
      'Prediction markets',
      'Infrastructure monitoring',
      'Geopolitical intelligence',
    ],
  },
  tech: {
    title: 'KVD 기술 모니터 - AI/기술 산업 대시보드',
    description: 'AI, 빅테크, 스타트업 생태계, 펀딩 라운드, 기술 이벤트를 실시간으로 추적하는 기술 산업 대시보드.',
    keywords: '기술 대시보드, AI 산업, 스타트업, 빅테크, 벤처캐피탈, 클라우드, 데이터센터, 한국벤더데이터',
    url: 'https://worldmonitor-kvd.vercel.app/',
    siteName: 'KVD 기술 모니터',
    shortName: 'KVDTech',
    subject: 'AI, 기술 산업, 스타트업 생태계 인텔리전스',
    classification: '기술 대시보드, AI 트래커, 스타트업 인텔리전스',
    categories: ['news', 'business'],
    features: [
      'Tech news aggregation',
      'AI lab tracking',
      'Startup ecosystem mapping',
      'Tech HQ locations',
      'Conference & event calendar',
      'Cloud infrastructure monitoring',
      'Datacenter mapping',
      'Tech layoff tracking',
      'Funding round analytics',
      'Tech stock tracking',
      'Service status monitoring',
    ],
  },
  happy: {
    title: 'KVD 굿뉴스 - 좋은 소식과 글로벌 발전',
    description: '전 세계의 긍정적인 뉴스, 발전 데이터, 희망적인 이야기를 큐레이션합니다.',
    keywords: '좋은 뉴스, 긍정 뉴스, 글로벌 발전, 과학 혁신, 환경 보호, 한국벤더데이터',
    url: 'https://worldmonitor-kvd.vercel.app/',
    siteName: 'KVD 굿뉴스',
    shortName: 'KVDHappy',
    subject: '좋은 소식, 글로벌 발전, 인류 성취',
    classification: '긍정 뉴스 대시보드, 발전 트래커',
    categories: ['news', 'lifestyle'],
    features: [
      'Curated positive news',
      'Global progress tracking',
      'Live humanity counters',
      'Science breakthrough feed',
      'Conservation tracker',
      'Renewable energy dashboard',
    ],
  },
  finance: {
    title: 'KVD 금융 모니터 - 실시간 글로벌 시장 대시보드',
    description: '글로벌 주식시장, 중앙은행, 원자재, 외환, 암호화폐, 경제 지표를 실시간으로 추적하는 금융 대시보드.',
    keywords: '금융 대시보드, 주식시장, 외환, 원자재, 중앙은행, 경제지표, 한국벤더데이터',
    url: 'https://worldmonitor-kvd.vercel.app/',
    siteName: 'KVD 금융 모니터',
    shortName: 'KVDFinance',
    subject: '글로벌 시장, 트레이딩, 금융 인텔리전스',
    classification: '금융 대시보드, 시장 트래커, 트레이딩 인텔리전스',
    categories: ['finance', 'news'],
    features: [
      'Real-time market data',
      'Stock exchange mapping',
      'Central bank monitoring',
      'Commodity price tracking',
      'Forex & currency news',
      'Crypto & digital assets',
      'Economic indicator alerts',
      'IPO & earnings tracking',
      'Financial center mapping',
      'Sector heatmap',
      'Market radar signals',
    ],
  },
};
