// Polyfill browser APIs required by pdfjs-dist (text extraction only — no rendering)
globalThis.DOMMatrix  = globalThis.DOMMatrix  ?? class DOMMatrix  { constructor() {} };
globalThis.ImageData  = globalThis.ImageData  ?? class ImageData  {};
globalThis.Path2D     = globalThis.Path2D     ?? class Path2D     {};

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';
import OpenAI from 'openai';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'localdev';

// DeepSeek uses the OpenAI-compatible API — just swap the baseURL.
// Fallback placeholder prevents constructor throw when .env isn't set yet;
// the chat endpoint checks for the real key before making any API call.
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'not-set',
  baseURL: 'https://api.deepseek.com'
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database ──────────────────────────────────────────────────────────────────

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'app.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT,
  doc_type TEXT DEFAULT 'other',
  description TEXT,
  file_mime TEXT,
  uploaded_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

// Schema migrations for existing deployments
const userCols = db.pragma('table_info(users)').map((c) => c.name);
if (!userCols.includes('name')) db.exec('ALTER TABLE users ADD COLUMN name TEXT');
if (!userCols.includes('dob')) db.exec('ALTER TABLE users ADD COLUMN dob TEXT');
if (!userCols.includes('blood_group')) db.exec('ALTER TABLE users ADD COLUMN blood_group TEXT');

// ── File storage ──────────────────────────────────────────────────────────────

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed'));
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const otpStore = new Map();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function isLocalhost(req) {
  const ip = req.ip || '';
  const forwarded = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return [ip, forwarded].some((v) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(v));
}

function findReferencedDoc(allDocs, userMessage) {
  const lower = userMessage.toLowerCase();
  const broadKeywords = ['latest', 'recent', 'last', 'new', 'my report', 'the report', 'analyze', 'analyse', 'explain', 'summarize', 'summarise', 'summary'];
  for (const doc of allDocs) {
    if (lower.includes(doc.title.toLowerCase())) return doc;
  }
  if (broadKeywords.some((k) => lower.includes(k))) return allDocs[0] || null;
  return null;
}

async function extractDocContent(doc) {
  const filePath = path.join(uploadsDir, doc.filename);
  if (!fs.existsSync(filePath)) return null;

  const mime = doc.file_mime || 'application/pdf';

  // PDFs → extract text (DeepSeek reads text, not raw PDF bytes)
  if (mime === 'application/pdf') {
    try {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      const text = data.text.trim().slice(0, 12000);
      if (text) return { type: 'text', text: `--- Content of "${doc.title}" ---\n${text}\n---` };
    } catch {
      return null;
    }
  }

  // Images → OpenAI-compatible vision format (DeepSeek-V3 supports this)
  if (mime.startsWith('image/')) {
    const b64 = fs.readFileSync(filePath).toString('base64');
    return { type: 'image_url', image_url: { url: `data:${mime};base64,${b64}` } };
  }

  return null;
}

async function buildAIMessages(userId, userMessage) {
  const userDocs = db
    .prepare(
      `SELECT id, title, doc_type, description, filename, file_mime, uploaded_at
       FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC`
    )
    .all(userId);

  const legacyReports = db
    .prepare(`SELECT id, title, filename, uploaded_at FROM reports WHERE user_id = ? ORDER BY uploaded_at DESC`)
    .all(userId);

  const allDocs = [
    ...userDocs.map((d) => ({ ...d, source: 'documents' })),
    ...legacyReports.map((r) => ({ ...r, source: 'reports', doc_type: 'blood_report', file_mime: 'application/pdf' }))
  ];

  const docList = allDocs
    .map((d, i) => `${i + 1}. [${d.doc_type || 'report'}] "${d.title}" — uploaded ${d.uploaded_at.slice(0, 10)}`)
    .join('\n') || 'No documents uploaded yet.';

  const targetDoc = findReferencedDoc(allDocs, userMessage);
  const fileContent = targetDoc ? await extractDocContent(targetDoc) : null;

  return { fileContent, docList };
}

// ── Static files ──────────────────────────────────────────────────────────────

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '..')));

