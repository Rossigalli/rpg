class PlayerManager {
    constructor() {
        this.players = JSON.parse(localStorage.getItem("players")) || [];
        this.sidebar = document.getElementById("Sidebar");
        this.renderPlayers();

        // Adicionando event listeners para os botões
        document.getElementById("Export-btn").addEventListener("click", () => this.exportPlayers());
        document.getElementById("Import-btn").addEventListener("click", () => this.importPlayers());
    }

    savePlayers() {
        localStorage.setItem("players", JSON.stringify(this.players));
    }

    addPlayer() {
        const name = `Jogador ${this.players.length + 1}`;
        const vida = 100;
        const mana = 100;
        const player = { name, vida, mana };
        this.players.push(player);
        this.savePlayers();
        this.renderPlayers();
    }

    updatePlayerName(index, newName) {
        this.players[index].name = newName;
        this.savePlayers();
    }

    deletePlayer(index) {
        const confirmation = confirm("Tem certeza que deseja deletar este jogador?");
    
        if (confirmation) {
            this.players.splice(index, 1); 
            this.savePlayers(); 
            this.renderPlayers(); 
        }
    }

    updateStat(index, stat, expression) {
        try {
            this.players[index][stat] = eval(`${this.players[index][stat]}${expression}`);
            this.savePlayers();
            this.renderPlayers();
        } catch (error) {
            console.error("Erro ao calcular expressão", error);
        }
    }

    renderPlayers() {
        this.sidebar.innerHTML = '<div id="NewPlayer" class="hover" onclick="manager.addPlayer()"> <p>+ Novo jogador</p></div>';
        this.players.forEach((player, index) => {
            const playerElement = document.createElement("div");
            playerElement.classList.add("player", "hover");
            playerElement.innerHTML = `
                <div class="player-image">
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
                        <div class="stats" onclick="manager.promptStatUpdate(${index}, 'mana')">
                            <img width="15px" height="15px" title="Mana" src="./assets/icons/droplet-solid.svg" alt="Mana">
                            <p>${player.mana}</p>
                        </div>
                    </div>
                </div>`;
            this.sidebar.insertBefore(playerElement, document.getElementById("NewPlayer"));
        });
    }

    enableEditing(index) {
        const input = document.getElementById(`player-name-${index}`);
        const end = input.value.length
        input.setSelectionRange(end, end)
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

    // Função para exportar os jogadores para um arquivo JSON
    exportPlayers() {
        const data = JSON.stringify(this.players, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "players.json";
        link.click();
    }

    // Função para importar os jogadores a partir de um arquivo JSON
    importPlayers() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const data = JSON.parse(reader.result);
                        if (Array.isArray(data)) {
                            this.players = data;
                            this.savePlayers();
                            this.renderPlayers();
                        } else {
                            alert("O arquivo JSON não contém dados válidos.");
                        }
                    } catch (error) {
                        alert("Erro ao ler o arquivo JSON.");
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }
}

// Inicializar o gerenciador e renderizar os jogadores salvos
const manager = new PlayerManager();
