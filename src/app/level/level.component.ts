import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { TileService } from '../services/tile.service';
import { ConnectionService } from '../services/connection.service';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html?v=${new Date().getTime()}',
  styleUrls: ['./level.component.css?v=${new Date().getTime()}']
})

export class LevelComponent implements OnInit {

  // Map
  private mapWidth: number;
  private mapHeight: number;
  private mapName: string;
  private creatorSpawnX: number;
  private creatorSpawnY: number;
  private challengerSpawnX: number;
  private challengerSpawnY: number;
  private mapTiles: number[];

  // Canvas
  private canvas: any;
  private canvasContext: any;

  private canvasWidth: number;
  private canvasHeight: number;

  // Tiles
  private gameTiles = [];
  private gameBackgroundTiles = [];
  private gameForegroundTiles = [];
  private arrowTiles = [];
  private mobTiles = [];
  private listOfTileImages: any;

  private creatorTile: any;
  private challengerTile: any;
  private playerTile: any;
  private enemyTile: any;

  private readonly backgroundTileMark = "0";

  // Movement
  private readonly keyMap = {
    68: 'right',
    65: 'left',
    87: 'up',
    83: 'down',
  }

  private directions = {
      left: false,
      right: false,
      up: false,
      down: false
  }

  // Players
  private playerLife = 100;
  private enemyLife = 100;
  private playerSpeed = 0.25;
  private arrowSpeed = 0.25;

  // Bow Cool Down
  private bowCoolDownTimer: NodeJS.Timer;
  private bowCoolDown = 0;

  // Gameloop
  private timeInterval = 25;
  private now: number;
  private then = Date.now();
  private counter: number = 0;

  constructor(private gameService: GameService, 
              private tileService: TileService,
              private conService: ConnectionService) { 
    
    this.setConHandler();
  }

  ngOnInit() {
    this.initGame();
    this.playAudio();
  }

  initGame(){
    this.loadMap(this.gameService.getMaps()[this.gameService.getMapNumber()]);

    this.canvas = document.getElementById("map");
    this.canvasContext = this.canvas.getContext("2d");
    this.setCanvasSize();

    this.listOfTileImages = this.tileService.getListOfTilemarksToBase64(); 
    this.initGameTiles();

    this.gameService.setLife(100);

    this.creatorTile = this.tileService.createPlayer(this.creatorSpawnX, this.creatorSpawnY);
    this.challengerTile = this.tileService.createEnemy(this.challengerSpawnX, this.challengerSpawnY);
    this.setPlayerTile();

    this.addKeyListenerToDocument();
    this.addActiveTabListener();

    this.drawBackground();
    this.drawForeground();

    this.scaleCanvas();

    this.startGame();
  }

  scaleCanvas(){
    var windowHeight = window.innerHeight;
    var gameInfoHeight = document.getElementById("gameInfo").offsetHeight;

    this.canvas.setAttribute("style", "max-height: " + (windowHeight-gameInfoHeight - 25) + "px;");
  }

  setConHandler(){
    var _this = this;

    this.conService.connection.onmessage = function (message){
      var data = JSON.parse(message.data);

      switch(data.type){
        case _this.conService.ENEMY_LEFT:   _this.enemyLeft();
                                            break;
        case _this.conService.PLAYER_MOVED: _this.enemyMoved(data.directions);
                                            break;
        case _this.conService.ITEM_TRIGGER: _this.enemyTriggeredItem(data.coords.x, data.coords.y);
                                            break;
        case _this.conService.BOWSHOT:      _this.enemyBowshot(data.coords.x, data.coords.y, data.tileMark);
                                            break;
        default: console.log(_this.conService.BAD_MSG);
      }
    };
  }

  loop(){
    window.requestAnimationFrame(this.loop.bind(this));
    this.now = Date.now();
    const deltaTime = this.now - this.then;

    this.counter += deltaTime;

    if(this.counter > this.timeInterval ){
      this.update();
      

      this.counter = 0;
    }
    this.draw();

    this.then = this.now; 
  }

