import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GnsAdminBoutiquesComponent } from './gns-admin-boutiques.component';

describe('GnsAdminBoutiquesComponent', () => {
  let component: GnsAdminBoutiquesComponent;
  let fixture: ComponentFixture<GnsAdminBoutiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GnsAdminBoutiquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GnsAdminBoutiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
