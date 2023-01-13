/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HistorialMovimientoService } from './HistorialMovimiento.service';

describe('Service: HistorialMovimiento', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HistorialMovimientoService]
    });
  });

  it('should ...', inject([HistorialMovimientoService], (service: HistorialMovimientoService) => {
    expect(service).toBeTruthy();
  }));
});
