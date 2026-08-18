export const PORTFOLIO_PROJECTS = [
  {
    id: 'p1',
    title: 'NexusBoard — Team Ops Platform',
    domain: 'mern',
    intern: 'Aarav Mehta',
    year: '2025',
    stack: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    metrics: ['120+ users', '4.8s p95 load', '3 sprints'],
    gradient: 'linear-gradient(135deg, #22d3ee, #7c5cff)',
    description:
      'A realtime operations board with auth, kanban, presence, and activity feeds — deployed on Vercel + Railway.',
  },
  {
    id: 'p2',
    title: 'Folio — Portfolio Builder',
    domain: 'frontend',
    intern: 'Sana Iqbal',
    year: '2025',
    stack: ['Next.js', 'Tailwind', 'GSAP', 'Vercel'],
    metrics: ['12k clicks', '100 Lighthouse', '0 CLS'],
    gradient: 'linear-gradient(135deg, #38ffb0, #22d3ee)',
    description:
      'A design-system-grade portfolio generator with scroll motion, CMS content, and an a11y score of 100.',
  },
  {
    id: 'p3',
    title: 'PayFlow — Payment Sandbox',
    domain: 'backend',
    intern: 'Devansh Rao',
    year: '2024',
    stack: ['Node.js', 'PostgreSQL', 'Redis', 'Stripe'],
    metrics: ['99.98% uptime', '340 rps', 'PCI-ish flow'],
    gradient: 'linear-gradient(135deg, #ff5c7a, #7c5cff)',
    description:
      'A simulated payments API with idempotency keys, webhooks, retries, and a metrics dashboard.',
  },
  {
    id: 'p4',
    title: 'HabitPulse App',
    domain: 'mobile',
    intern: 'Priya Nair',
    year: '2025',
    stack: ['Flutter', 'Firebase', 'RevenueCat'],
    metrics: ['2k downloads', '4.6★ rating', 'offline-first'],
    gradient: 'linear-gradient(135deg, #ff8ac2, #7c5cff)',
    description:
      'An offline-first habit tracker with streaks, widgets, and local-first sync — published to the Play Store.',
  },
  {
    id: 'p5',
    title: 'SentimentLens — NLP Analytics',
    domain: 'ai',
    intern: 'Kabir Shah',
    year: '2025',
    stack: ['Python', 'LangChain', 'OpenAI', 'Pinecone'],
    metrics: ['87% F1', 'RAG pipeline', 'live demo'],
    gradient: 'linear-gradient(135deg, #b4ff39, #38ffb0)',
    description:
      'Product-review intelligence with retrieval-augmented sentiment, topic clustering, and a chat-down app.',
  },
  {
    id: 'p6',
    title: 'GuardNet Threat Simulator',
    domain: 'cyber',
    intern: 'Riya Kapoor',
    year: '2024',
    stack: ['Docker', 'Kali', 'Burp', 'Python'],
    metrics: ['14 labs', '24 vulns', 'SIEM-ready'],
    gradient: 'linear-gradient(135deg, #4ade80, #22d3ee)',
    description:
      'A self-hosted capture-the-flag lab with a vulnerable app, guided exploitation paths, and defense playbooks.',
  },
  {
    id: 'p7',
    title: 'Kline — Exchange Pipeline',
    domain: 'dataeng',
    intern: 'Arjun Verma',
    year: '2024',
    stack: ['Airflow', 'Spark', 'dbt', 'BigQuery'],
    metrics: ['22 DAGs', '2.1M rows/day', '99.5% SLA'],
    gradient: 'linear-gradient(135deg, #5c8bff, #38bdf8)',
    description:
      'Real-time and batch trading-data pipelines with idempotent runs, quality gates, and a warehouse-layer model.',
  },
  {
    id: 'p8',
    title: 'Tide — Design Tokens Kit',
    domain: 'uiux',
    intern: 'Ananya Joshi',
    year: '2025',
    stack: ['Figma', 'Storybook', 'Tokens Studio'],
    metrics: ['180 tokens', '120 screens', '5 flows'],
    gradient: 'linear-gradient(135deg, #a78bfa, #ff8ac2)',
    description:
      'An end-to-end design system with theming, motion specs, and a Storybook-driven component library.',
  },
]

export const TESTIMONIALS = [
  {
    name: 'Meera Krishnan',
    role: 'Front-End Engineer @ Swiggy',
    domain: 'frontend',
    quote:
      'The seat-countdown pressure sounds gimmicky — until you realize it forces real focus. I shipped a portfolio in 3 months that got me referrals.',
    avatar: 'MK',
    gradient: 'linear-gradient(135deg,#22d3ee,#7c5cff)',
  },
  {
    name: 'Rohan Pillai',
    role: 'Data Engineer @ Fractal',
    domain: 'dataeng',
    quote:
      'The screening quiz was the exact signal that mattered. I walked into the program already knowing what production data work looks like.',
    avatar: 'RP',
    gradient: 'linear-gradient(135deg,#38ffb0,#22d3ee)',
  },
  {
    name: 'Simran Kaur',
    role: 'Security Analyst @ Infosys',
    domain: 'cyber',
    quote:
      'That AI mock interview scanned my calm under pressure. Weirdly, it prepared me more than any mock I had done face-to-face.',
    avatar: 'SK',
    gradient: 'linear-gradient(135deg,#4ade80,#7c5cff)',
  },
]

export const COMPANY_STATS = [
  { label: 'Interns trained', value: 1240 },
  { label: 'Live projects shipped', value: 340 },
  { label: 'Partner companies', value: 58 },
  { label: 'Average placement rate', value: 86, suffix: '%' },
]