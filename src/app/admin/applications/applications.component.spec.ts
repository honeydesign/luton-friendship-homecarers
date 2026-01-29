import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminApplicationsComponent } from './applications.component';

describe('AdminApplicationsComponent', () => {
  let component: AdminApplicationsComponent;
  let fixture: ComponentFixture<AdminApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});