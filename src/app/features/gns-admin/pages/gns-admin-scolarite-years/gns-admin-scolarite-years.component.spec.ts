import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GnsAdminScolariteYearsComponent } from './gns-admin-scolarite-years.component';

describe('GnsAdminScolariteYearsComponent', () => {
  let component: GnsAdminScolariteYearsComponent;
  let fixture: ComponentFixture<GnsAdminScolariteYearsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GnsAdminScolariteYearsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GnsAdminScolariteYearsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
