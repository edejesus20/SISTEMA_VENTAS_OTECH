/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MoverSedeComponent } from './moverSede.component';

describe('MoverSedeComponent', () => {
  let component: MoverSedeComponent;
  let fixture: ComponentFixture<MoverSedeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoverSedeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoverSedeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
