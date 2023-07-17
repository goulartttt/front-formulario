//importações dos id do html
const nome = document.getElementById("nome");
const cpf = document.querySelector("#cpf");
let inicioVigencia = document.getElementById("inicio_vigencia");
let fimVigencia = document.getElementById("fim_vigencia");
let diasVigencia = document.getElementById("dias_vigencia");
const cep = document.getElementById("cep");
const estado = document.getElementById("estado");
const cidade = document.getElementById("cidade");
const logradouro = document.getElementById("logradouro");
const bairro = document.getElementById("bairro");
const complemento = document.getElementById("complemento");
const numero = document.getElementById("numero");
const botaoEnviar = document.getElementById("enviar");
const selectCoberturas = document.getElementById("cobertura");
const valorPremio = document.getElementById("valor_premio")
let coberturas = [];

//nome
function nomeMaiusculo() {
  var x = nome;
  x.value = x.value.toUpperCase();
}
//cpf recusado

let cpfRecusado = []

cpf.addEventListener('change', verificaCPF)

function verificaCPF() {
  if (cpfRecusado.includes(this.value)) alert('CPF Recusado')
}

async function  blacklist(){
    try{
        const resp = await services.blacklist({cpf: cpf.value.replace(/\D/g, '')})
       if (!resp.success ) {
        alert('Risco recusado')
        botaoEnviar.disabled = true;
       }
    }catch(erro){
        alert('Risco recusado')
    }
}

// areas das datas

//Inicio da Vigencia
var hoje = new Date().setHours(-1),
   InicioDaVigencia, FimDaVigencia;

    inicioVigencia.onblur = function () {
      InicioDaVigencia = new Date(inicioVigencia.value.split('/').reverse().join('-')).setHours(24);
       if (InicioDaVigencia < hoje) {
           alert("Atenção, coloque uma data superior ao dia de hoje");
           inicioVigencia.value = ""
       } 
    }

//Fim da Vigencia, Dias de Vigencia
function diferencaDeDias(data1, data2){
    data1 = new Date(data1);
    data2 = new Date(data2);
    const diferencaDeTempo = Math.abs(data2 - data1);
    const diferencaDeDias = Math.ceil(diferencaDeTempo / (1000 * 60 * 60 * 24)); 

    return diferencaDeDias;
}

let diaAtual = new Date()

let ano = diaAtual.getFullYear()

fimVigencia.onblur = function(){
    let anoInserido = new Date(fimVigencia.value).getFullYear()  
    if (anoInserido <= ano) {
        alert("Atenção, coloque uma data supere 1 ano");
        inicioVigencia.value = ""
        fimVigencia.value = ""
    } 
    let diaCalculado = diferencaDeDias(inicioVigencia.value, fimVigencia.value)
    diasVigencia.value = diaCalculado; 
}

//cep e etc


function limpa_formulário_cep() {
    //Limpa valores do formulário de cep.
    document.getElementById('logradouro').value=("");
    document.getElementById('bairro').value=("");
    document.getElementById('cidade').value=("");
    document.getElementById('estado').value=("");
}

function meu_callback(conteudo) {
    if (!("erro" in conteudo)) {
        //Atualiza os campos com os valores.
        document.getElementById('logradouro').value=(conteudo.logradouro);
        document.getElementById('bairro').value=(conteudo.bairro);
        document.getElementById('cidade').value=(conteudo.localidade);
        document.getElementById('estado').value=(conteudo.uf);
    } //end if.
    else {
        //CEP não Encontrado.
        limpa_formulário_cep();
        alert("CEP não encontrado.");
    }
}

async function cepRestritos(valor){
    try{
        if (!/^[0-9]{8}$/.test(valor.replace(/\D/g, '')) ) return alert("CEP invalido");

        const resp = await services.cepRestritos({cep: valor})
        if (resp.success) {
        alert('Risco recusado')
        botaoEnviar.disabled = true;
        return;
       }else{  
            limpa_formulário_cep();

            //Nova variável "cep" somente com dígitos.
            var cep = valor.replace(/\D/g, '');

            //Verifica se campo cep possui valor informado.
            if (cep != "") {

                //Expressão regular para validar o CEP.
                var validacep = /^[0-9]{8}$/;

                //Valida o formato do CEP.
                if(validacep.test(cep)) {

                    //Preenche os campos com "..." enquanto consulta webservice.
                    document.getElementById('logradouro').value="...";
                    document.getElementById('bairro').value="...";
                    document.getElementById('cidade').value="...";
                    document.getElementById('estado').value="...";

                    //Cria um elemento javascript.
                    var script = document.createElement('script');

                    //Sincroniza com o callback.
                    script.src = 'https://viacep.com.br/ws/'+ cep + '/json/?callback=meu_callback';

                    //Insere script no documento e carrega o conteúdo.
                    document.body.appendChild(script);

                } //end if.
                else {
                    //cep é inválido.
                    limpa_formulário_cep();
                    alert("Formato de CEP inválido.");
                }
            } //end if.
            else {
                //cep sem valor, limpa formulário.
                limpa_formulário_cep();
            }
        }
    }catch(erro){
      console.log(erro)
    }
}


 // Valor de Premio
(async function(){
    const resp = await services.coberturas()
    resp.coberturas.forEach(cob =>{
        selectCoberturas.innerHTML += `<option value="${cob.nome}">${cob.nome}</option>`
    })
    coberturas = resp.coberturas
})();

function liberaValorPremio() {
    if (selectCoberturas.value !== "" || null ) {
        valorPremio.disabled = false
    }else{
        valorPremio.disabled = true
    }
    
}

let coberturaSelecionada = null


function escolhaCobertura() {
    let idCobertura = document.getElementById("cobertura");
    coberturaSelecionada = coberturas.find(cobertura => cobertura.nome == idCobertura.value);
  }

  function verificaPremio(){
    let valorPremio = document.getElementById("valor_premio")
    if (valorPremio.value < coberturaSelecionada.valorMin ) {
        alert("O valor não pode ser inferior a R$" + coberturaSelecionada.valorMin)
        valorPremio.value = ""
    }
    if (valorPremio.value > coberturaSelecionada.valorMax) {
        alert(" O valor não pode ser superior a " + coberturaSelecionada.valorMax)
        valorPremio.value = ""
    }
  }

  //salvar cotação

 botaoEnviar.addEventListener("click", salvarCotacao)
 
 async function salvarCotacao() {
    try {
        if (!nome.value || !cpf.value || !cep.value || !estado.value ||
             !cidade.value || !logradouro.value || !bairro.value ||!numero.value ||
              !selectCoberturas.value || !valorPremio.value || !inicioVigencia.value ||
               !fimVigencia.value) {
            return alert("Preencha os campos obrigatorios")
        }
        const parms = {
            nome: nome.value,
            cpf: cpf.value,
            endereco:{
                cep: cep.value,
                estado: estado.value,
                cidade: cidade.value,
                logradouro: logradouro.value,
                bairro: bairro.value,
                complemento:complemento.value,
                numero: numero.value
            },
            coberturas: selectCoberturas.value,
            valorPremio: valorPremio.value,
            inicioVigencia: inicioVigencia.value,
            fimVigencia: fimVigencia.value
        }
        const resp = await services.salvarCotacao(parms);
        if (resp.success) {
            alert("Cotação salva com sucesso")
            limpaFormulario()
        } else {
           alert("Erro ao salvar cotação") 
        }

    } catch (error) {
        console.log(error)
    }
    
  }

//limpa formulario

function limpaFormulario() {
    nome.value = null,
    cpf.value = null,
    cep.value = null,
    estado.value = null,
    cidade.value = null,
    logradouro.value = null,
    bairro.value = null,
    complemento.value = null,
    numero.value
    selectCoberturas.value = null,
    valorPremio.value = null,
    inicioVigencia.value = null,
    fimVigencia.value = null
}
