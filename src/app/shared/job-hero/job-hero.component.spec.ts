import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobHeroComponent } from './job-hero.component';

describe('JobHeroComponent', () => {
  let component: JobHeroComponent;
  let fixture: ComponentFixture<JobHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
