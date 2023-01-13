/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EmpleadosService } from './Empleados.service';

describe('Service: Empleados', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmpleadosService]
    });
  });

  it('should ...', inject([EmpleadosService], (service: EmpleadosService) => {
    expect(service).toBeTruthy();
  }));
});
