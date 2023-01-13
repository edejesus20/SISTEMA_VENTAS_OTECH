/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TipoProductoService } from './tipoProducto.service';

describe('Service: TipoProducto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipoProductoService]
    });
  });

  it('should ...', inject([TipoProductoService], (service: TipoProductoService) => {
    expect(service).toBeTruthy();
  }));
});
