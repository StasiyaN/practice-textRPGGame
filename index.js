// Основные объекты игры
const game = {
    player: null,
    currentLocation: null,
    currentEnemy: null,
    locations: {},
    enemies: {},
    items: {},
    logEntries: [],
    isInCombat: false,
    init: function() {
        // Инициализируем locations как пустой объект на всякий случай
        this.locations = this.locations || {};

        this.createItems();
        this.createEnemies();
        this.createLocations();
        this.createPlayer();

        // Проверяем перед использованием
        if (this.locations && this.locations.start) {
            this.currentLocation = this.locations.start;
        } else {
            console.error("Не удалось установить стартовую локацию");
            // Создаем fallback локацию
            this.currentLocation = { name: "Без названия", description: "Описание отсутствует" };
        }

        this.updateUI();
        this.addLogEntry("Добро пожаловать в мир приключений!", "location");
    },

    createPlayer: function() {
        this.player = {
            name: "Искатель приключений",
            health: 100,
            maxHealth: 100,
            strength: 10,
            defense: 5,
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            inventory: [],

            attack: function(enemy) {
                const damage = Math.max(1, this.strength - enemy.defense);
                enemy.health -= damage;
                return damage;
            },

            takeDamage: function(damage) {
                const actualDamage = Math.max(1, damage - this.defense);
                this.health -= actualDamage;
                return actualDamage;
            },

            useItem: function(item) {
                if (item.type === "healing") {
                    this.health = Math.min(this.maxHealth, this.health + item.value);
                    this.removeFromInventory(item);
                    game.addLogEntry(`Вы использовали ${item.name} и восстановили ${item.value} здоровья.`, "item");
                } else if (item.type === "weapon") {
                    this.strength += item.value;
                    this.removeFromInventory(item);
                    game.addLogEntry(`Вы экипировали ${item.name} и увеличили свою силу на ${item.value}.`, "item");
                } else if (item.type === "armor") {
                    this.defense += item.value;
                    this.removeFromInventory(item);
                    game.addLogEntry(`Вы экипировали ${item.name} и увеличили свою защиту на ${item.value}.`, "item");
                }
            },

            addToInventory: function(item) {
                this.inventory.push(item);
            },

            removeFromInventory: function(item) {
                const index = this.inventory.findIndex(i => i.id === item.id);
                if (index !== -1) {
                    this.inventory.splice(index, 1);
                }
            },

            gainExp: function(exp) {
                this.exp += exp;
                if (this.exp >= this.expToNextLevel) {
                    this.levelUp();
                }
            },

            levelUp: function() {
                this.level++;
                this.exp -= this.expToNextLevel;
                this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);

                this.maxHealth += 20;
                this.health = this.maxHealth;
                this.strength += 5;
                this.defense += 2;

                game.addLogEntry(`Поздравляем! Вы достигли ${this.level} уровня! Ваши характеристики улучшились.`, "location");
            }
        };
    },

    createItems: function() {
        this.items = {
            smallPotion: {
                id: "smallPotion",
                name: "Малое зелье здоровья",
                type: "healing",
                value: 30
            },
            largePotion: {
                id: "largePotion",
                name: "Большое зелье здоровья",
                type: "healing",
                value: 60
            },
            ironSword: {
                id: "ironSword",
                name: "Железный меч",
                type: "weapon",
                value: 5
            },
            steelArmor: {
                id: "steelArmor",
                name: "Стальная броня",
                type: "armor",
                value: 5
            }
        };
    },

    createEnemies: function() {
        this.enemies = {
            goblin: {
                id: "goblin",
                name: "Гоблин",
                health: 30,
                maxHealth: 30,
                strength: 8,
                defense: 2,
                expReward: 25,
                description: "Маленькое, но злобное существо с острыми когтями."
            },
            orc: {
                id: "orc",
                name: "Орк",
                health: 60,
                maxHealth: 60,
                strength: 12,
                defense: 4,
                expReward: 50,
                description: "Большое и сильное существо с огромной дубиной."
            },
            dragon: {
                id: "dragon",
                name: "Дракон",
                health: 150,
                maxHealth: 150,
                strength: 20,
                defense: 10,
                expReward: 200,
                description: "Могучее крылатое существо, извергающее пламя."
            }
        };
    },

    createLocations: function() {
        this.locations = {
            start: {
                id: "start",
                name: "Вход в лес",
                description: "Вы стоите на опушке таинственного леса. Деревья здесь высокие и древние, а воздух наполнен запахом хвои и чего-то неизведанного.",
                actions: [
                    { text: "Идти вглубь леса", target: "forest" },
                    { text: "Исследовать старую хижину", target: "hut" }
                ],
                items: [this.items.smallPotion],
                enemyChance: 0.2,
                possibleEnemies: ["goblin"]
            },
            forest: {
                id: "forest",
                name: "Глубокий лес",
                description: "Вы в самой глубине леса. Солнце едва пробивается сквозь густую листву, создавая таинственные тени. Вы слышите странные звуки вокруг.",
                actions: [
                    { text: "Вернуться к опушке", target: "start" },
                    { text: "Исследовать пещеру", target: "cave" },
                    { text: "Подняться на холм", target: "hill" }
                ],
                items: [this.items.ironSword],
                enemyChance: 0.4,
                possibleEnemies: ["goblin", "orc"]
            },
            hut: {
                id: "hut",
                name: "Старая хижина",
                description: "Вы внутри старой заброшенной хижины. Пахнет пылью и плесенью. В углу стоит разбитый стол, а на полках виднеются какие-то склянки.",
                actions: [
                    { text: "Выйти из хижины", target: "start" },
                    { text: "Осмотреть подвал", target: "basement" }
                ],
                items: [this.items.largePotion],
                enemyChance: 0.1,
                possibleEnemies: ["goblin"]
            },
            basement: {
                id: "basement",
                name: "Подвал хижины",
                description: "Темный и сырой подвал. Вы с трудом различаете очертания старых ящиков и бутылок. Кажется, здесь кто-то жил не так давно.",
                actions: [
                    { text: "Вернуться в хижину", target: "hut" }
                ],
                items: [this.items.steelArmor],
                enemyChance: 0.3,
                possibleEnemies: ["orc"]
            },
            cave: {
                id: "cave",
                name: "Темная пещера",
                description: "Вы внутри мрачной пещеры. Со стен капает вода, а вдалеке слышится эхо ваших шагов. Воздух здесь холодный и влажный.",
                actions: [
                    { text: "Выйти из пещеры", target: "forest" },
                    { text: "Идти глубже в пещеру", target: "deepCave" }
                ],
                items: [],
                enemyChance: 0.5,
                possibleEnemies: ["orc"]
            },
            deepCave: {
                id: "deepCave",
                name: "Глубины пещеры",
                description: "Вы в самых глубинах пещеры. Здесь почти нет света, но вы замечаете блеск чего-то металлического вдалеке. Также вы чувствуете жар, исходящий из глубины.",
                actions: [
                    { text: "Вернуться к выходу", target: "cave" },
                    { text: "Исследовать дальше", target: "dragonLair" }
                ],
                items: [],
                enemyChance: 0.7,
                possibleEnemies: ["orc", "dragon"]
            },
            hill: {
                id: "hill",
                name: "Вершина холма",
                description: "Вы на вершине холма, откуда открывается прекрасный вид на окрестности. Лес простирается до горизонта, а на западе вы замечаете очертания гор.",
                actions: [
                    { text: "Спуститься в лес", target: "forest" }
                ],
                items: [this.items.largePotion],
                enemyChance: 0.2,
                possibleEnemies: ["goblin"]
            },
            dragonLair: {
                id: "dragonLair",
                name: "Логово дракона",
                description: "Вы в огромной пещере, заполненной золотом и драгоценностями. В центре лежит огромный дракон, который, кажется, только что проснулся.",
                actions: [
                    { text: "Бежать!", target: "deepCave" }
                ],
                items: [],
                enemyChance: 1.0,
                possibleEnemies: ["dragon"]
            }
        };
    },

    moveToLocation: function(locationId) {
        if (this.isInCombat) {
            this.addLogEntry("Вы не можете перемещаться во время боя!", "combat");
            return;
        }

        this.currentLocation = this.locations[locationId];
        this.addLogEntry(`Вы переместились в локацию: ${this.currentLocation.name}`, "location");

        // Проверка на встречу с врагом
        if (Math.random() < this.currentLocation.enemyChance) {
            this.encounterEnemy();
        }

        this.updateUI();
    },

    encounterEnemy: function() {
        const enemyType = this.currentLocation.possibleEnemies[
            Math.floor(Math.random() * this.currentLocation.possibleEnemies.length)
            ];

        this.currentEnemy = {...this.enemies[enemyType]};
        this.isInCombat = true;

        this.addLogEntry(`На вас напал ${this.currentEnemy.name}!`, "combat");
        this.updateUI();
    },

    playerAttack: function() {
        if (!this.isInCombat || !this.currentEnemy) return;

        const damage = this.player.attack(this.currentEnemy);
        this.addLogEntry(`Вы атаковали ${this.currentEnemy.name} и нанесли ${damage} урона!`, "combat");

        if (this.currentEnemy.health <= 0) {
            this.defeatEnemy();
            return;
        }

        // Враг контратакует
        this.enemyAttack();
    },

    enemyAttack: function() {
        const damage = this.currentEnemy.strength;
        const actualDamage = this.player.takeDamage(damage);
        this.addLogEntry(`${this.currentEnemy.name} атаковал вас и нанес ${actualDamage} урона!`, "combat");

        if (this.player.health <= 0) {
            this.gameOver();
        }

        this.updateUI();
    },

    defeatEnemy: function() {
        this.addLogEntry(`Вы победили ${this.currentEnemy.name}! Получено ${this.currentEnemy.expReward} опыта.`, "combat");
        this.player.gainExp(this.currentEnemy.expReward);

        // Шанс выпадения предмета
        if (Math.random() < 0.5) {
            const item = this.items.smallPotion;
            this.player.addToInventory(item);
            this.addLogEntry(`Вы нашли ${item.name}!`, "item");
        }

        this.currentEnemy = null;
        this.isInCombat = false;
        this.updateUI();
    },

    gameOver: function() {
        this.addLogEntry("Вы погибли! Игра окончена.", "combat");
        this.isInCombat = false;
        this.currentEnemy = null;

        // Отключаем кнопки атаки
        document.querySelectorAll('.attack-btn').forEach(btn => {
            btn.disabled = true;
        });
    },

    useItem: function(item) {
        this.player.useItem(item);
        this.updateUI();
    },

    addLogEntry: function(message, type = "normal") {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        this.logEntries.push({
            time: timeString,
            message: message,
            type: type
        });

        this.updateLog();
    },

    updateLog: function() {
        const logContent = document.getElementById('log-content');
        logContent.innerHTML = '';

        this.logEntries.forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${entry.type}-log`;
            logEntry.innerHTML = `${entry.message}`;
            logContent.appendChild(logEntry);
        });

        logContent.scrollTop = logContent.scrollHeight;
    },

    updateUI: function() {
        // Обновление статистики персонажа
        document.getElementById('char-name').textContent = this.player.name;
        document.getElementById('char-health').textContent = `${this.player.health}/${this.player.maxHealth}`;
        document.getElementById('char-strength').textContent = this.player.strength;
        document.getElementById('char-defense').textContent = this.player.defense;
        document.getElementById('char-level').textContent = this.player.level;
        document.getElementById('char-exp').textContent = `${this.player.exp}/${this.player.expToNextLevel}`;

        // Обновление шкалы опыта
        const expPercent = (this.player.exp / this.player.expToNextLevel) * 100;
        document.getElementById('exp-bar').style.width = `${expPercent}%`;

        // Обновление инвентаря
        const inventoryEl = document.getElementById('inventory');
        inventoryEl.innerHTML = '';

        if (this.player.inventory.length === 0) {
            inventoryEl.innerHTML = '<p>Инвентарь пуст</p>';
        } else {
            this.player.inventory.forEach(item => {
                const itemEl = document.createElement('button');
                itemEl.className = 'item';
                itemEl.textContent = item.name;
                itemEl.onclick = () => this.useItem(item);
                inventoryEl.appendChild(itemEl);
            });
        }

        // Обновление описания локации
        document.getElementById('location-desc').textContent = this.currentLocation.description;

        // Обновление действий для локации
        const locationActionsEl = document.getElementById('location-actions');
        locationActionsEl.innerHTML = '';

        this.currentLocation.actions.forEach(action => {
            const button = document.createElement('button');
            button.textContent = action.text;
            button.onclick = () => this.moveToLocation(action.target);
            locationActionsEl.appendChild(button);
        });

        // Обновление кнопок действий
        const actionButtonsEl = document.getElementById('action-buttons');
        actionButtonsEl.innerHTML = '';

        if (this.isInCombat) {
            const attackButton = document.createElement('button');
            attackButton.textContent = 'Атаковать';
            attackButton.className = 'attack-btn';
            attackButton.onclick = () => this.playerAttack();
            actionButtonsEl.appendChild(attackButton);
        } else {
            // Добавляем возможность собирать предметы, если они есть в локации
            if (this.currentLocation.items.length > 0) {
                const searchButton = document.createElement('button');
                searchButton.textContent = 'Искать предметы';
                searchButton.onclick = () => this.searchLocation();
                actionButtonsEl.appendChild(searchButton);
            }

            const restButton = document.createElement('button');
            restButton.textContent = 'Отдохнуть';
            restButton.onclick = () => this.rest();
            actionButtonsEl.appendChild(restButton);
        }

        // Обновление информации о враге
        const enemyContainerEl = document.getElementById('enemy-container');
        enemyContainerEl.innerHTML = '';

        if (this.isInCombat && this.currentEnemy) {
            const enemyEl = document.createElement('div');
            enemyEl.className = 'enemy';

            enemyEl.innerHTML = `
                        <div class="enemy-info">
                            <h3>${this.currentEnemy.name}</h3>
                            <p>${this.currentEnemy.description}</p>
                            <div class="enemy-health">
                                <div class="enemy-health-bar" style="width: ${(this.currentEnemy.health / this.currentEnemy.maxHealth) * 100}%"></div>
                            </div>
                            <p>Здоровье: ${this.currentEnemy.health}/${this.currentEnemy.maxHealth}</p>
                        </div>
                    `;

            enemyContainerEl.appendChild(enemyEl);
        }
    },

    searchLocation: function() {
        if (this.isInCombat) {
            this.addLogEntry("Вы не можете искать предметы во время боя!", "combat");
            return;
        }

        if (this.currentLocation.items.length > 0) {
            const item = this.currentLocation.items[0];
            this.player.addToInventory(item);
            this.addLogEntry(`Вы нашли ${item.name}!`, "item");

            // Удаляем предмет из локации
            this.currentLocation.items.splice(0, 1);
        } else {
            this.addLogEntry("Вы обыскали локацию, но ничего не нашли.", "location");
        }

        this.updateUI();
    },

    rest: function() {
        if (this.isInCombat) {
            this.addLogEntry("Вы не можете отдыхать во время боя!", "combat");
            return;
        }

        const healAmount = 20;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
        this.addLogEntry(`Вы отдохнули и восстановили ${healAmount} здоровья.`, "item");

        this.updateUI();
    },

    resetGame: function() {
        this.init();
    }
};

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    game.init();

    // Добавляем обработчик для кнопки сброса
    document.getElementById('reset-btn').addEventListener('click', function() {
        game.resetGame();
    });
});
