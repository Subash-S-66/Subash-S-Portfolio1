/**
 * Project data extracted for the portfolio.
 * Each project preserves liveDemo URLs and APK download configs.
 */

export const projects = [
  {
    id: 1,
    title: 'BOLT & BROOK',
    subtitle: 'E-Commerce Website',
    role: 'Full-Stack Developer',
    date: '2025–2026',
    description:
      'Full-stack e-commerce platform for selling dresses with integrated Razorpay payment gateway (test mode). Role-based login, REST APIs, and a mobile-friendly Tailwind UI.',
    features: [
      'Role-based login (Admin & Customer)',
      'Razorpay payment gateway (test mode)',
      'REST APIs with Express.js + MySQL',
    ],
    techStack: ['React.js', 'Node.js', 'Express.js', 'Tailwind CSS', 'MySQL', 'Razorpay'],
    category: 'Full Stack',
    color: '#00d4ff',
    liveDemo: 'https://stage.boltandbrook.com/',
  },
  {
    id: 2,
    title: 'SERVIFY',
    subtitle: 'Freelance Bidding Platform',
    role: 'Full-Stack Project',
    date: '2024–2025',
    description:
      'Real-time freelance bidding platform enabling clients to post projects and freelancers to place competitive bids with interactive dashboards.',
    features: [
      'Interactive dashboards & responsive listings',
      'Real-time bidding interactions',
      'Dual UX for clients and freelancers',
    ],
    techStack: ['MongoDB', 'Express.js', 'React.js', 'Node.js'],
    category: 'Full Stack',
    color: '#00ffa3',
    liveDemo: 'https://servify.zeabur.app/',
  },
  {
    id: 3,
    title: 'EXPENSE TRACKER',
    subtitle: 'Finance Management System',
    role: 'Full-Stack Developer',
    date: '2025–2026',
    description:
      'Full-stack expense tracker to simplify personal finance via SMS-based transaction logging, loans, and salary aggregation with chart analytics.',
    features: [
      'Flask APIs for SMS regex extraction',
      'Recharts-powered analytics dashboard',
      'Real-time filters and daily monitoring',
    ],
    techStack: ['React.js', 'Flask', 'Python', 'Tailwind CSS', 'Recharts'],
    category: 'Full Stack',
    color: '#ff2d55',
    liveDemo: 'https://subash-s-66.github.io/expense-tracking-system/',
    apkDownloads: [
      {
        label: 'Expense Tracker',
        fileName: 'Expense Tracker.apk',
        url: '/apk/Expense%20Tracker.apk',
      },
    ],
  },
  {
    id: 4,
    title: 'FAIRSHARE',
    subtitle: 'Debt Management Product',
    role: 'Full-Stack Developer (Web + Mobile)',
    date: '2025–2026',
    description:
      'Debt-management product tracking split bills, direct lends, settlements, and reminder workflows across web and mobile platforms.',
    features: [
      'JWT auth with password reset flow',
      'Split-bill and direct-lend workflows',
      'Automated reminders with timezone controls',
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Capacitor'],
    category: 'Full Stack',
    color: '#a855f7',
    liveDemo: 'https://subash-s-66.github.io/FairSplit/',
    apkDownloads: [
      {
        label: 'Fair Split',
        fileName: 'Fair Split.apk',
        url: '/apk/Fair%20Split.apk',
      },
    ],
  },
  {
    id: 5,
    title: 'ISL TRANSLATOR',
    subtitle: 'Real-Time Sign Language AI',
    role: 'AI/ML + Full-Stack Developer',
    date: '2025–2026',
    description:
      'Real-time AI system translating Indian Sign Language gestures from webcam video into text using a temporal deep learning pipeline with ONNX Runtime.',
    features: [
      'WebSocket live stream inference',
      'MediaPipe + ONNX LSTM pipeline',
      'PyTorch training and ONNX deployment',
    ],
    techStack: ['React', 'FastAPI', 'WebSocket', 'MediaPipe', 'PyTorch', 'LSTM', 'ONNX'],
    category: 'AI / ML',
    color: '#ff6b9d',
  },
]

/**
 * Triggers APK download(s) with a confirmation dialog.
 * Preserved from the original implementation.
 */
export const downloadApkFiles = (apkDownloads) => {
  if (!apkDownloads?.length) return

  const appList = apkDownloads.map((apk) => `• ${apk.label}`).join('\n')
  const title = apkDownloads.length > 1 ? 'Download Android apps?' : 'Download Android app?'
  const shouldDownload = window.confirm(`${title}\n\n${appList}`)

  if (!shouldDownload) return

  apkDownloads.forEach((apk) => {
    const link = document.createElement('a')
    link.href = apk.url
    link.download = apk.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  })
}
