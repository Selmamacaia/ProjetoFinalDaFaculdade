// Script opcional para criar um professor de teste
// Uso: node seedProfessor.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/projetofaculdade';

const professorSchema = new mongoose.Schema({
    nome: String,
    email: String,
    senha: String
});
const Professor = mongoose.model('Professor', professorSchema);

async function run() {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const exists = await Professor.findOne({ email: 'professor@exemplo.com' });
    if (exists) {
        console.log('Professor já existe:', exists.email);
        process.exit(0);
    }
    const hashed = await bcrypt.hash('123456', 10);
    const prof = new Professor({ nome: 'Professor Exemplo', email: 'professor@exemplo.com', senha: hashed });
    await prof.save();
    console.log('Professor criado: professor@exemplo.com / senha: 123456');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
