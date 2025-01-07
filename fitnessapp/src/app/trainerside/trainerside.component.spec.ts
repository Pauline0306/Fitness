import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersideComponent } from './trainerside.component';

describe('TrainersideComponent', () => {
  let component: TrainersideComponent;
  let fixture: ComponentFixture<TrainersideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainersideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainersideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
