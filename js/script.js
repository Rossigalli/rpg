function toggleSidebar(){
    let sidebar = document.getElementById("Sidebar")
    sidebar.classList.toggle('active')
    console.log('a')
}

class PlayerManager {
    constructor() {
        this.players = JSON.parse(localStorage.getItem("players")) || [];
        this.populateDefault()

        this.sidebar = document.getElementById("Sidebar");
        this.main = document.getElementById("Main");
        this.renderPlayers();
    }

    populateDefault(){
        this.players.forEach((player, index) => {
            player.vida = player.vida || 0
            player.manab = Number(player.manab) || 0
            player.mana = player.mana || 0
            player.name = player.name || ''
            player.clan = player.clan || ""
            player.caminho = player.caminho || ""
            player.ataque = player.ataque || 0
            player.defesa = player.defesa || 0
            player.arma = player.arma || ""
            player.armadura = player.armadura || ""
            player.forca = player.forca || 0
            player.destreza = player.destreza || 0
            player.resistencia = player.resistencia || 0
            player.resiliencia = player.resiliencia || 0
            player.precisao = player.precisao || 0
            player.sabedoria = player.sabedoria || 0
            player.percepcao = player.percepcao || 0
            player.passivas = player.passivas || []
            player.tecnicas = player.tecnicas || []
            player.statusen = player.statusen || 0
        })

    }

    savePlayers() {
        localStorage.setItem("players", JSON.stringify(this.players));
    }

    addPlayer() {
        const name = `Jogador ${this.players.length + 1}`;
        const player = {
            vida: 100,
            manab: 100,
            mana: 0,
            name,
            clan: "Clan Desconhecido",
            caminho: "Caminho Desconhecido",
            ataque: 10,
            defesa: 5,
            arma: "",
            armadura: "",
            forca: 10,
            destreza: 10,
            resistencia: 10,
            resiliencia: 10,
            precisao: 10,
            sabedoria: 10,
            percepcao: 10,
            statusen: 0,
            passivas: [],
            tecnicas: []
        };
        this.players.push(player);
        this.savePlayers();
        this.renderPlayers();
    }

    updatePlayerName(index, newName) {
        this.players[index].name = newName;
        if(this.currentPlayerActive == index){
            this.showPlayerDetails(index)
        }
        this.savePlayers();
    }

    deletePlayer(index) {
        const confirmation = confirm(`Tem certeza que deseja deletar o jogador ${this.players[index].name}?`);
        if (confirmation) {
            this.players.splice(index, 1);
            this.currentPlayerActive = null
            
            this.savePlayers();
            this.renderPlayers();
            this.hiddePlayerDetails()
        }
    }

    updateStat(index, stat, expression) {
        try {
            if(expression.charAt(0) == '='){
                this.players[index][stat] = Number(expression.substr(1))
            }else{
                this.players[index][stat] = eval(`${this.players[index][stat]}${expression}`);
            }

            this.savePlayers();
            this.renderPlayers();

            if(this.currentPlayerActive == index){
                this.showPlayerDetails(index)
            }
        } catch (error) {
            console.error("Erro ao calcular expressão", error);
        }
    }

    updateSheetStat(index, stat, value) {
        this.players[index][stat] = value;
        this.savePlayers();
        
        if(stat == "name" || stat == "statusen" || stat == "manab"){
            this.renderPlayers()
        }
    }

    updateTecPas(stats, index, tecPasIndex, value) {
        this.players[index][stats][tecPasIndex] = value;
        this.savePlayers();
    }

    addTecPas(stats, index) {
        this.players[index][stats].push("");
        this.savePlayers();
        this.showPlayerDetails(index);
    }

    removeTecPas(stats, index, tecPasIndex) {
        this.players[index][stats].splice(tecPasIndex, 1);
        this.savePlayers();
        this.showPlayerDetails(index);
    }


    renderPlayers() {
        this.sidebar.innerHTML = `
        <div id="NewPlayer" class="hover border" onclick="manager.addPlayer()"> <p>+ Novo jogador</p></div>`;
        this.players.forEach((player, index) => {
            const playerElement = document.createElement("div");
            playerElement.classList.add("player", "hover", "border");
            if(this.currentPlayerActive == index){
                playerElement.classList.add("active");
                this.playerActive = playerElement
            }
            playerElement.innerHTML = `
                <div class="player-image" onclick="manager.showPlayerDetails(${index}, event)">
                    <img width="80px" height="80px" src="./assets/character_profile.webp" alt="Imagem de perfil do personagem">
                </div>
                <div class="player-description">
                    <div class="player-name">
                        <input id="player-name-${index}" value="${player.name}" spellcheck="false" disabled />
                        <img width="15px" height="15px" src="./assets/icons/pencil-solid.svg" alt="Editar" onclick="manager.enableEditing(${index})">
                        <img width="15px" height="15px" src="./assets/icons/trash-solid.svg" alt="Deletar" onclick="manager.deletePlayer(${index})">
                    </div>
                    <div class="player-stats">
                        <div class="stats" onclick="manager.promptStatUpdate(${index}, 'vida')">
                            <img width="15px" height="15px" title="Vida" src="./assets/icons/heart-solid.svg" alt="Vida">
                            <p>${player.vida}</p>
                        </div>
                        <div title="Mana (Mana + Mana base + 10 * Status EN)" class="stats" onclick="manager.promptStatUpdate(${index}, 'mana')">
                            <img width="15px" height="15px" src="./assets/icons/droplet-solid.svg" alt="Mana">
                            <p>${Number(player.manab) + Number(player.mana) + (10 * player.statusen)}</p>
                        </div>
                    </div>
                </div>`;
            this.sidebar.insertBefore(playerElement, document.getElementById("NewPlayer"));
        });
    }

