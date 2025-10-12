// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// log simples de requisições (ajuda debug)
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Conexão com MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projetofaculdade';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Conectado ao MongoDB:', MONGO_URI))
  .catch(err => {
    console.error('Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  });

/* ----- MODELS ----- */
// Professor
const professorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }
}, { timestamps: true });
const Professor = mongoose.model('Professor', professorSchema);

// Aluno
const alunoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  turma: { type: String, required: true }
}, { timestamps: true });
const Aluno = mongoose.model('Aluno', alunoSchema);

/* ----- ROTAS ----- */
// Rota teste
app.get('/', (req, res) => res.send('API do Projeto Faculdade - OK'));

// Cadastro de professor
app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    const exists = await Professor.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email já cadastrado.' });
    const hash = await bcrypt.hash(senha, 10);
    const prof = new Professor({ nome, email, senha: hash });
    await prof.save();
    return res.json({ message: 'Cadastro realizado com sucesso!', professor: { id: prof._id, nome: prof.nome, email: prof.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor: ' + err.message });
  }
});

// Login de professor
app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    const prof = await Professor.findOne({ email });
    if (!prof) return res.status(401).json({ message: 'Email ou senha incorretos.' });
    const ok = await bcrypt.compare(senha, prof.senha);
    if (!ok) return res.status(401).json({ message: 'Email ou senha incorretos.' });
    const { senha: s, ...profPublic } = prof.toObject();
    // sign a JWT and return it together with professor public data
    const token = jwt.sign({ id: prof._id, role: 'professor' }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ message: 'Login realizado com sucesso!', token, professor: profPublic });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor: ' + err.message });
  }
});

/* ----- Endpoints para Alunos (AC1) ----- */
// Criar aluno
app.post('/alunos', async (req, res) => {
  try {
    const { nome, matricula, turma } = req.body;
    if (!nome || !matricula || !turma) return res.status(400).json({ message: 'nome, matricula e turma obrigatórios.' });
    const exists = await Aluno.findOne({ matricula });
    if (exists) return res.status(400).json({ message: 'Matrícula já cadastrada.' });
    const aluno = new Aluno({ nome, matricula, turma });
    await aluno.save();
    return res.status(201).json(aluno);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

// Listar alunos
app.get('/alunos', async (req, res) => {
  try {
    const alunos = await Aluno.find().sort({ createdAt: -1 });
    return res.json(alunos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

/* ----- INICIAR SERVIDOR ----- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
