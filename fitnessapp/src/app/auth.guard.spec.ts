import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { AuthGuard } from './auth.guard'; // Ensure the correct case is used.

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuard); // Inject the guard if using Dependency Injection
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
