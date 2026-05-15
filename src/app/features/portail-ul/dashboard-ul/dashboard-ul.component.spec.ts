import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUlComponent } from './dashboard-ul.component';

describe('DashboardUlComponent', () => {
  let component: DashboardUlComponent;
  let fixture: ComponentFixture<DashboardUlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
