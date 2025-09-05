// script.js

// Mostrar/ocultar a seção de itens conforme o status selecionado
document.getElementById('status').addEventListener('change', function () {
  const status = this.value;
  const devolucaoItens = document.getElementById('devolucao-itens');

  if (status === 'aguardando_devolucao' || status === 'devolvido') {
    devolucaoItens.style.display = 'block';
  } else {
    devolucaoItens.style.display = 'none';

    // Desmarcar checkboxes e ocultar inputs de patrimônio
    ['monitor', 'notebook', 'telefone'].forEach(id => {
      const checkbox = document.getElementById(id);
      const input = document.getElementById('patrimonio-' + id);
      checkbox.checked = false;
      input.style.display = 'none';
      input.value = '';
    });
  }
});

// Mostrar/ocultar inputs de patrimônio ao marcar os checkboxes
['monitor', 'notebook', 'telefone'].forEach(id => {
  document.getElementById(id).addEventListener('change', function () {
    const input = document.getElementById('patrimonio-' + id);
    input.style.display = this.checked ? 'inline-block' : 'none';
    if (!this.checked) input.value = '';
  });
});

// Forçar somente números nos inputs de patrimônio e telefone
function somenteNumeros(e) {
  e.target.value = e.target.value.replace(/\D/g, '');
}

['patrimonio-monitor', 'patrimonio-notebook', 'patrimonio-telefone'].forEach(id => {
  document.getElementById(id).addEventListener('input', somenteNumeros);
});

// Função para validar campos antes de enviar
function validarCampos() {
  const contrato = document.getElementById('contrato').value;
  if (contrato.length !== 3) {
    alert('Número de contrato deve ter exatamente 3 caracteres.');
    return false;
  }

  // Patrimônio deve ter 4 dígitos se preenchido (monitor e notebook)
  ['patrimonio-monitor', 'patrimonio-notebook'].forEach(id => {
    const val = document.getElementById(id).value;
    if (val && val.length !== 4) {
      alert('O patrimônio do ' + id.replace('patrimonio-', '') + ' deve ter exatamente 4 dígitos.');
      throw new Error('Validação falhou');
    }
  });

  // Telefone pode ter no máximo 11 dígitos se preenchido
  const telefoneVal = document.getElementById('patrimonio-telefone').value;
  if (telefoneVal && telefoneVal.length > 11) {
    alert('O telefone deve ter no máximo 11 dígitos.');
    return false;
  }

  return true;
}

// Evento submit do formulário
document.getElementById('devolucao-form').addEventListener('submit', function (e) {
  e.preventDefault();

  try {
    if (!validarCampos()) return;
  } catch {
    return; // Sai se a validação disparou erro
  }

  const nome = document.getElementById('nome').value;
  const contrato = document.getElementById('contrato').value;
  const dataEmail = document.getElementById('data-email').value;
  const dataLimite = document.getElementById('data-limite').value;
  const status = document.getElementById('status').value;

  // Montar array de itens selecionados
  const itensSelecionados = [];
  ['monitor', 'notebook', 'telefone'].forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox.checked) {
      itensSelecionados.push({
        item: checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1), // Capitaliza a primeira letra
        patrimonio: document.getElementById('patrimonio-' + id).value
      });
    }
  });

  const dadosParaEnvio = {
    nome: nome,
    contrato: contrato,
    dataEmail: dataEmail,
    dataLimite: dataLimite,
    status: status,
    itens: itensSelecionados
  };

  console.log('Dados para envio:', dadosParaEnvio);

  const urlPowerAutomate = 'https://seu-fluxo-powerautomate-url.com/api/endpoint'; // substitua pela sua URL

  fetch(urlPowerAutomate, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosParaEnvio)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro no envio: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      alert('Formulário enviado com sucesso!');
      // Resetar formulário
      this.reset();
      document.getElementById('devolucao-itens').style.display = 'none';
      ['monitor', 'notebook', 'telefone'].forEach(id => {
        document.getElementById('patrimonio-' + id).style.display = 'none';
      });
    })
    .catch(error => {
      alert('Falha ao enviar o formulário: ' + error.message);
    });
});
