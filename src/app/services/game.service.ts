import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private roomName: string;
  private playerName: string;
  private enemyName: string;
  
  private mapName: string;
  private mapNumber = 0;

  private playerRole: number;
  readonly roles = {
    ADMIN : 1,
    GUEST : 0
  }
 
  private life = 100;
  readonly MAX_LIFE = 100;

  private maps: Object[];

  readonly MUSIC_URL = "assets/music/gothic2khorinis.mp3";

  constructor() { }

  getPlayerName(): string {
    return this.playerName;
  }

  setPlayerName(playerName: string) {
    this.playerName = playerName;
  }

  getEnemyName(): string {
    return this.enemyName;
  }

  setEnemyName(enemyName: string) {
    this.enemyName = enemyName;
  }

  getRoomName(): string {
    return this.roomName;
  }

  setRoomName(roomName: string) {
    this.roomName = roomName;
  }

  getMapName(): string {
    return this.mapName;
  }

  setMapName(mapName) {
    this.mapName = mapName;
  }

  getPlayerRole(): number {
    return this.playerRole;
  }

  setPlayerRole(playerRole: number) {
    this.playerRole = playerRole;
  }

  getLife(): number {
    return this.life;
  }

  setLife(life: number) {
    this.life = life;
  }

  getMaps(): any[]{
    return this.maps;
  }

  setMaps(maps: any[]){
    this.maps = maps;
  }

  getMapNumber(): number{
    return this.mapNumber;
  }

  setMapNumber(mapNumber: number){
    this.mapNumber = mapNumber;
  }
}
