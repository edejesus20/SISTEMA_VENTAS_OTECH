/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SedesComponent } from './sedes.component';

describe('SedesComponent', () => {
  let component: SedesComponent;
  let fixture: ComponentFixture<SedesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SedesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SedesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
