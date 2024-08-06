
let UUID = "dac76448-51cc-4583-90f5-3e5c84d49b2d";
let stop = false;
let enterName = "";
let users = [];
let message = [];
let names = [];
let selectedRecipient = "Todos";
let selectedType = "message";
let selectedParticipantName = "";


function showMenu() {
    let visibilityActived = document.querySelector(".menu");
    visibilityActived.classList.remove("invisibility");
}
function closeMenu() {
    let visibilityDisable = document.querySelector(".menu");
    visibilityDisable.classList.add("invisibility");
}

function enterClass() {
    function promptForName() {
        enterName = prompt("Digite o seu nome: ");
        let newPerson = { name: enterName };
        console.log("Adicionou newPerson: ", newPerson);

        axios.post(`https://mock-api.driven.com.br/api/v6/uol/participants/${UUID}`, newPerson)
            .then(response => {
                console.log("Requisição bem-sucedida:", response);
                console.log("Entrou na sala com sucesso!");
                setInterval(checkStatus, 5000);
                getParticipants();
                setInterval(getParticipants, 10000);
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    alert("Esse nome já existe, digite outro nome!");
                    promptForName();
                } else {
                    console.error("Erro na requisição:", error);
                }
            });
    }

    promptForName(); 
}

function checkStatus() {
    responsed = axios.post(`https://mock-api.driven.com.br/api/v6/uol/status/${UUID}`, { name: enterName })
    responsed.then(response => {
        console.log("Status verificado com sucesso:", response);
    })
    responsed.catch(error => {
        console.error("Erro na verificação de status:", error);
    });
}

function getMessage() {
    responsed = axios.get(`https://mock-api.driven.com.br/api/v6/uol/messages/${UUID}`)
    responsed.then(response => {

        message = response.data;
        renderUser();

    })
    responsed.catch(error => {
        console.error("Erro ao buscar mensagens:", error);
    });
}

function getParticipants() {
    responsed = axios.get(`https://mock-api.driven.com.br/api/v6/uol/participants/${UUID}`)
    responsed.then(response => {
        console.log("Participantes:", response.data);
        names = response.data;
        renderNames();
    })
    responsed.catch(error => {
        console.error("Erro ao buscar participantes:", error);
    });
}

function renderUser() {
    const ulPeople = document.querySelector(".peoples");
    ulPeople.innerHTML = "";
    for (let i = 0; i < message.length; i++) {
        
        
        let className = "";
        let messageColor = "";
        if (message[i].type === "private_message" && message[i].to !== enterName && message[i].from !== enterName) {
            continue;
        }
        if (message[i].type === "private_message") {
            className = "private";
        
        } else if(message[i].type==="status") {
            className = "status";
        
        }else if(message[i].type==="message"){
            className = "public";
        }

        ulPeople.innerHTML += `
      <div class="people ${className} ">
                <span class="time">(${message[i].time})</span> <span class="from">${message[i].from}</span> para <span class="to">${message[i].to}</span> : <span class="text">${message[i].text}</span>
      </div>`;
    }
    ulPeople.scrollIntoView();
}

function renderNames() {
    const ulNames = document.querySelector(".menu-people-names");
    ulNames.innerHTML = "";
    let participantVisible = "";
    for (let i = 0; i < names.length; i++) {
        if (selectedParticipantName === names[i].name) {
            participantVisible = "";
        } else { participantVisible = "invisibility" }
        if (names[i].name != enterName) {
            ulNames.innerHTML += `
                <div class="menu-people" onclick="selectParticipant('${names[i].name}')">
                    <ion-icon name="person-circle" class="img-people-cicle"></ion-icon>
                    <span class="text-menu-name">${names[i].name}</span>
                    <img src="IMG/check.jpg" class="check ${participantVisible}">
                </div>`;
        }
    }
}

function selectParticipant(name) {
    selectedRecipient = name;
    selectedParticipantName = name;
    messageType = "message"; 

    const checks = document.querySelectorAll(".check");
    checks.forEach(check => check.classList.add("invisibility"));

    const participantChecks = document.querySelectorAll(".menu-people");
    participantChecks.forEach(participant => {
        if (participant.querySelector(".text-menu-name").innerText === name) {
            participant.querySelector(".check").classList.remove("invisibility");
        }
    });

    document.querySelector(".menu-public .check").classList.remove("invisibility");
    document.querySelector("p").innerText = `Enviando para ${name} (público)`;
}

function selectReserved() {

    if (selectedRecipient === "Todos") return;

    selectedType = "private_message";

    const checkPublic = document.querySelector(".menu-public .check");
    const checkReserved = document.querySelector(".menu-reserved .check");

    checkReserved.classList.remove("invisibility");

    checkPublic.classList.add("invisibility");

    if (selectedRecipient !== "Todos") {
        document.querySelector("p").innerText = `Enviando para ${selectedRecipient} (reservadamente)`;
    }
}

function selectTodos() {
    selectedRecipient = "Todos";
    selectedParticipantName = "";
    selectedType = "message";

    const checkTodos = document.querySelector(".menu-todos .check");
    const checkPublic = document.querySelector(".menu-public .check");
    const checks = document.querySelectorAll(".menu-people .check, .menu-reserved .check");

    checkTodos.classList.remove("invisibility");
    checkPublic.classList.remove("invisibility");
    checks.forEach(check => check.classList.add("invisibility"));

    document.querySelector("p").innerText = "Enviando para Todos (público)";
}

function sendMessage() {
    let messageText = document.querySelector(".textoDigitado").value;

    if (!messageText.trim()) return;
    let message = {
        from: enterName,
        to: selectedRecipient,
        text: messageText,
        type: selectedType
    };
    console.log("Mensagem enviada" + message.data);

    axios.post(`https://mock-api.driven.com.br/api/v6/uol/messages/${UUID}`, message)
        .then(response => {
            console.log("Mensagem enviada com sucesso:", response);
            getMessage();
        })
        .catch(error => {
            console.error("Erro ao enviar mensagem:", error);
            if (error.response && error.response.status === 400) {
                alert("Erro ao enviar mensagem. Você não está mais na sala.");
                location.reload();
            }
        });

    document.querySelector("#textoDigitado").value = "";
}



enterClass();
getParticipants();
getMessage();
setInterval(getMessage, 3000);
