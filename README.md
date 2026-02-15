<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white)](https://subash-dev-portfolio.zeabur.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=8B5CF6&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=80&lines=Full-Stack+Developer+%7C+MERN+%2B+AI;Building+immersive+digital+products" alt="Typing SVG" />

</div>

---

## ✨ Highlights

- **Cosmic Dark Theme** - Deep void backgrounds, neon cyan/purple/pink accents, and glass-panel UI
- **3D Hero Scene** - Interactive Three.js scene powered by `@react-three/fiber` and `@react-three/drei`
- **Smooth Animations** - GSAP ScrollTrigger, Framer Motion transitions, text scramble effects, and Lenis smooth scrolling
- **Custom Cursor & Grain Overlay** - Signature visual touches for an immersive experience
- **Neural Pathways Background** - Animated canvas neural network behind sections
- **Contact Form with Backend** - Express API with validation, security middleware, and dual email delivery (Resend + SMTP fallback)
- **APK Distribution** - Direct Android app downloads (`Expense Tracker.apk`, `Fair Split.apk`)
- **Docker-Ready** - Multi-stage Alpine Linux Dockerfile for production deployment

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion, GSAP, Lenis, Three.js |
| **3D Graphics** | `@react-three/fiber`, `@react-three/drei` |
| **Backend** | Node.js, Express.js, Helmet, CORS, Express Validator, Rate Limiter, Resend, Nodemailer |
| **Database** | MongoDB, MySQL, PostgreSQL *(across projects)* |
| **Styling** | Tailwind CSS, custom gradients, glassmorphism |
| **Deployment** | Docker (Alpine), Zeabur, Render |
| **Version Control** | Git, GitHub |

---

## 📁 Project Structure

```text
.
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # UI and animation components
│   │   │   ├── Hero.jsx
│   │   │   ├── HeroScene.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NeuralPathways.jsx
│   │   │   ├── CustomCursor.jsx
│   │   │   └── ...
│   │   ├── data/                # Personal, projects, and skills content
│   │   ├── config/              # API endpoint config
│   │   └── hooks/
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── server.js                # Express API + contact/email handlers
│   ├── email-template.html
│   ├── env.example
│   └── Dockerfile
├── Android app/
│   ├── Expense Tracker.apk
│   └── Fair Split.apk
├── frontend/Dockerfile
├── Dockerfile                   # Root multi-stage Docker build
├── package.json                 # Monorepo scripts and dependencies
└── README.md
```

---

## 🚀 Featured Projects

| # | Project | Description | Stack |
|---|---------|-------------|-------|
| 1 | **BOLT & BROOK** | Full-stack e-commerce platform with Razorpay payments | React, Node.js, Express, MySQL, Razorpay |
| 2 | **SERVIFY** | Real-time freelance bidding platform | MongoDB, Express, React, Node.js |
| 3 | **EXPENSE TRACKER** | SMS-based finance tracker with chart analytics | React, Flask, Python, Recharts |
| 4 | **FAIRSHARE** | Debt management with split-bill workflows (Web + Mobile) | React, TypeScript, Node.js, MongoDB, Capacitor |
| 5 | **ISL TRANSLATOR** | Real-time Indian Sign Language AI translator | React, FastAPI, WebSocket, PyTorch, ONNX |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/Subash-S-66/Subash-S-Portfolio1.git
cd Subash-S-Portfolio1

# Install dependencies (root monorepo)
npm install

# Start frontend dev server
npm run dev

# Start backend server (in a separate terminal)
npm run server

# Run frontend + backend together
npm run dev:full
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_EMAIL=your-email@gmail.com

# Email (SMTP / Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=your-email@gmail.com
```

Optional for frontend API base URL:

```env
VITE_API_URL=http://localhost:5000
```

### Docker

```bash
# Build the Docker image
docker build -t subash-portfolio .

# Run the container
docker run -p 5000:5000 subash-portfolio
```

---

## 🎨 Theme

The portfolio uses a custom **Cosmic Dark** theme:

| Element | Hex |
|---------|-----|
| Cosmic Cyan | `#00d4ff` |
| Cosmic Violet | `#a855f7` |
| Signal Pink | `#ff2d55` |
| Accent Green | `#00ffa3` |
| Dark Void | `#030014` |
| Surface Overlay | `rgba(255,255,255,0.02)` |

---

## 📧 Contact

<div align="center">

| Channel | Details |
|---------|---------|
| 📧 **Email** | [subash.93450@gmail.com](mailto:subash.93450@gmail.com) |
| 📞 **Phone** | [+91-9345081127](tel:+919345081127) |
| 💼 **LinkedIn** | [Subash S](https://www.linkedin.com/in/subash-s-514aa9373) |
| 🐙 **GitHub** | [@Subash-S-66](https://github.com/Subash-S-66) |
| 📍 **Location** | Chennai, India |

</div>

---

## 📄 License

MIT (as defined in `package.json`).

---

<div align="center">

**Built by [Subash S](https://github.com/Subash-S-66)**

*B.Tech Computer Science - Dr. M.G.R. Educational and Research Institute*

</div>
