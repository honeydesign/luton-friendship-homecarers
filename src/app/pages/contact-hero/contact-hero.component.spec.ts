import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactHeroComponent } from './contact-hero.component';

describe('ContactHeroComponent', () => {
  let component: ContactHeroComponent;
  let fixture: ComponentFixture<ContactHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
