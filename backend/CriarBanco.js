console.log('ATENÇÃO: Antes de rodar este script, exclua o arquivo database.db da pasta backend para garantir que a tabela será criada corretamente.');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.db');
console.log('Caminho do banco:', dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir/criar o banco:', err.message);
        process.exit(1);
    } else {
        console.log('Banco aberto/criado com sucesso!');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error("Erro ao criar tabela:", err.message);
            process.exit(1);
        } else {
            console.log("Tabela de professores criada com sucesso!");
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Erro ao fechar o banco:', err.message);
    } else {
        console.log('Banco fechado com sucesso!');
    }
});
