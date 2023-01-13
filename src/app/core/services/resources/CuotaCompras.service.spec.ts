/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CuotaComprasService } from './CuotaCompras.service';

describe('Service: CuotaCompras', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CuotaComprasService]
    });
  });

  it('should ...', inject([CuotaComprasService], (service: CuotaComprasService) => {
    expect(service).toBeTruthy();
  }));
});