// ── Auth endpoints ────────────────────────────────────────────────────────────

app.post('/api/signup', async (req, res) => {
  const { email, password, phone } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already exists' });
  const password_hash = await bcrypt.hash(password, 10);
  const info = db.prepare('INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)').run(email, phone || null, password_hash);
  const user = db.prepare('SELECT id, email, phone FROM users WHERE id = ?').get(info.lastInsertRowid);
  return res.json({ token: signToken(user), user });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.prepare('SELECT id, email, phone, password_hash FROM users WHERE email = ?').get(email);
  if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ token: signToken(user), user: { id: user.id, email: user.email, phone: user.phone } });
});

app.post('/api/request-otp', (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: 'Email or phone required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(identifier, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
  return res.json({ message: 'OTP generated (mock).', code });
});

app.post('/api/verify-otp', (req, res) => {
  const { identifier, code } = req.body;
  const record = otpStore.get(identifier);
  if (!record || record.expiresAt < Date.now()) return res.status(400).json({ error: 'OTP expired' });
  if (record.code !== code) return res.status(400).json({ error: 'Invalid code' });
  otpStore.delete(identifier);
  let user = db.prepare('SELECT id, email, phone FROM users WHERE email = ? OR phone = ?').get(identifier, identifier);
  if (!user) {
    const isEmail = identifier.includes('@');
    const info = db.prepare('INSERT INTO users (email, phone) VALUES (?, ?)').run(isEmail ? identifier : null, isEmail ? null : identifier);
    user = db.prepare('SELECT id, email, phone FROM users WHERE id = ?').get(info.lastInsertRowid);
  }
  return res.json({ token: signToken(user), user });
});

// ── Patient profile ───────────────────────────────────────────────────────────

app.get('/api/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, phone, name, dob, blood_group, created_at FROM users WHERE id = ?').get(req.user.id);
  return res.json({ user });
});

app.put('/api/profile', authMiddleware, (req, res) => {
  const { name, dob, blood_group, phone } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), dob = COALESCE(?, dob), blood_group = COALESCE(?, blood_group), phone = COALESCE(?, phone) WHERE id = ?')
    .run(name || null, dob || null, blood_group || null, phone || null, req.user.id);
  const user = db.prepare('SELECT id, email, phone, name, dob, blood_group, created_at FROM users WHERE id = ?').get(req.user.id);
  return res.json({ user });
});

// ── Reports (legacy + new documents) ─────────────────────────────────────────

app.get('/api/reports', authMiddleware, (req, res) => {
  const reports = db.prepare('SELECT id, title, filename, uploaded_at FROM reports WHERE user_id = ? ORDER BY uploaded_at DESC').all(req.user.id);
  return res.json({ reports: reports.map((r) => ({ ...r, url: `/uploads/${r.filename}`, doc_type: 'blood_report', source: 'reports' })) });
});

// Patient self-upload document
app.post('/api/documents/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' });
  const { title, doc_type = 'blood_report', description = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const info = db.prepare(
    'INSERT INTO documents (user_id, title, filename, original_name, doc_type, description, file_mime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, title, req.file.filename, req.file.originalname, doc_type, description, req.file.mimetype);
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(info.lastInsertRowid);
  return res.json({ document: { ...doc, url: `/uploads/${doc.filename}` } });
});

// List all documents for current patient
app.get('/api/documents', authMiddleware, (req, res) => {
  const docs = db.prepare(
    'SELECT id, title, filename, original_name, doc_type, description, file_mime, uploaded_at FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC'
  ).all(req.user.id);
  return res.json({ documents: docs.map((d) => ({ ...d, url: `/uploads/${d.filename}` })) });
});

// Delete a document
app.delete('/api/documents/:id', authMiddleware, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(uploadsDir, doc.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.prepare('DELETE FROM documents WHERE id = ?').run(doc.id);
  return res.json({ message: 'Deleted' });
});

// Delete a legacy report
app.delete('/api/reports/:id', authMiddleware, (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!report) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(uploadsDir, report.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.prepare('DELETE FROM reports WHERE id = ?').run(report.id);
  return res.json({ message: 'Deleted' });
});

