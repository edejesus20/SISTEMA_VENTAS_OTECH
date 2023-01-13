/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CajaService } from './Caja.service';

describe('Service: Caja', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CajaService]
    });
  });

  it('should ...', inject([CajaService], (service: CajaService) => {
    expect(service).toBeTruthy();
  }));
});
