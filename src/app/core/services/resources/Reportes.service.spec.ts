/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReportesService } from './Reportes.service';

describe('Service: Reportes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportesService]
    });
  });

  it('should ...', inject([ReportesService], (service: ReportesService) => {
    expect(service).toBeTruthy();
  }));
});
