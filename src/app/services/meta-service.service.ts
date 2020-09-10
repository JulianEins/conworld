import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService { 
  constructor(private meta: Meta) {
    meta.addTag({name: 'viewport', content: 'width=device-width, initial-scale=1'})
  }

} 
