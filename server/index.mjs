import express from 'express';
import cors from 'cors';
import db from './db.mjs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Admin / Auth ----------

// cria admin default se não existir
function ensureDefaultAdmin() {
  const row = db.prepare('SELECT COUNT(*) as c FROM admin_credentials').get();
  if (row.c === 0) {
    const id = uuidv4();
    const username = 'admin';
    const password = 'admin123'; // troque depois
    const password_hash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO admin_credentials (id, username, password_hash, is_master, active)
      VALUES (?, ?, ?, 1, 1)
    `).run(id, username, password_hash);
    console.log('Admin padrão criado: usuário=admin, senha=admin123');
  }
}
ensureDefaultAdmin();

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Usuário e senha são obrigatórios' });
  }

  const admin = db
    .prepare('SELECT * FROM admin_credentials WHERE username = ? AND active = 1')
    .get(username);

  if (!admin) {
    return res
      .status(401)
      .json({ success: false, message: 'Usuário ou senha inválidos' });
  }

  const ok = bcrypt.compareSync(password, admin.password_hash);
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, message: 'Usuário ou senha inválidos' });
  }

  db.prepare("UPDATE admin_credentials SET last_login = datetime('now') WHERE id = ?")
    .run(admin.id);

  res.json({
    success: true,
    admin: {
      id: admin.id,
      username: admin.username,
      is_master: !!admin.is_master,
    },
  });
});

// ---------- Solicitacoes CRUD ----------

app.get('/api/solicitacoes', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM solicitacoes ORDER BY created_at DESC')
    .all();
  res.json(rows);
});

app.post('/api/solicitacoes', (req, res) => {
  const s = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO solicitacoes (
      id, protocolo, secretaria, setor, funcao, nome, endereco, descricao,
      data_registro, prazo, status, responsavel, local_atendimento,
      nivel, locked, ip_address, device_info, geolocation,
      created_at, updated_at, user_id, data_agendamento
    ) VALUES (
      @id, @protocolo, @secretaria, @setor, @funcao, @nome, @endereco, @descricao,
      @data_registro, @prazo, @status, @responsavel, @local_atendimento,
      @nivel, @locked, @ip_address, @device_info, @geolocation,
      @created_at, @updated_at, @user_id, @data_agendamento
    )
  `
  ).run({
    id,
    protocolo: s.protocolo,
    secretaria: s.secretaria,
    setor: s.setor ?? null,
    funcao: s.funcao,
    nome: s.nome,
    endereco: s.endereco,
    descricao: s.descricao,
    data_registro: s.data_registro ?? now,
    prazo: s.prazo,
    status: s.status ?? 'Aguardando',
    responsavel: s.responsavel ?? null,
    local_atendimento: s.local_atendimento ?? null,
    nivel: s.nivel ?? null,
    locked: s.locked ? 1 : 0,
    ip_address: s.ip_address ?? null,
    device_info: s.device_info ? JSON.stringify(s.device_info) : null,
    geolocation: s.geolocation ? JSON.stringify(s.geolocation) : null,
    created_at: now,
    updated_at: now,
    user_id: s.user_id ?? null,
    data_agendamento: s.data_agendamento ?? null,
  });

  const created = db.prepare('SELECT * FROM solicitacoes WHERE id = ?').get(id);
  res.status(201).json(created);
});

app.put('/api/solicitacoes/:id', (req, res) => {
  const { id } = req.params;
  const s = req.body;
  const now = new Date().toISOString();

  const existing = db
    .prepare('SELECT * FROM solicitacoes WHERE id = ?')
    .get(id);
  if (!existing)
    return res.status(404).json({ message: 'Solicitação não encontrada' });

  db.prepare(
    `
    UPDATE solicitacoes SET
      protocolo = @protocolo,
      secretaria = @secretaria,
      setor = @setor,
      funcao = @funcao,
      nome = @nome,
      endereco = @endereco,
      descricao = @descricao,
      data_registro = @data_registro,
      prazo = @prazo,
      status = @status,
      responsavel = @responsavel,
      local_atendimento = @local_atendimento,
      nivel = @nivel,
      locked = @locked,
      ip_address = @ip_address,
      device_info = @device_info,
      geolocation = @geolocation,
      updated_at = @updated_at,
      user_id = @user_id,
      data_agendamento = @data_agendamento
    WHERE id = @id
  `
  ).run({
    id,
    protocolo: s.protocolo ?? existing.protocolo,
    secretaria: s.secretaria ?? existing.secretaria,
    setor: s.setor ?? existing.setor,
    funcao: s.funcao ?? existing.funcao,
    nome: s.nome ?? existing.nome,
    endereco: s.endereco ?? existing.endereco,
    descricao: s.descricao ?? existing.descricao,
    data_registro: s.data_registro ?? existing.data_registro,
    prazo: s.prazo ?? existing.prazo,
    status: s.status ?? existing.status,
    responsavel: s.responsavel ?? existing.responsavel,
    local_atendimento: s.local_atendimento ?? existing.local_atendimento,
    nivel: s.nivel ?? existing.nivel,
    locked:
      s.locked != null ? (s.locked ? 1 : 0) : existing.locked,
    ip_address: s.ip_address ?? existing.ip_address,
    device_info: s.device_info
      ? JSON.stringify(s.device_info)
      : existing.device_info,
    geolocation: s.geolocation
      ? JSON.stringify(s.geolocation)
      : existing.geolocation,
    updated_at: now,
    user_id: s.user_id ?? existing.user_id,
    data_agendamento: s.data_agendamento ?? existing.data_agendamento,
  });

  const updated = db.prepare('SELECT * FROM solicitacoes WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/solicitacoes/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM chat_messages WHERE solicitacao_id = ?').run(id);
  const info = db.prepare('DELETE FROM solicitacoes WHERE id = ?').run(id);
  if (info.changes === 0)
    return res.status(404).json({ message: 'Solicitação não encontrada' });
  res.json({ success: true });
});

// ---------- Chat das solicitações ----------

app.get('/api/solicitacoes/:id/chat', (req, res) => {
  const { id } = req.params;
  const rows = db
    .prepare(
      'SELECT * FROM chat_messages WHERE solicitacao_id = ? ORDER BY datetime(timestamp)'
    )
    .all(id);
  res.json(rows);
});

app.post('/api/solicitacoes/:id/chat', (req, res) => {
  const { id } = req.params;
  const { sender_id, sender_type, message } = req.body;
  const msgId = uuidv4();
  const timestamp = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO chat_messages (id, solicitacao_id, sender_id, sender_type, message, timestamp, read)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `
  ).run(msgId, id, sender_id, sender_type, message, timestamp);

  const created = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(msgId);
  res.status(201).json(created);
});

// ---------- Chat de suporte (suporte geral) ----------

app.get('/api/support/chats', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM support_chats ORDER BY created_at DESC')
    .all();
  res.json(rows);
});

app.post('/api/support/chats', (req, res) => {
  const { session_id, cpf, name, phone } = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();

  // Garante sempre um session_id (evita NOT NULL constraint failed)
  const sessId = session_id || uuidv4();

  db.prepare(
    `
    INSERT INTO support_chats (id, session_id, cpf, name, phone, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'open', ?)
  `
  ).run(id, sessId, cpf, name, phone, now);

  const created = db.prepare('SELECT * FROM support_chats WHERE id = ?').get(id);
  res.status(201).json(created);
});

app.post('/api/support/chats/:id/close', (req, res) => {
  const { id } = req.params;
  const now = new Date().toISOString();
  db.prepare(
    `
    UPDATE support_chats SET status = 'closed', updated_at = ? WHERE id = ?
  `
  ).run(now, id);
  const updated = db.prepare('SELECT * FROM support_chats WHERE id = ?').get(id);
  res.json(updated);
});

app.get('/api/support/chats/:id/messages', (req, res) => {
  const { id } = req.params;
  const rows = db
    .prepare(
      'SELECT * FROM support_chat_messages WHERE chat_id = ? ORDER BY datetime(timestamp)'
    )
    .all(id);
  res.json(rows);
});

app.post('/api/support/chats/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const { sender_type, message } = req.body;

    if (!sender_type || !message) {
      return res.status(400).json({ error: 'Remetente e mensagem são obrigatórios.' });
    }

    // verifica se o chat existe e se está aberto
    const chat = db.prepare('SELECT * FROM support_chats WHERE id = ?').get(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado.' });
    }

    if (chat.status !== 'open') {
      // 🔒 bloqueia mensagens se o chat estiver encerrado
      return res.status(400).json({ error: 'Chat encerrado. Não é possível enviar novas mensagens.' });
    }

    const msgId = uuidv4();
    const timestamp = new Date().toISOString();

    db.prepare(`
      INSERT INTO support_chat_messages (id, chat_id, sender_type, message, timestamp, read)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(msgId, id, sender_type, message, timestamp);

    const created = db
      .prepare('SELECT * FROM support_chat_messages WHERE id = ?')
      .get(msgId);

    res.status(201).json(created);
  } catch (err) {
    console.error('Erro ao enviar mensagem de suporte:', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem de suporte' });
  }
});


// ---------- Servir build da aplicação (produção) ----------

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// ---------- Start server ----------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API local rodando em http://localhost:${PORT}`);
});
