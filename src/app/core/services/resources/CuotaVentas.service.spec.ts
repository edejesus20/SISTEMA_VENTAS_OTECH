/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CuotaVentasService } from './CuotaVentas.service';

describe('Service: CuotaVentas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CuotaVentasService]
    });
  });

  it('should ...', inject([CuotaVentasService], (service: CuotaVentasService) => {
    expect(service).toBeTruthy();
  }));
});
