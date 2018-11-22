import { TestBed } from '@angular/core/testing';

import { LgoinService } from './lgoin.service';

describe('LgoinService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LgoinService = TestBed.get(LgoinService);
    expect(service).toBeTruthy();
  });
});