// ── Admin upload (unchanged) ──────────────────────────────────────────────────

app.post('/api/admin/upload', upload.single('report'), (req, res) => {
  if (!isLocalhost(req)) return res.status(403).json({ error: 'Admin upload restricted to localhost' });
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Invalid admin secret' });
  const { userEmail, userPhone, title } = req.body;
  if (!req.file || !title || (!userEmail && !userPhone)) return res.status(400).json({ error: 'Missing required fields' });
  let user = db.prepare('SELECT id FROM users WHERE email = ? OR phone = ?').get(userEmail || '', userPhone || '');
  if (!user) {
    const info = db.prepare('INSERT INTO users (email, phone) VALUES (?, ?)').run(userEmail || null, userPhone || null);
    user = { id: info.lastInsertRowid };
  }
  db.prepare('INSERT INTO reports (user_id, title, filename) VALUES (?, ?, ?)').run(user.id, title, req.file.filename);
  return res.json({ message: 'Report uploaded' });
});

// ── AI Chat ───────────────────────────────────────────────────────────────────

app.get('/api/chat/history', authMiddleware, (req, res) => {
  const messages = db
    .prepare('SELECT id, role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 100')
    .all(req.user.id);
  return res.json({ messages });
});

app.delete('/api/chat/history', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(req.user.id);
  return res.json({ message: 'History cleared' });
});

app.post('/api/chat', authMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message required' });

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(503).json({ error: 'AI chat is not configured. Please add DEEPSEEK_API_KEY to your server .env file.' });
  }

  // Persist user message
  db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)').run(req.user.id, 'user', message);

  // Fetch recent history (last 20 turns, excluding the message just inserted)
  const history = db
    .prepare('SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 40')
    .all(req.user.id)
    .reverse()
    .slice(0, -1); // exclude the message we just inserted — we'll add it with optional file

  const patientInfo = db.prepare('SELECT name, dob, blood_group, email FROM users WHERE id = ?').get(req.user.id);
  const ctx = await buildAIMessages(req.user.id, message);

  const systemPrompt = `You are a helpful, empathetic medical AI assistant for Jivanu Therapeutics — a microbiome-based therapeutics company. Your role is to help patients understand their medical documents, blood reports, and health data.

Patient information:
- Name: ${patientInfo.name || 'Not provided'}
- Date of birth: ${patientInfo.dob || 'Not provided'}
- Blood group: ${patientInfo.blood_group || 'Not provided'}
- Email: ${patientInfo.email || 'Not provided'}

Patient's uploaded documents:
${ctx.docList}

Guidelines:
- Be warm, clear, and non-alarmist.
- Explain medical terms in plain language.
- If a value is outside normal range, explain what it means and suggest they consult their doctor.
- Never provide a diagnosis — only explain findings and recommend professional consultation.
- If no documents are uploaded, encourage the patient to upload their reports.
- Respond in the same language the patient uses.`;

  try {
    // System prompt is the first message in OpenAI/DeepSeek format
    const systemMsg = { role: 'system', content: systemPrompt };
    const historyMsgs = history.map((m) => ({ role: m.role, content: m.content }));

    // Latest user message — optionally includes extracted file content
    const userContent = ctx.fileContent
      ? [ctx.fileContent, { type: 'text', text: message }]
      : message;

    const aiMessages = [systemMsg, ...historyMsgs, { role: 'user', content: userContent }];

    // Deduplicate consecutive same-role messages (safety guard, skip system)
    const cleaned = [systemMsg];
    for (const m of aiMessages.slice(1)) {
      if (cleaned[cleaned.length - 1].role !== m.role) {
        cleaned.push(m);
      } else if (typeof m.content === 'string' && typeof cleaned[cleaned.length - 1].content === 'string') {
        cleaned[cleaned.length - 1].content += '\n' + m.content;
      }
    }

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 1024,
      messages: cleaned
    });

    const reply = response.choices[0].message.content;
    db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)').run(req.user.id, 'assistant', reply);
    return res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    return res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Jivanu server running on http://localhost:${PORT}`);
});
