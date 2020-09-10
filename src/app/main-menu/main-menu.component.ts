import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router';
import { ValidatorService } from '../services/validator.service';
import { GameService } from '../services/game.service';
import { ConnectionService } from '../services/connection.service';
import { TileService } from '../services/tile.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html?v=${new Date().getTime()}',
  styleUrls: ['./main-menu.component.css?v=${new Date().getTime()}']
})
export class MainMenuComponent implements OnInit {

  private nickname = "";
  private roomNameCreate = "";
  private roomNameJoin   = "";

  constructor(private router: Router, 
              private validator: ValidatorService,
              private gameService: GameService,
              private conService: ConnectionService,
              private tileService: TileService) { }

  ngOnInit() {
    this.conService.openConnectionToGameServer();
    this.setConHandler();
  }

  setConHandler(){
    var _this = this;

    this.conService.connection.onmessage = function (message){
      var data = JSON.parse(message.data);

      switch(data.type){
        case _this.conService.TILES:         _this.saveListOfTilemarksToBase64(data.tiles);
                                             break;
        case _this.conService.MAPS:          _this.saveMaps(data.maps);
                                             break;
        case _this.conService.CREATE_GAME:   _this.navToWaitingRoom();
                                             break;
        case _this.conService.JOIN_GAME:     _this.getGameInfoAndGoToMap(data);
                                             break;
        case _this.conService.OPEN_GAME:     _this.openGame(data);
                                             break;
        default: console.log(_this.conService.BAD_MSG);
      }
    };
  }
  
  saveListOfTilemarksToBase64(tiles: any){
    this.tileService.setListOfTilemarksToBase64(tiles);
  }

  saveMaps(maps: any){
    this.gameService.setMaps(maps);
  }

  tryJoinGame(){
    if(this.validator.validateNickname(this.nickname) && this.validator.validateRoomName(this.roomNameJoin)){
        this.setGameInfo(this.nickname, this.roomNameJoin); 
        this.conService.joinGame(this.nickname, this.roomNameJoin); 
    }
  }   

  getGameInfoAndGoToMap(data: any){
    if(data.type == this.conService.JOIN_GAME){
      this.gameService.setEnemyName(data.creator);
      this.navToLevel();
    }
  }

  tryCreateGame(){
      if(this.validator.validateRoomName(this.roomNameCreate) && this.validator.validateNickname(this.nickname)){
          this.createLocalGame(this.nickname, this.roomNameCreate);
          this.conService.createGame(this.nickname, this.roomNameCreate);
      }
  }

  setGameInfo(nickname: string, roomName: string){
    this.initGame(nickname, roomName);
    this.gameService.setPlayerRole(this.gameService.roles.GUEST);
  }

  createLocalGame(nickname: string, roomName: string){
    this.initGame(nickname, roomName);
    this.gameService.setPlayerRole(this.gameService.roles.ADMIN);
  }

  initGame(nickname: string, roomName: string){
    this.gameService.setPlayerName(nickname);
    this.gameService.setRoomName(roomName);
  }

  openGame(data: any){
    this.gameService.setEnemyName(data.creator);
    this.navToLevel();
  }

  navToLevel(){
    this.router.navigate(["level"]);
  }

  navToWaitingRoom(){
    this.router.navigate(["waiting-room"]);
  }

}
