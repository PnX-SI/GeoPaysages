import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservatoriesComponent } from './observatories.component';

describe('ObservatoriesComponent', () => {
  let component: ObservatoriesComponent;
  let fixture: ComponentFixture<ObservatoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservatoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservatoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
