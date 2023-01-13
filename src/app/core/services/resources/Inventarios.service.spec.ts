/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { InventariosService } from './Inventarios.service';

describe('Service: Inventarios', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InventariosService]
    });
  });

  it('should ...', inject([InventariosService], (service: InventariosService) => {
    expect(service).toBeTruthy();
  }));
});
