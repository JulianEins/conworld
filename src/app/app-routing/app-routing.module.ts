import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from '../app.component';
import { CommonModule } from '@angular/common';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { LevelComponent } from '../level/level.component';
import { WaitingRoomComponent } from '../waiting-room/waiting-room.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent},
  { path: 'level', component: LevelComponent},
  { path: 'waiting-room', component: WaitingRoomComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }
