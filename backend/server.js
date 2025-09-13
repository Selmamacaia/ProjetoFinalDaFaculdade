const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

app.use(cors());
app.use(bodyParser.json());

// Rota de cadastro
app.post('/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    try {
        const hash = await bcrypt.hash(senha, 10);
        const query = `INSERT INTO professores (nome, email, senha) VALUES (?, ?, ?)`;
        db.run(query, [nome, email, hash], function(err) {
            if (err) {
                res.status(400).json({ message: 'Erro ao cadastrar: ' + err.message });
            } else {
                res.json({ message: 'Cadastro realizado com sucesso!', id: this.lastID });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota de login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }
    const query = `SELECT * FROM professores WHERE email = ?`;
    db.get(query, [email], async (err, row) => {
        if (err) {
            res.status(400).json({ message: 'Erro ao buscar usuário: ' + err.message });
        } else if (row) {
            const match = await bcrypt.compare(senha, row.senha);
            if (match) {
                res.json({ message: 'Login realizado com sucesso!', professor: row });
            } else {
                res.status(401).json({ message: 'Email ou senha incorretos.' });
            }
        } else {
            res.status(401).json({ message: 'Email ou senha incorretos.' });
        }
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
