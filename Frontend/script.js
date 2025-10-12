const API = 'http://localhost:3000';

async function postJson(path, data) {
    const res = await fetch(API + path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const text = await res.text();
    try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: text }; }
}

function mostrarMensagemId(id, txt, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = txt || '';
    el.className = isError ? 'err' : 'msg';
    setTimeout(() => { el.textContent = ''; }, 3000);
}

// Cadastro professor (cadastro_prof.html)
const formCadastroPage = document.getElementById('formCadastroPage');
if (formCadastroPage) {
    formCadastroPage.addEventListener('submit', async e => {
        e.preventDefault();
        const nome = document.getElementById('nomeProf').value;
        const email = document.getElementById('emailProf').value;
        const senha = document.getElementById('senhaProf').value;
        const r = await postJson('/cadastro', { nome, email, senha });
        if (r.status === 200) mostrarMensagemId('msgCadastroPage', r.body.message || 'Cadastrado');
        else mostrarMensagemId('msgCadastroPage', r.body.message || 'Erro', true);
        formCadastroPage.reset();
    });
}

// Login (login.html)
const formLoginPage = document.getElementById('formLoginPage') || document.getElementById('formLoginPage');
if (formLoginPage) {
    formLoginPage.addEventListener('submit', async e => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;
        const r = await postJson('/login', { email, senha });
        if (r.status === 200) {
            // armazenar token se existir e redirecionar ao dashboard
            try {
                if (r.body && r.body.token) localStorage.setItem('token', r.body.token);
                // fallback: se o backend retornou o objeto professor (sem token), guardamos também
                if (r.body && r.body.professor) localStorage.setItem('professor', JSON.stringify(r.body.professor));
            } catch (err) { console.warn('localStorage error', err) }
            mostrarMensagemId('msgLoginPage', r.body.message || 'Logado');
            setTimeout(() => { window.location.href = 'prof_dashboard.html'; }, 700);
        } else mostrarMensagemId('msgLoginPage', r.body.message || 'Erro', true);
    });
}

// Cadastro de aluno (cadastro_aluno.html)
const formCadastroAlunoPage = document.getElementById('formCadastroAlunoPage');
if (formCadastroAlunoPage) {
    formCadastroAlunoPage.addEventListener('submit', async e => {
        e.preventDefault();
        const nome = document.getElementById('nomeAluno').value;
        const matricula = document.getElementById('matriculaAluno').value;
        const turma = document.getElementById('turmaAluno').value;
        const r = await postJson('/alunos', { nome, matricula, turma });
        if (r.status === 201 || r.status === 200) {
            mostrarMensagemId('msgCadastroAlunoPage', 'Aluno cadastrado com sucesso');
            formCadastroAlunoPage.reset();
        } else mostrarMensagemId('msgCadastroAlunoPage', r.body.message || 'Erro', true);
    });
}

// Página original de lista de alunos (se existir)
async function carregarAlunos() {
    try {
        const res = await fetch(API + '/alunos');
        const lista = await res.json();
        const ul = document.getElementById('listaAlunos');
        if (!ul) return;
        ul.innerHTML = '';
        lista.forEach(a => {
            const li = document.createElement('li');
            li.textContent = `${a.nome} — Matrícula: ${a.matricula} — Turma: ${a.turma}`;
            ul.appendChild(li);
        });
    } catch (err) { const ul = document.getElementById('listaAlunos'); if (ul) ul.innerHTML = '<li>Erro ao carregar alunos</li>'; }
}

// carregar lista quando existir
if (document.getElementById('listaAlunos')) carregarAlunos();

/* ---------- Local (placeholder) storage handlers for new pages ---------- */
// Disciplinas
const formDisc = document.getElementById('formDisciplina');
if (formDisc) {
    const listaEl = document.getElementById('listaDisciplinas');
    function renderDisciplinas() {
        const arr = JSON.parse(localStorage.getItem('disciplinas') || '[]');
        listaEl.innerHTML = arr.map(d => `<li>${d.nome} ${d.codigo ? '- '+d.codigo : ''}</li>`).join('') || '<li>Nenhuma</li>';
    }
    renderDisciplinas();
    formDisc.addEventListener('submit', e => {
        e.preventDefault();
        const nome = document.getElementById('nomeDisc').value.trim();
        const codigo = document.getElementById('codigoDisc').value.trim();
        if (!nome) { mostrarMensagemId('msgDisc', 'Informe o nome', true); return; }
        const arr = JSON.parse(localStorage.getItem('disciplinas') || '[]');
        arr.push({ nome, codigo });
        localStorage.setItem('disciplinas', JSON.stringify(arr));
        mostrarMensagemId('msgDisc', 'Salvo');
        formDisc.reset();
        renderDisciplinas();
    });
}

// Notas
const formNota = document.getElementById('formNota');
if (formNota) {
    const listaEl = document.getElementById('listaNotas');
    function renderNotas() {
        const arr = JSON.parse(localStorage.getItem('notas') || '[]');
        listaEl.innerHTML = arr.map(n => `<li>${n.aluno} — ${n.disciplina} — ${n.nota}</li>`).join('') || '<li>Nenhuma</li>';
    }
    renderNotas();
    formNota.addEventListener('submit', e => {
        e.preventDefault();
        const aluno = document.getElementById('alunoNota').value.trim();
        const disciplina = document.getElementById('discNota').value.trim();
        const nota = document.getElementById('valorNota').value;
        if (!aluno || !disciplina || nota === '') { mostrarMensagemId('msgNota', 'Preencha todos os campos', true); return; }
        const arr = JSON.parse(localStorage.getItem('notas') || '[]');
        arr.push({ aluno, disciplina, nota });
        localStorage.setItem('notas', JSON.stringify(arr));
        mostrarMensagemId('msgNota', 'Nota registrada');
        formNota.reset();
        renderNotas();
    });
}

// Frequência
const formFreq = document.getElementById('formFrequencia');
if (formFreq) {
    const listaEl = document.getElementById('listaFrequencias');
    function renderFreq() {
        const arr = JSON.parse(localStorage.getItem('frequencias') || '[]');
        listaEl.innerHTML = arr.map(f => `<li>${f.aluno} — ${f.disciplina} — ${f.presente}</li>`).join('') || '<li>Nenhuma</li>';
    }
    renderFreq();
    formFreq.addEventListener('submit', e => {
        e.preventDefault();
        const aluno = document.getElementById('alunoFreq').value.trim();
        const disciplina = document.getElementById('discFreq').value.trim();
        const presente = document.getElementById('presenteFreq').value;
        if (!aluno || !disciplina) { mostrarMensagemId('msgFreq', 'Preencha todos os campos', true); return; }
        const arr = JSON.parse(localStorage.getItem('frequencias') || '[]');
        arr.push({ aluno, disciplina, presente });
        localStorage.setItem('frequencias', JSON.stringify(arr));
        mostrarMensagemId('msgFreq', 'Frequência registrada');
        formFreq.reset();
        renderFreq();
    });
}

