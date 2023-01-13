/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProveedoresService } from './Proveedores.service';

describe('Service: Proveedores', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProveedoresService]
    });
  });

  it('should ...', inject([ProveedoresService], (service: ProveedoresService) => {
    expect(service).toBeTruthy();
  }));
});
