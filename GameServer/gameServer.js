var WebSocketServer = require("ws");
var fs = require("fs");

var port = 3000;
var server = new WebSocketServer.Server({port: port});

const TILES_DIR    = "./tiles";
const MAPFILES_DIR = "./mapFiles";

var tilesBase64 = new Array();
var mapFiles = new Array();

/* MESSAGE TYPES */
var GAME_CONTENT     = "GAME_CONTENT";
var CREATE_GAME      = "CREATE_GAME";
var REMOVE_GAME      = "REMOVE_GAME";
var JOIN_GAME        = "JOIN_GAME";
var OPEN_GAME        = "OPEN_GAME";
var TILES            = "TILES";
var MAPS             = "MAPS";
var ENEMY_LEFT       = "ENEMY_LEFT";
var PLAYER_MOVED     = "PLAYER_MOVED";
var ITEM_TRIGGER     = "ITEM_TRIGGER";
var BOWSHOT          = "BOWSHOT";

var games = [];

var logger = true;

prepareServer();

initSocketServer();

function initSocketServer(){
    server.on("connection", function open(connection){
        connection.on("message", function incoming(data){
            handleMessage(connection, data);
        });  
    
        connection.on("close", function bye(){
            removeGameByConnection(connection);
            console.log("Client closed connection");
        });  
    });
}

function prepareServer(){
    fs.readdir(TILES_DIR, (err, files) => {
        files.forEach(file => {
            readFileAndPutToTiles(file);
        });
    })

    fs.readdir(MAPFILES_DIR, (err, files) => {
        files.forEach(file => {
            readFileAndPutToMaps(file);
        });
    })
}

function readFileAndPutToTiles(file){
    var location = TILES_DIR + "/" + file;
    var binaryData = fs.readFileSync(location);
    var base64 = new Buffer.from(binaryData).toString('base64');
    
    tilesBase64[file.substring(0, file.length - 4)] = base64;
}

function readFileAndPutToMaps(file){
    fs.readFile(MAPFILES_DIR + "/" + file, "utf8", function(err, data){
        mapFiles.push(JSON.parse(data));
    });
}

function handleMessage(connection, data){
    var message = JSON.parse(data);

    switch(message.type){
        case GAME_CONTENT:  sendGameContent(connection);
                            break;
        case CREATE_GAME:   createGame(connection, message);
                            break;
        case JOIN_GAME:     enemyJoined(connection, message);
                            break;
        case PLAYER_MOVED:  playerMoved(message.directions, connection);       
                            break;
        case ITEM_TRIGGER:  triggerItem(message, connection);
                            break;
        case BOWSHOT:       bowshot(message, connection);
                            break;
        default: console.log("Bad message -> Skip it");
    }
}



function sendGameContent(connection){
    log("Client opened connection");

    sendTiles(connection);
    sendMaps(connection);
}

function sendTiles(connection){
    connection.send(JSON.stringify({
        "type": TILES,
        "tiles": tilesBase64
    }));
}

function sendMaps(connection){
    connection.send(JSON.stringify({
        "type": MAPS,
        "maps": mapFiles
    }));
}

function createGame(connection, data){
    var game = new Game(data.roomName, data.nickname, connection);
    game.players = 1;
    games.push(game);
    connection.send(JSON.stringify({"type": CREATE_GAME}));

    log("Game erstellt: " + game.roomName);
}

function enemyJoined(connection, data){
    console.log(data + " wants to join room " + data.roomName);

    addChallengerToGame(games.find(game => game.roomName == data.roomName), connection, data.nickname);    
}

function addChallengerToGame(game, connection, nickname){
        game.challengerCon = connection;
        game.enemy = nickname;

        game.creatorCon.send(JSON.stringify({
            "type": OPEN_GAME,
            "enemy":game.enemy
        }));

        game.challengerCon.send(JSON.stringify({
            "type":OPEN_GAME,
            "creator":game.creator
        }));

        game.players = 2;
}

function removeGameByConnection(connection){
    if(tellPlayerThatEnemyLeft(connection)){
        refreshGameList(connection);
    }
}

function tellPlayerThatEnemyLeft(connection){
    var game = findGameByConnection(connection);

    if(game == undefined) 
        return false;

    sendToOtherConnection({"type": ENEMY_LEFT},
                          game, 
                          connection);

    game.players = 1;

    return true;
}

function playerMoved(directions, connection){
    var game = findGameByConnection(connection);

    if(game == undefined) 
        return false;

    var data = {"type": PLAYER_MOVED,
                "directions": directions};

    sendToOtherConnection(data, game, connection);    
}

function triggerItem(data, connection){
    var game = findGameByConnection(connection);

    if(game == undefined) 
        return false;

    sendToOtherConnection(data, game, connection);
}

function bowshot(message, connection){
    var game = findGameByConnection(connection);

    if(game == undefined){
        return false;
    }

    sendToOtherConnection(message, game, connection);
}

function sendToOtherConnection(data, game, connection){
    if(game.challengerCon == connection){
        game.creatorCon.send(JSON.stringify(data));
    }else{
        game.challengerCon.send(JSON.stringify(data));
    }
}

function findGameByConnection(connection){
    var game = games.find((game) => {
        return game.challengerCon == connection || game.creatorCon == connection;
    })
    return game;
}

function refreshGameList(connection){
    games = games.filter((game) => {
        return game.creatorCon != connection && game.challengerCon != connection
    });

    log("Spiel gelöscht, aktuelle Spiele: " + games);
}

function btoa(data){
    return Buffer.from(data).toString('base64');
}

function atob(data){
    return Buffer.from(data, 'base64').toString('ascii');
}

function log(msg){
    if(logger)
        console.log(msg);
}

console.log("Socket Server listening on Port 3000 ...\n");



class Game {
    constructor(roomName, creator, creatorCon) {
        this.roomName = roomName;
        this.creator = creator;
        this.creatorCon = creatorCon;
        this.enemy = "";
        this.enemyCon = "";
    }

    toString(){
        console.log("roomName: "  + this.roomName   + "\n" +
                    "creator: "   + this.creator    + "\n" +
                    "creatorIp: " + this.creatorCon + "\n" +
                    "enemy: "     + this.enemy      + "\n" +
                    "enemyIp: "   + this.enemyCon   + "\n");
    }
}

