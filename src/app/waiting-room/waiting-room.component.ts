import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { ConnectionService } from '../services/connection.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  templateUrl: './waiting-room.component.html?v=${new Date().getTime()}',
  styleUrls: ['./waiting-room.component.css?v=${new Date().getTime()}']
})
export class WaitingRoomComponent implements OnInit {

  constructor(private gameService: GameService, 
              private conService: ConnectionService, 
              private router: Router) {

    this.setConHandler();
   
  }

  ngOnInit() {
  }

  setConHandler(){
    var _this = this;

    this.conService.connection.onmessage = function (message){
      var data = JSON.parse(message.data);

      switch(data.type){
        case _this.conService.OPEN_GAME: _this.enemyJoined(data);
                                         break;
        default: console.log(_this.conService.BAD_MSG);
      }
    };
  }

  enemyJoined(data: any){
    this.gameService.setEnemyName(data.enemy);
    this.navToLevel();
  }

  navToLevel(){
    this.router.navigate(["level"]);
  }

}
