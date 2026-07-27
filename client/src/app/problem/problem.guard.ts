import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProblemService } from './problem.service';
import { catchError, map, of } from 'rxjs';

export const problemExistsGuard: CanActivateFn = (route) => {
	const problemService = inject(ProblemService);
  const router = inject(Router);
  const name = route.params['problemName'];
  if (!name) {
    return router.createUrlTree(['/']);
  }
  return problemService.getProblem(name).pipe(
    map(problem => {
      return problem.name !== 'NA'
        ? true
        : router.createUrlTree(['/not-found']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/not-found']));
    })
  );
};