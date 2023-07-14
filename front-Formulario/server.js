const header = new Headers();
header.append('Content-Type', 'application/json'); 
const urlApi = 'http://localhost:3000/api'

 botaoEnviar = document.getElementById("enviar");


const services = {
    blacklist:async (parms)=> {
        const blackList = await fetch(`${urlApi}/blacklist`, {
            method:"POST",
            headers:header,
            body:JSON.stringify(parms)
        });
        return await blackList.json()    
    },
    coberturas:async (parms)=> {
        const coberturas = await fetch(`${urlApi}/coberturas`, {
            method:"GET",
            headers:header
        });
        return await coberturas.json()    
    },  
    cepRestritos:async (parms)=> {
        const cepRestritos = await fetch(`${urlApi}/cepRestritos`, {
            method:"POST",
            headers:header,
            body:JSON.stringify(parms)
        });
        return await cepRestritos.json()  
        
    },
    salvarCotacao:async (parms)=> {
        const salvarCotacoes = await fetch(`${urlApi}/salvarCotacoes`, {
            method:"POST",
            headers:header,
            body:JSON.stringify(parms)
        });
        return await salvarCotacoes.json()  
    }
    
};



