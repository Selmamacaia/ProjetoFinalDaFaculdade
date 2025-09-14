
async function cadastrar() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const res = await fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();
    const mensagem = document.getElementById('mensagem');
    mensagem.innerText = data.message;

    
    setTimeout(() => {
        mensagem.innerText = '';
    }, 3000);
}

async function logar() {
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    const data = await res.json();
    const mensagem = document.getElementById('mensagem');
    mensagem.innerText = data.message;

    
    setTimeout(() => {
        mensagem.innerText = '';
    }, 3000);
}
