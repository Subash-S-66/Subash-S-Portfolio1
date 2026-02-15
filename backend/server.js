import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { body, validationResult } from 'express-validator'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Always log port information for debugging
console.log(`🔧 Environment PORT: ${process.env.PORT}`)
console.log(`🔧 Using PORT: ${PORT}`)
console.log(`🔧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'SET' : 'NOT SET'}`)
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`)

// Trust proxy for rate limiting (required for Render.com)
app.set('trust proxy', 1)

// Resolve __dirname for ESM so static files are served relative to this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
// Helmet + CSP: allow Zeabur host and Google Fonts for styles and fonts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Allow stylesheet links (external and element-level) from known deployment hosts and Google Fonts
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        process.env.CLIENT_URL || 'https://subash-s-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-s-portfolio.zeabur.app',
        process.env.GITHUB_PAGES_URL || 'https://subash-s-portfolio.zeabur.app'
      ],
      styleSrcElem: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        process.env.CLIENT_URL || 'https://subash-s-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-s-portfolio.zeabur.app',
        process.env.GITHUB_PAGES_URL || 'https://subash-s-portfolio.zeabur.app'
      ],
      // Allow scripts from self; keep unsafe-inline/eval to support some libs if needed
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      // Allow API connections from the app origin (Zeabur) and any configured API URL
      connectSrc: [
        "'self'",
        process.env.API_URL || process.env.CLIENT_URL || process.env.ZEABUR_URL || 'https://subash-s-portfolio.zeabur.app',
        process.env.ZEABUR_URL || 'https://subash-s-portfolio.zeabur.app'
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}))
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'https://subash-s-portfolio.zeabur.app',
    'https://subash-s-portfolio.zeabur.app',
    process.env.ZEABUR_URL || 'https://subash-s-portfolio.zeabur.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Contact form rate limiting (more restrictive)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact form submissions per windowMs
  message: 'Too many contact form submissions, please try again later.'
})

// Resend email configuration
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Nodemailer transporter (if SMTP env vars are provided)
let smtpTransporter = null
const usingSMTP = !!process.env.EMAIL_HOST && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD
if (usingSMTP) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

const sendEmailWithResend = async (to, subject, html, replyTo = null) => {
  if (!resend) throw new Error('Resend API key not configured')

  try {
    const emailData = {
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html
    }

    if (replyTo) {
      emailData.reply_to = replyTo
    }

    const result = await resend.emails.send(emailData)
    console.log('Resend email sent successfully:', result.data?.id)
    return result
  } catch (error) {
    console.error('Resend email sending failed:', error.message)
    throw error
  }
}

const sendEmailWithSMTP = async (to, subject, html, replyTo = null) => {
  if (!smtpTransporter) throw new Error('SMTP transporter not configured')

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html
  }

  if (replyTo) mailOptions.replyTo = replyTo

  const info = await smtpTransporter.sendMail(mailOptions)
  console.log('SMTP email sent:', info.messageId)
  return info
}

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

// Debug endpoints (temporary) to help verify CSP and the served index
app.get('/_debug/csp', (req, res) => {
  const csp = res.getHeader('content-security-policy') || res.getHeader('Content-Security-Policy') || 'not-set'
  res.json({ csp })
})

app.get('/_debug/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString()
  })
})

// Contact form endpoint
app.post('/api/contact', 
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('subject')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Subject must be between 5 and 100 characters'),
    body('message')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { name, email, subject, message } = req.body

      // Build main notification HTML
      const mainEmailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
            body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030014; color: #e4e4e7; }
            .wrapper { background-color: #030014; padding: 30px 15px; }
            .container { max-width: 700px; margin: 0 auto; background-color: #0a0a1a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ff2d55 100%); padding: 40px 30px; text-align: center; color: white; position: relative; }
            .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 30px; background: linear-gradient(to bottom, transparent, #0a0a1a); }
            .header-badge { display: inline-block; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.9); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px; }
            .header h2 { margin: 0; font-family: 'Space Grotesk', 'Inter', sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
            .header p { margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 300; }
            .content { padding: 30px; }
            .glass-card { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 22px; margin: 18px 0; }
            .contact-info { border-left: 3px solid #00d4ff; }
            .contact-info h3 { margin: 0 0 15px 0; font-family: 'Space Grotesk', 'Inter', sans-serif; color: #00d4ff; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; }
            .contact-info p { margin: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px; }
            .contact-info strong { color: #ffffff; font-weight: 500; }
            .contact-info a { color: #00d4ff; text-decoration: none; }
            .message-section { border-left: 3px solid #a855f7; }
            .message-section h3 { margin: 0 0 15px 0; font-family: 'Space Grotesk', 'Inter', sans-serif; color: #a855f7; font-size: 15px; font-weight: 600; letter-spacing: 0.5px; }
            .message-text { color: rgba(255,255,255,0.8); line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
            .timestamp { border-left: 3px solid #00ffa3; }
            .timestamp p { margin: 0; color: rgba(255,255,255,0.75); font-size: 13px; text-align: center; }
            .timestamp strong { color: #00ffa3; }
            .footer { background-color: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); padding: 24px 30px; text-align: center; }
            .footer p { margin: 0; color: rgba(255,255,255,0.45); font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="header-badge">&#9889; New Message</div>
              <h2>New Contact Form Submission</h2>
              <p>You have received a new message from your portfolio website</p>
            </div>
            <div class="content">
              <div class="glass-card contact-info">
                <h3>&#9670; Contact Information</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
              </div>
              <div class="glass-card message-section">
                <h3>&#9670; Message</h3>
                <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="glass-card timestamp">
                <p><strong>Received:</strong> ${new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZoneName: 'short'
                })}</p>
              </div>
            </div>
            <div class="footer">
              <p>This notification was sent from your portfolio contact form.</p>
            </div>
          </div>
          </div>
        </body>
        </html>
      `

      // Auto-reply HTML (dark portfolio-themed template)
      const autoReplyHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting Subash</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
            body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030014; color: #e4e4e7; }
            .wrapper { background-color: #030014; padding: 30px 15px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #0a0a1a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ff2d55 100%); padding: 50px 30px; text-align: center; position: relative; }
            .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 40px; background: linear-gradient(to bottom, transparent, #0a0a1a); }
            .header-badge { display: inline-block; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.9); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; }
            .header h1 { margin: 0; font-family: 'Space Grotesk', 'Inter', sans-serif; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
            .header p { margin: 12px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.9); font-weight: 300; }
            .content { padding: 40px 30px; }
            .glass-card { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 22px; margin: 18px 0; }
            .glass-card h3, .glass-card h4 { margin: 0 0 12px 0; font-family: 'Space Grotesk', 'Inter', sans-serif; font-weight: 600; }
            .message-summary { border-left: 3px solid #00d4ff; }
            .message-summary h3 { color: #00d4ff; font-size: 16px; letter-spacing: 0.5px; }
            .message-summary p { margin: 6px 0; color: rgba(255,255,255,0.8); font-size: 14px; }
            .message-summary strong { color: #ffffff; font-weight: 500; }
            .message-content { border-left: 3px solid #a855f7; }
            .message-content h4 { color: #a855f7; font-size: 15px; letter-spacing: 0.5px; }
            .message-text { color: rgba(255,255,255,0.8); line-height: 1.7; white-space: pre-line; font-size: 14px; }
            .response-info { border-left: 3px solid #00ffa3; }
            .response-info h4 { color: #00ffa3; font-size: 15px; }
            .response-info p { margin: 0; color: rgba(255,255,255,0.75); line-height: 1.6; font-size: 14px; }
            .connect-section { text-align: center; margin: 28px 0 10px 0; }
            .connect-section h4 { color: #e4e4e7; font-family: 'Space Grotesk', 'Inter', sans-serif; font-size: 16px; font-weight: 600; margin: 0 0 6px 0; }
            .connect-section p { color: rgba(255,255,255,0.65); font-size: 13px; margin: 0 0 18px 0; }
            .connect-links a { display: inline-block; margin: 5px 6px; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; letter-spacing: 0.3px; }
            .btn-cyan { background: rgba(0,212,255,0.12); border: 1px solid rgba(0,212,255,0.3); color: #00d4ff; }
            .btn-purple { background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3); color: #a855f7; }
            .btn-green { background: rgba(0,255,163,0.12); border: 1px solid rgba(0,255,163,0.3); color: #00ffa3; }
            .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 28px 0; }
            .closing-text { color: rgba(255,255,255,0.7); text-align: center; margin: 20px 0 0 0; font-size: 14px; font-weight: 300; }
            .footer { background-color: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 30px; text-align: center; }
            .footer-name { margin: 0 0 4px 0; font-family: 'Space Grotesk', 'Inter', sans-serif; font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #00d4ff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .footer-title { margin: 0 0 4px 0; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 400; }
            .footer-org { margin: 0; color: rgba(255,255,255,0.55); font-size: 12px; }
            .footer-links { margin: 18px 0; }
            .footer-links a { display: inline-block; margin: 0 10px; color: #00d4ff; text-decoration: none; font-size: 13px; font-weight: 500; }
            .footer-links .sep { color: rgba(255,255,255,0.3); }
            .footer-note { font-size: 11px; margin-top: 18px; color: rgba(255,255,255,0.45); }
          </style>
        </head>
        <body>
          <div class="wrapper">
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="header-badge">&#9889; Transmission Received</div>
              <h1>Thank You for Reaching Out!</h1>
              <p>Your message has been received. I appreciate you taking the time to connect.</p>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="glass-card message-summary">
                <h3>&#9670; Message Summary</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Received:</strong> ${new Date().toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>

              <div class="glass-card message-content">
                <h4>&#9670; Your Message</h4>
                <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
              </div>

              <div class="glass-card response-info">
                <h4>&#9670; Response Time</h4>
                <p>I typically respond to all messages within 24-48 hours. For urgent inquiries, feel free to follow up on this email.</p>
              </div>

              <hr class="divider">

              <div class="connect-section">
                <h4>Alternative Ways to Connect</h4>
                <p>While you wait, you can also reach me through:</p>
                <div class="connect-links">
                  <a href="https://www.linkedin.com/in/subash-s-514aa9373" target="_blank" class="btn-cyan">LinkedIn</a>
                  <a href="https://github.com/Subash-S-66" target="_blank" class="btn-purple">GitHub</a>
                  <a href="mailto:${process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'}" class="btn-green">Email</a>
                </div>
              </div>

              <p class="closing-text">Looking forward to connecting with you soon!</p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <h5 class="footer-name">Subash S</h5>
              <p class="footer-title">Full Stack Developer &bull; B.Tech Computer Science</p>
              <p class="footer-org">Dr. M.G.R. Educational and Research Institute, Chennai</p>
              <div class="footer-links">
                <a href="https://github.com/Subash-S-66" target="_blank">GitHub</a>
                <span class="sep">&#8226;</span>
                <a href="https://www.linkedin.com/in/subash-s-514aa9373" target="_blank">LinkedIn</a>
                <span class="sep">&#8226;</span>
                <a href="mailto:${process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'}">Email</a>
              </div>
              <p class="footer-note">This is an automated response. Please do not reply to this email directly.</p>
            </div>
          </div>
          </div>
        </body>
        </html>
      `

      // Where to send the admin notification
      const notificationEmail = process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || 'subash.93450@gmail.com'

      // Send notification to admin using SMTP if configured, otherwise try Resend
      if (usingSMTP) {
        // Send notification to admin
        await sendEmailWithSMTP(notificationEmail, `Portfolio Contact: ${subject}`, mainEmailHtml, email)
        // Send auto-reply to sender via SMTP (not third-party)
        try {
          await sendEmailWithSMTP(email, `Thank you for contacting me - ${subject}`, autoReplyHtml, notificationEmail)
        } catch (err) {
          console.warn('Auto-reply failed (SMTP):', err.message)
        }
      } else if (process.env.RESEND_API_KEY) {
        // Send notification via Resend (only admin, no auto-reply to avoid third-party for sender)
        await sendEmailWithResend(notificationEmail, `Portfolio Contact: ${subject}`, mainEmailHtml, email)
        console.log('Auto-reply not sent to sender (Resend is third-party service)')
      } else {
        console.log('No email service configured. Message received but not sent via email.')
        console.log('Name:', name, 'Email:', email, 'Subject:', subject, 'Message:', message)
      }

      res.json({
        success: true,
        message: 'Message received! I\'ll get back to you soon.'
      })

    } catch (error) {
      console.error('Contact form error:', error.message)
      
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      })
    }
  }
)

// Portfolio data endpoint
app.get('/api/portfolio', (req, res) => {
  const portfolioData = {
    personal: {
      name: 'Subash S',
      title: 'B.Tech Computer Science Student',
      subtitle: 'Full Stack Developer using MERN Stack',
      email: 'your-email@gmail.com',
      phone: '+91-9345081127',
      location: 'Chennai, India',
      github: 'https://github.com/Subash-S-66',
      linkedin: 'https://www.linkedin.com/in/subash-s-514aa9373'
    },
    about: {
      summary: 'Computer Science Engineering student with practical experience in full-stack web development, focusing on the MERN stack (using MySQL instead of MongoDB). Currently doing an internship at Postulate Info Tech, contributing to real-world projects.',
      cgpa: '7.7/10',
      university: 'Dr.M.G.R. Educational and Research Institute, Chennai',
      graduationYear: '2022-2026'
    },
    skills: {
      programming: ['JavaScript', 'Python'],
      frontend: ['React.js', 'Node.js', 'Express.js', 'HTML', 'CSS', 'Tailwind CSS'],
      database: ['MySQL','PostgreSQL','MongoDB'],
      tools: ['Git', 'GitHub'],
      softSkills: ['Problem Solving', 'Teamwork', 'Communication']
    },
    languages: [
      { name: 'English', level: 'Fluent' },
      { name: 'Tamil', level: 'Fluent' },
      { name: 'Hindi', level: 'Basics' }
    ]
  }

  res.json(portfolioData)
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  })
})

// Serve static files from the React app build directory (relative to this file)
app.use(express.static(path.join(__dirname, 'dist')))
// Also serve the same build when the app is hosted under a subpath (Zeabur uses /projects)
app.use('/projects', express.static(path.join(__dirname, 'dist')))
// Serve Android APK files from the root-level "Android app" folder
app.use('/apk', express.static(path.join(__dirname, '..', 'Android app')))
app.use('/projects/apk', express.static(path.join(__dirname, '..', 'Android app')))

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  // If the request starts with the Zeabur subpath, ensure we return the built index
  // so relative asset links resolve under /projects/* correctly.
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
