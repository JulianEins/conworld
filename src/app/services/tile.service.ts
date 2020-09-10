import { Injectable } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class TileService {

  private listOfTilemarksToBase64: any[];
  private mapTiles: any[];

  readonly TILE_WIDTH  = 64;
  readonly TILE_HEIGHT = this.TILE_WIDTH;

  constructor() { }

  
  createPlayer(x: number, y: number){
    return new PlayerTile(x, y);
  }

  createEnemy(x: number, y: number){
    return new EnemyTile(x, y);
  }

  createBackground(x: number, y: number){
    return new BackgroundTile(x, y);
  }

  createCorner(x: number, y: number, rotation: number){
    return new BorderCornerTile(x, y, rotation);
  }

  createWall(x: number, y: number, rotation: number){
    return new BorderTile(x, y, rotation);
  }

  createChest(x: number, y: number){
    return new ChestTile(x, y);
  }

  createRedDrink(x: number, y: number){
    return new RedDrinkTile(x, y);
  }

  createBlueDrink(x: number, y: number){
    return new BlueDrinkTile(x, y);
  }

  createGreenDrink(x: number, y: number){
    return new GreenDrinkTile(x, y);
  }

  createBow(x: number, y: number){
    return new BowTile(x, y);
  }

  createArrow(x: number, y: number, tileMark: number){
    return new ArrowTile(x, y, tileMark);
  }

  createShadowMob(x: number, y: number){
    return new ShadowMobTile(x, y);
  }

  getListOfTilemarksToBase64(): any[]{
    return this.listOfTilemarksToBase64;
  }

  setListOfTilemarksToBase64(listOfTilemarksToBase64: any[]){
    this.listOfTilemarksToBase64 = listOfTilemarksToBase64;
  }

  getMapTiles(): any{
    return this.mapTiles;
  }

  setMapTiles(mapTiles: any){
    this.mapTiles = this.mapTiles;
  }
}




class Tile{
  protected TILE_WIDTH = 64;
  protected TILE_HEIGHT = 64;

  protected x: number;
  protected y: number;

  /* layer 0: background tiles, layer 1: e.g. players, items, moving objects,... */
  protected layer: number;
  protected tileMark: number;

  constructor(x: number, y: number){
    this.x = x;
    this.y = y;
  }

  render(canvasContext: any, tileService: TileService){
    var _this = this;

    var tileImage = new Image();   
    tileImage.onload = function(){
      canvasContext.drawImage(tileImage, 
                        _this.x * tileService.TILE_WIDTH, 
                        _this.y * tileService.TILE_HEIGHT);
    }
    tileImage.src = "data:image/png;base64," + tileService.getListOfTilemarksToBase64()[this.tileMark];
  }
}

class PlayerTile extends Tile{
  coordX: number;
  coordY: number;

  hasBow = false;

  constructor(x: number, y: number){
    super(x, y);
    this.layer = 2;
    this.tileMark = 31;
  }



  getSurroundingTiles(): any{
    var q1x = this.coordX;
    var q1y = this.coordY;
    var q2x = q1x + this.TILE_WIDTH;
    var q2y = q1y;
    var q3x = q1x;
    var q3y = q1y + this.TILE_HEIGHT;
    var q4x = q1x + this.TILE_WIDTH;
    var q4y = q1y + this.TILE_HEIGHT;

    return [{"x" : Math.floor(q1x / this.TILE_WIDTH), "y" : Math.floor(q1y / this.TILE_HEIGHT)},
            {"x" : Math.floor(q2x / this.TILE_WIDTH), "y" : Math.floor(q2y / this.TILE_HEIGHT)},
            {"x" : Math.floor(q3x / this.TILE_WIDTH), "y" : Math.floor(q3y / this.TILE_HEIGHT)},
            {"x" : Math.floor(q4x / this.TILE_WIDTH), "y" : Math.floor(q4y / this.TILE_HEIGHT)}];
           
  }
}

class EnemyTile extends Tile{
  constructor(x: number, y: number){
    super(x, y);
    this.layer = 2;
    this.tileMark = 31;
  }
}

class RotationTile extends Tile{
  protected rotation: number;

  constructor(x: number, y: number, rotation: number){ 
    super(x, y)
    this.rotation = rotation;
  }
}

class BackgroundTile extends Tile{
  constructor(x: number, y: number){
    super(x, y);
    this.layer = 0;
    this.tileMark = 0;
  }
}

class ItemTile extends Tile{
  constructor(x: number, y: number){
    super(x, y);
    this.layer = 1;
  }

  effect(): any{
    console.log("Function to use the effect of an item");
    return {"x": this.x, "y": this.y};
  }
}

class ChestTile extends ItemTile{
  constructor(x: number, y: number){
    super(x, y);
    this.tileMark = 13;
  }

  effect(){
    if(this.tileMark == 13){
      this.tileMark = 14;
    }else{
      this.tileMark = 13;
    }
    return {"x": this.x, "y": this.y};
  }
}

class RedDrinkTile extends ItemTile{
  constructor(x: number, y: number){
    super(x, y);
    this.tileMark = 10;
  }

  effect(){
    this.tileMark = 15;
    return {"x": this.x, "y": this.y};
  }
}

class BlueDrinkTile extends ItemTile{
  constructor(x: number, y: number){
    super(x, y);
    this.tileMark = 11;
  }

  effect(){
    this.tileMark = 15;
    return {"x": this.x, "y": this.y};
  }
}

class GreenDrinkTile extends ItemTile{
  constructor(x: number, y: number){
    super(x, y);
    this.tileMark = 12;
  }

  effect(){
    this.tileMark = 15;
    return {"x": this.x, "y": this.y};
  }
}

class BowTile extends ItemTile{
  constructor(x: number, y: number){
    super(x, y);
    this.layer = 1;
    this.tileMark = 16;
  }

  effect(playerTile?: any){
    this.tileMark = 0;
    playerTile.hasBow = true;

    return {"x": this.x, "y": this.y};
  }
}

class ArrowTile extends ItemTile{
  constructor(x: number, y: number, tileMark: number){
    super(x, y);
    this.layer = 1;
    this.tileMark = tileMark;
  }
}

class BorderTile extends RotationTile{
  constructor(x: number, y: number, rotation: number){
    super(x, y, rotation);
    this.layer = 1;
    this.tileMark = 1 + rotation;
  }
}

class BorderCornerTile extends RotationTile{
    constructor(x: number, y: number, rotation: number){
      super(x, y, rotation);
      this.layer = 1;
      this.tileMark = 5 + rotation;
    }
}

class MobTile extends Tile{
  protected hp = 100;

  constructor(x: number, y: number){
    super(x, y);
    this.layer = 1;
  }

  getHp(){
    return this.hp;
  }

  setHp(hp: number){
    this.hp = hp;
  }
}

class ShadowMobTile extends MobTile{
  constructor(x: number, y: number){
    super(x, y);
    this.tileMark = 40;
  }
}