  addKeyListenerToDocument(){
    var _this = this;

    document.addEventListener("keydown", (event) => {
      var key = _this.keyMap[event.keyCode];
      _this.directions[key] = true;

      // E
      if(event.keyCode == 69){
        this.trigger();
      }

      if(event.keyCode == 32){
        this.bowshot();
      }
    }, false);

    document.addEventListener("keyup", (event) => {
      var key = _this.keyMap[event.keyCode];
      _this.directions[key] = false;
    }, false);

    window.addEventListener('keydown', function(e) {
      if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
    });
  }

  addActiveTabListener(){
    var _this = this;

    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === 'visible') {
        _this.gameTiles.forEach((tile) => {
          tile.render(_this.canvasContext, _this.tileService);
        });
      } 
    });
  }

  bowshot(){
    if(!this.playerTile.hasBow || this.bowCoolDown > 0) return;

    this.reinitBowCoolDown();

    var tileMark = this.getTileMarkForArrowDirection();

    var arrowTile = this.tileService.createArrow(this.playerTile.x, this.playerTile.y, tileMark);
    this.arrowTiles.push(arrowTile);    

    this.conService.sendBowshot(this.playerTile.x, this.playerTile.y, tileMark);
  }

  reinitBowCoolDown(){
    this.bowCoolDown = 0.7;

    this.bowCoolDownTimer = setInterval(() => {
      console.log(this.bowCoolDown)
      this.bowCoolDown -= 0.1;
      if(this.bowCoolDown <= 0)
        clearInterval(this.bowCoolDownTimer);
    }, 100);
  }

  getTileMarkForArrowDirection(): number{
    if(this.directions.up){
      return 17;
    }else if(this.directions.right){
      return 19;
    }else if(this.directions.left){
      return 23;
    }else{
      return 21;
    }
  }

  enemyBowshot(x: number, y: number, tileMark: number){
    this.arrowTiles.push(this.tileService.createArrow(x, y, tileMark));
  }

  trigger(){
    var midOfPlayerTileX = this.playerTile.x + 0.5;
    var midOfPlayerTileY = this.playerTile.y + 0.5;

    var index = this.getIndexByCoords(Math.floor(midOfPlayerTileX), Math.floor(midOfPlayerTileY));

    if(typeof this.gameTiles[index].effect === 'function'){
      var coordsOfTriggeredItem = this.gameTiles[index].effect(this.playerTile);
      this.conService.sendItemTrigger(coordsOfTriggeredItem);
    }
  }

  enemyLeft(){
    console.log("Enemy left");
  }

  enemyMoved(directions: any){
    if(directions.up){
      this.enemyTile.y -= this.playerSpeed;
    }
    if(directions.right){
      this.enemyTile.x += this.playerSpeed;
    }
    if(directions.down){
      this.enemyTile.y += this.playerSpeed;
    }
    if(directions.left){
      this.enemyTile.x -= this.playerSpeed;
    }
  }

  enemyTriggeredItem(x: number, y: number){
     var index = this.getIndexByCoords(x, y);
     this.gameTiles[index].effect(this.enemyTile);
  }

  setPlayerTile(){
    if(this.gameService.getPlayerRole() == this.gameService.roles.ADMIN){
      this.playerTile = this.creatorTile;
      this.enemyTile = this.challengerTile;
    }else{
      this.playerTile = this.challengerTile;
      this.enemyTile = this.creatorTile;
    }
  }

  initGameTiles(){
    for(var y = 0; y < this.mapHeight; y++){
      for(var x = 0; x < this.mapWidth; x++){
        var index = this.getIndexByCoords(x, y);

        switch(this.mapTiles[index]){
          case  0: this.gameTiles.push(this.tileService.createBackground(x, y));    break;
          case  1: this.gameTiles.push(this.tileService.createWall(x, y, 0));       break;
          case  2: this.gameTiles.push(this.tileService.createWall(x, y, 1));       break;
          case  3: this.gameTiles.push(this.tileService.createWall(x, y, 2));       break;
          case  4: this.gameTiles.push(this.tileService.createWall(x, y, 3));       break;
          case  5: this.gameTiles.push(this.tileService.createCorner(x, y, 0));     break;
          case  6: this.gameTiles.push(this.tileService.createCorner(x, y, 1));     break;
          case  7: this.gameTiles.push(this.tileService.createCorner(x, y, 2));     break;
          case  8: this.gameTiles.push(this.tileService.createCorner(x, y, 3));     break;
          case 10: this.gameTiles.push(this.tileService.createRedDrink(x, y));      break;
          case 11: this.gameTiles.push(this.tileService.createBlueDrink(x, y));     break;
          case 12: this.gameTiles.push(this.tileService.createGreenDrink(x, y));    break;
          case 13: this.gameTiles.push(this.tileService.createChest(x, y));         break;
          case 16: this.gameTiles.push(this.tileService.createBow(x, y));           break;
          case 40: this.gameTiles.push(this.tileService.createShadowMob(x, y));     break;
          default: console.log("Bad tile!");
        }
      }
    }

    for(var i = 0; i < this.gameTiles.length; i++){
      if(this.gameTiles[i].layer == 0){
        this.gameBackgroundTiles.push(this.gameTiles[i]);
      }
      if(this.gameTiles[i].layer == 1){
        this.gameForegroundTiles.push(this.gameTiles[i]);
      }   
      if(this.gameTiles[i].getHp === "function"){
        this.mobTiles.push(this.gameTiles[i]);
      }
    }
  }

  getIndexByCoords(x: number, y: number): number{
    return Math.floor(y) * this.mapWidth + Math.floor(x);
  }

  
  startGame(){
    window.requestAnimationFrame(this.loop.bind(this));
  }

  update(){
    this.movePlayer();
    this.moveArrows();
    this.removeArrows();
  }

  movePlayer(){
    if(this.directions.up    && this.playerTile.y - this.playerSpeed < 0                  ||
      this.directions.right && this.playerTile.x + this.playerSpeed > this.mapWidth  - 1 ||
      this.directions.down  && this.playerTile.y + this.playerSpeed > this.mapHeight - 1 ||
      this.directions.left  && this.playerTile.x - this.playerSpeed < 0){
     return;
   }else{
     this.conService.sendMove(this.directions);
   }


   if(this.directions.up){
     this.playerTile.y -= this.playerSpeed;
   }
   if(this.directions.right){
     this.playerTile.x += this.playerSpeed;
   }
   if(this.directions.down){
     this.playerTile.y += this.playerSpeed;
   }
   if(this.directions.left){
     this.playerTile.x -= this.playerSpeed;
   }
  }

  moveArrows(){
    this.arrowTiles.forEach((tile) =>{
      if(tile.tileMark == 17){
        tile.y -= this.arrowSpeed;
      }else if(tile.tileMark == 19){
        tile.x += this.arrowSpeed;
      }else if(tile.tileMark == 21){
        tile.y += this.arrowSpeed;
      }else{
        tile.x -= this.arrowSpeed;
      }
    });
  }

  removeArrows(){
    for(var i = 0; i < this.arrowTiles.length; i++){
      if(this.arrowTiles[i].x > this.mapWidth  || this.arrowTiles[i].x < -1 || 
         this.arrowTiles[i].y >  this.mapHeight || this.arrowTiles[i].y < -1){
          this.arrowTiles.splice(i, 1);
        }
      }
  }

  draw(){
    this.drawSurroundingTiles();
    this.drawPlayer();
    this.drawEnemy();
    this.drawMovingObjectsTiles();
  }

  drawSurroundingTiles(){
    this.drawSurroundingTilesForCoords(this.playerTile.x, this.playerTile.y);
    this.drawSurroundingTilesForCoords(this.enemyTile.x, this.enemyTile.y);
    
    this.arrowTiles.forEach((tile) => {
      this.drawSurroundingTilesForCoords(tile.x, tile.y);
    })
  }

  drawSurroundingTilesForCoords(x: number, y: number){
    var index = this.getIndexByCoords(x, y);
    var positions = [index,   index-this.mapWidth,   index-this.mapWidth+1,
                     index+1, index+this.mapWidth+1, index+this.mapWidth,
                     index+this.mapWidth-1, index-1, index-this.mapWidth-1];
                                  
    positions.forEach((position) =>{
      if(position >= 0 && position < this.gameTiles.length) {
        if(this.gameTiles[position].layer == 1){
          this.drawImageByIndex(position, this.listOfTileImages[this.backgroundTileMark]);
        }
        this.gameTiles[position].render(this.canvasContext, this.tileService);
      }
    });
  }

  drawPlayer(){
    this.creatorTile.render(this.canvasContext, this.tileService);
  }

  drawEnemy(){
    this.challengerTile.render(this.canvasContext, this.tileService);
  }

  getSurroundingTilePositionsForPosition(x: number, y: number){
    var positions = [{"x": x,   "y": y-1}, {"x": x+1, "y": y-1}, {"x": x+1, "y": y},
                     {"x": x+1, "y": y+1}, {"x": x,   "y": y+1}, {"x": x-1, "y": y+1},
                     {"x": x-1, "y": y},   {"x": x-1, "y": y-1}, {"x": x,   "y": y}];

    return positions;
  }

  drawMovingObjectsTiles(){
    this.arrowTiles.forEach((tile) =>{
      tile.render(this.canvasContext, this.tileService);
    })
  }

  playAudio(){
    let audio = new Audio();
    audio.src = this.gameService.MUSIC_URL;
    audio.load();
    audio.play();
  }

  loadMap(map: any){
    this.mapWidth  = map.width;
    this.mapHeight = map.height;
    this.mapName   = map.name;
    this.creatorSpawnX = map.creatorSpawnX;
    this.creatorSpawnY = map.creatorSpawnY;
    this.challengerSpawnX = map.challengerSpawnX;
    this.challengerSpawnY = map.challengerSpawnY;
    this.mapTiles = map.rows;
  }

  getCurrentMapNumber(): number{
    return this.gameService.getMapNumber();
  }

  drawBackground(){
    for(var x = 0; x < this.mapWidth; x++){
      for(var y = 0; y < this.mapHeight; y++){
        this.drawImageByCoords(x, y, this.listOfTileImages[this.backgroundTileMark]);
      }        
    }
  }

  drawImageByCoords(x: number, y: number, tileContent: string){
    var _this = this;

    var tileImage = new Image();   
    tileImage.onload = function(){
      _this.canvasContext.drawImage(tileImage, 
                                    x * _this.tileService.TILE_WIDTH, 
                                    y * _this.tileService.TILE_HEIGHT);
    }
    tileImage.src = "data:image/png;base64," + tileContent;
  }

  drawImageByIndex(index: number, tileContent: string){
    var coords = this.getCoordsByIndex(index);
    this.drawImageByCoords(coords.x, coords.y, tileContent);
  }

  drawForeground(){
    var _this = this;
    
    this.gameForegroundTiles.forEach((tile) => {
      tile.render(_this.canvasContext, _this.tileService);
    });
  }

  getCoordsByIndex(index: number): any{
    return {"x": index % this.mapWidth, "y": Math.floor(index / this.mapWidth)};
  }

  getTileMark(index: number): number{
    return this.mapTiles[index];
  }
  
  setCanvasSize(){
    this.canvasWidth  = this.tileService.TILE_WIDTH  * this.mapWidth;
    this.canvasHeight = this.tileService.TILE_HEIGHT * this.mapHeight;

    this.canvas.setAttribute("width", this.canvasWidth.toString());
    this.canvas.setAttribute("height", this.canvasHeight.toString());
  }

}