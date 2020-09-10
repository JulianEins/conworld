import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  readonly GAME_SERVER_URL_LOCALHOST = "ws://localhost:3000";

  /* MESSAGE TYPES */
  readonly GAME_CONTENT     = "GAME_CONTENT";
  readonly CREATE_GAME      = "CREATE_GAME";
  readonly REMOVE_GAME      = "REMOVE_GAME";
  readonly JOIN_GAME        = "JOIN_GAME";
  readonly OPEN_GAME        = "OPEN_GAME";
  readonly CHAT_MESSAGE     = "CHAT_MESSAGE";
  readonly LEAVE_GAME       = "LEAVE_GAME";
  readonly TILES            = "TILES";
  readonly MAPS             = "MAPS";
  readonly ENEMY_LEFT       = "ENEMY_LEFT";
  readonly PLAYER_MOVED     = "PLAYER_MOVED";
  readonly ITEM_TRIGGER     = "ITEM_TRIGGER";
  readonly BOWSHOT          = "BOWSHOT";

  readonly BAD_MSG ="Bad message -> Skip it";

  public connection: WebSocket;

  constructor() { }

  openConnectionToGameServer(){
    this.connection = new WebSocket(this.GAME_SERVER_URL_LOCALHOST);
    this.connection.onopen = () => this.connection.send(JSON.stringify({"type":this.GAME_CONTENT}));
  }

  createGame(nickname: string, roomName: string){
    this.connection.send(JSON.stringify({"type":     this.CREATE_GAME,
                                         "nickname": nickname,
                                         "roomName": roomName}));
  }

  joinGame(nickname: string, roomName: string){
    this.connection.send(JSON.stringify({"type":     this.JOIN_GAME,
                                         "nickname": nickname,
                                         "roomName": roomName}));
  }

  sendMove(directions: any){
    this.connection.send(JSON.stringify({"type": this.PLAYER_MOVED,
                                         "directions": directions}));
  }

  sendItemTrigger(coordsOfItem: any){
    this.connection.send(JSON.stringify({"type": this.ITEM_TRIGGER,
                                         "coords": coordsOfItem}));
  }

  sendBowshot(x: number, y: number, tileMark: number){
    this.connection.send(JSON.stringify({"type": this.BOWSHOT,
                                         "coords": {"x": x, "y": y},
                                         "tileMark": tileMark}));
  }

}
