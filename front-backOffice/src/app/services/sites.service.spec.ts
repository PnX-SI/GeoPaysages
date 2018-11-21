import { TestBed } from '@angular/core/testing';

import { SitesService } from './sites.service';

describe('SitesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SitesService = TestBed.get(SitesService);
    expect(service).toBeTruthy();
  });
});
