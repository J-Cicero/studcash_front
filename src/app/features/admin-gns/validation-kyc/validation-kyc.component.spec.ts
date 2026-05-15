import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationKycComponent } from './validation-kyc.component';

describe('ValidationKycComponent', () => {
  let component: ValidationKycComponent;
  let fixture: ComponentFixture<ValidationKycComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationKycComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationKycComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