    enableEditing(index) {
        const input = document.getElementById(`player-name-${index}`);
        const end = input.value.length;
        input.setSelectionRange(end, end);
        input.disabled = false;
        input.focus();

        input.addEventListener("blur", () => {
            this.updatePlayerName(index, input.value);
            input.disabled = true;
        });

        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                this.updatePlayerName(index, input.value);
                input.disabled = true;
            }
        });
    }

    promptStatUpdate(index, stat) {
        const player = this.players[index];
        const expression = prompt(`Alterar ${stat} do jogador ${player.name}: (ex: +20, -10, *2, /2)`);
        if (expression) {
            this.updateStat(index, stat, expression);
        }
    }

    showPlayerDetails(index, event) {
        if(event){
            this.playerActive?.classList.remove("active")

            this.playerActive = event.currentTarget.parentElement
            this.playerActive.classList.add("active")
            this.currentPlayerActive = index;
            
            toggleSidebar()
        }

        const player = this.players[index];

        this.main.innerHTML = `
            <div class="player-sheet border"> 
                <div class="info-block border col-10">
                    <h3 class="info-block-title">Info</h3>
                    <p><strong>Nome:</strong><input type="text" value="${player.name}" onkeyup="manager.updateSheetStat(${index}, 'name', this.value)"></p>
                    <p><strong>Clan:</strong><input type="text" value="${player.clan}" onkeyup="manager.updateSheetStat(${index}, 'clan', this.value)"></p>
                    <p><strong>Caminho:</strong><input type="text" value="${player.caminho}" onkeyup="manager.updateSheetStat(${index}, 'caminho', this.value)"></p>
                </div>
                
                <div class="info-block border col-10">
                    <div>
                        <p><strong>Vida:</strong><input type="number" value="${player.vida}" onkeyup="manager.updateSheetStat(${index}, 'vida', this.value)"></p>
                        <p><strong>Mana base:</strong><input type="number" value="${player.manab}" onkeyup="manager.updateSheetStat(${index}, 'manab', this.value)"></p>
                        <p><strong>Ataque:</strong><input type="number" value="${player.ataque}" onkeyup="manager.updateSheetStat(${index}, 'ataque', this.value)"></p>
                        <p><strong>Defesa:</strong><input type="number" value="${player.defesa}" onkeyup="manager.updateSheetStat(${index}, 'defesa', this.value)"></p>
                    </div>

                    <div>
                        <p><strong>Arma:</strong><input type="text" value="${player.arma}" onkeyup="manager.updateSheetStat(${index}, 'arma', this.value)"></p>
                        <p><strong>Armadura:</strong><input type="text" value="${player.armadura}" onkeyup="manager.updateSheetStat(${index}, 'armadura', this.value)"></p>
                    </div>
                </div>

                <div class="info-block border col-3">
                    <h3 class="info-block-title">Status</h3>
                    <p><strong>Força:</strong><input type="number" value="${player.forca}" onkeyup="manager.updateSheetStat(${index}, 'forca', this.value)"></p>
                    <p><strong>Destreza:</strong><input type="number" value="${player.destreza}" onkeyup="manager.updateSheetStat(${index}, 'destreza', this.value)"></p>
                    <p><strong>Resistência:</strong><input type="number" value="${player.resistencia}" onkeyup="manager.updateSheetStat(${index}, 'resistencia', this.value)"></p>
                    <p><strong>Resiliência:</strong><input type="number" value="${player.resiliencia}" onkeyup="manager.updateSheetStat(${index}, 'resiliencia', this.value)"></p>
                    <p><strong>Precisão:</strong><input type="number" value="${player.precisao}" onkeyup="manager.updateSheetStat(${index}, 'precisao', this.value)"></p>
                    <p><strong>Sabedoria:</strong><input type="number" value="${player.sabedoria}" onkeyup="manager.updateSheetStat(${index}, 'sabedoria', this.value)"></p>
                    <p><strong>Percepção:</strong><input type="number" value="${player.percepcao}" onkeyup="manager.updateSheetStat(${index}, 'percepcao', this.value)"></p>
                    <p><strong>Status EN:</strong><input type="number" value="${player.statusen}" onkeyup="manager.updateSheetStat(${index}, 'statusen', this.value)"></p>
                </div>
                
                <div class="info-block border col-7">
                    <h3 class="info-block-title">Passivas</h3>
                    <ul>
                        ${player.passivas.map((passiva, i) => `
                            <li>
                                <input type="text" value="${passiva}" onkeyup="manager.updateTecPas('passivas', ${index}, ${i}, this.value)">
                                <img width="15px" height="15px" src="./assets/icons/trash-solid.svg" alt="Deletar" onclick="manager.removeTecPas('passivas', ${index}, ${i})">
                            </li>`).join('')}
                    </ul>
                    <button class="border" onclick="manager.addTecPas('passivas', ${index})">+ Adicionar Passiva</button>
                </div>

                <div class="info-block border col-10">
                    <h3 class="info-block-title">Técnicas</h3>
                    <ul>
                        ${player.tecnicas.map((tecnica, i) => `
                            <li>
                                <textarea rows="4" onkeyup="manager.updateTecPas('tecnicas', ${index}, ${i}, this.value)" >${tecnica}</textarea>
                                <img width="15px" height="15px" src="./assets/icons/trash-solid.svg" alt="Deletar" onclick="manager.removeTecPas('tecnicas', ${index}, ${i})">
                            </li>`).join('')}
                    </ul>
                    <button class="border" onclick="manager.addTecPas('tecnicas', ${index})">+ Adicionar Técnica</button>
                </div>
            </div>
        `;
    }

    hiddePlayerDetails(){
        this.main.innerHTML = '';
    }
}

const manager = new PlayerManager();
