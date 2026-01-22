import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqHeroComponent } from './faq-hero.component';

describe('FaqHeroComponent', () => {
  let component: FaqHeroComponent;
  let fixture: ComponentFixture<FaqHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
