//Создаем объекты игры
const game = {
    player: null,
    currentLocation: null,
    currentEnemy: null
    locations: {},
    enemies: {},
    items: {},
    logEntries: [],
    isInCombat: false,

    init: function() {
        this.createItems();
        this.createEnemies();
        this.createLocations();
        this.createPlayer();

        this.currentLocation = this.location.start;
        this.updateUI();
        this.addLogEntry("Добро пожаловать в мир приключений! Вы стоите у входа в таинственный лес.", "location");
    },

    createPlayer: function() {
        this.player = game.player;
    }
}
