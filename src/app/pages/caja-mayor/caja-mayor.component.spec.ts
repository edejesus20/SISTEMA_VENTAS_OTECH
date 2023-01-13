/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CajaMayorComponent } from './caja-mayor.component';

describe('CajaMayorComponent', () => {
  let component: CajaMayorComponent;
  let fixture: ComponentFixture<CajaMayorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CajaMayorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CajaMayorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
