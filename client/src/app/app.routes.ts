import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { ProblemComponent } from './problem/problem.component';
import { ProblemsetComponent } from './problemset/problemset.component';
import { authGuard } from './auth/auth.guard';
import { homeGuard } from './home/home.guard';
import { SubmissionsComponent } from './submissions/submissions.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [homeGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard], 
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'problemset'
      },
      {
        path: 'problemset',
        component: ProblemsetComponent
      },
      {
        path: 'problem/:problemName',
        component: ProblemComponent
      },
      {
        path: 'submissions/:problemName',
        component: SubmissionsComponent
      }
    ]
  }
];
