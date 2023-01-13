import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInOut, MenuItemI } from './datamenu';

@Component({
  selector: 'app-subnivel-menu',
  template: `
  <ul *ngIf="collapsed && data.items && data.items.length > 0"
  [@submenu]="expanded ? {value:'visible',
  params:{transitionParams:'400ms cubic-bezier(0.86, 0, 0.07,1)'},height:'*'} : 
  {value:'hidden',params:{transitionParams:'400ms cubic-bezier(0.86, 0, 0.07,1)',height:'0'}}"
  class="subnivel-nav">
      <li *ngFor="let item of data.items" class="subnivel-nav-item">
            <a *ngIf="item.items && item.items.length > 0"
            class="subnivel-nav-link" (click)="handleClick(item)" [ngClass]="getActivateClass(item)">
            <i class="subnivel-nav-icon pi pi-home"></i>
            <span *ngIf="collapsed" @fadeInOut
            class="subnivel-nav-text">{{item.label}}</span>
            <i *ngIf="item.items && collapsed" 
            [ngClass]="!item.expanded ? 'oi pi-angle-down' : 'pi pi-angle-up'"
            class="menu-collapsed-icon"></i>
          </a>
          <a *ngIf="!item.items || (item.items && item.items.length === 0)"
            class="subnivel-nav-link" [routerLink]="item.routerLink"
            routerLinkActive="active-subnivel"
            [routerLinkActiveOptions]="{exact:true}">
            <i class="subnivel-nav-icon pi pi-home"></i>
            <span *ngIf="collapsed" @fadeInOut  
            class="subnivel-nav-text">{{item.label}}</span>
          </a>
          <div *ngIf="item.items && item.items.length > 0">
                <app-subnivel-menu [collapsed]="collapsed"
                [data]="item" 
                [multiple]="multiple"
                 [expanded]="item.expanded"
                ></app-subnivel-menu>
          </div>
      </li>
  </ul>
  `,
  styleUrls: ['./menu.component.scss'],
  animations:[
    fadeInOut,
    trigger('submenu',[
      state('hidden',
      style({
        height: '0',
        overflow: 'hidden'
      })),
      state('visible',
      style({
        height: '*',
      })),
      transition('visible <=> hidden',[
        style({ overflow: 'hidden'}),
        animate('{{transitionParams}}')
      ]),
      transition('void <=> *',[
        animate(0)
      ])
    ])
  ]
})
export class SubnivelMenuComponent implements OnInit {
  @Input() data:MenuItemI = {
    label:'',
    routerLink:'',
    icon:'',
    // expanded:'',
    items:[]
  }
  @Input() collapsed=false;
  @Input() animating?=false;
  @Input() expanded?=false;
  @Input() multiple=false;

  constructor(
    public router: Router,
  ){

  }
  ngOnInit(): void {
  }

  handleClick(item:any){

    if(!this.multiple){
      if(this.data.items && this.data.items.length > 0){
          for (let key of this.data.items) {
            if(item !== key && key.expanded){
              key.expanded=false
            }
          }
      }
    }
    item.expanded =!item.expanded;
  }

  getActivateClass(item: MenuItemI):string {
    return item.expanded && this.router.url.includes(
      item.routerLink
    )? 'active-subnivel' :''
  }
}
