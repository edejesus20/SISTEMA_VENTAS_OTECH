/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CuotaVentasComponent } from './cuota-ventas.component';

describe('CuotaVentasComponent', () => {
  let component: CuotaVentasComponent;
  let fixture: ComponentFixture<CuotaVentasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuotaVentasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuotaVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
