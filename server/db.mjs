import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'feijo-desk.db');

// garante arquivo
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Tabelas equivalentes às do Supabase (resumidas)
const migrations = `
CREATE TABLE IF NOT EXISTS admin_credentials (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  is_master INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS solicitacoes (
  id TEXT PRIMARY KEY,
  protocolo TEXT NOT NULL,
  secretaria TEXT NOT NULL,
  setor TEXT,
  funcao TEXT NOT NULL,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_registro TEXT NOT NULL,
  prazo TEXT NOT NULL,
  status TEXT NOT NULL,
  responsavel TEXT,
  local_atendimento TEXT,
  nivel TEXT,
  locked INTEGER DEFAULT 0,
  ip_address TEXT,
  device_info TEXT,
  geolocation TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  user_id TEXT,
  data_agendamento TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  solicitacao_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id)
);

CREATE TABLE IF NOT EXISTS support_chats (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  cpf TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT,
  ip_address TEXT,
  device_info TEXT,
  geolocation TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS support_chat_messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT,
  read INTEGER,
  FOREIGN KEY (chat_id) REFERENCES support_chats(id)
);
`;

db.exec(migrations);

export default db;