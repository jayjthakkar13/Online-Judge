import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { ProblemComponent } from './problem/problem.component';
import { ProblemsetComponent } from './problemset/problemset.component';
import { isAuthenticatedGuard, isUnauthenticatedGuard } from './auth/auth.guard';
import { SubmissionsComponent } from './submissions/submissions.component';
import { LandingComponent } from './landing/landing.component';
import { AdminComponent } from './admin/admin.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { isAdminGuard, isUserGuard } from './admin/admin.guard';
import { problemExistsGuard } from './problem/problem.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingComponent,
    canMatch: [isUnauthenticatedGuard]
  },
  {
    path: '',
    component: HomeComponent,
    canMatch: [isAuthenticatedGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AdminComponent,
        canMatch: [isAdminGuard]
      },
      {
        path: '',
        pathMatch: 'full',
        component: ProblemsetComponent,
      },
      {
        path: 'problem/:problemName',
        pathMatch: 'full',
        component: ProblemComponent,
        canActivate: [problemExistsGuard],
        canMatch: [isUserGuard]
      },
      {
        path: 'submissions/:problemName',
        pathMatch: 'full',
        component: SubmissionsComponent,
        canActivate: [problemExistsGuard],
        canMatch: [isUserGuard]
      }
    ]
  },
  {
    path: 'auth',
    component: HomeComponent,
    canMatch: [isUnauthenticatedGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AuthComponent
      }
    ]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
