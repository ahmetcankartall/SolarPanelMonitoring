import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' ||
                     sessionStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  // Rol kontrolü
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles) {
    const currentUser = authService.currentUser;
    if (!currentUser || !requiredRoles.includes(currentUser.role)) {
      router.navigate(['/home']);
      return false;
    }
  }

  return true;
};
