import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  validateNickname(nickname: string){
    if(nickname.length >= 3 && nickname.length <= 10 && !/[^a-zA-Z]/.test(nickname)){
        return true;
    }else{
        return false;
    }
  }

validateRoomName(roomName: string){
    if(roomName.length >= 3 && roomName.length <= 10 && !/[^a-zA-Z]/.test(roomName)){
        return true;
    }else{
        return false;
    }
  }
}
