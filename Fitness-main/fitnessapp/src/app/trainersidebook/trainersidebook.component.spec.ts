import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersidebookComponent } from './trainersidebook.component';

describe('TrainersidebookComponent', () => {
  let component: TrainersidebookComponent;
  let fixture: ComponentFixture<TrainersidebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainersidebookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainersidebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
