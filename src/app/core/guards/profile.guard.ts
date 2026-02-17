import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const profileGuard: CanActivateFn = () => {
   const storage = inject(StorageService);
   const router = inject(Router);

   if (storage.activeProfile()) {
      return true;
   } else {
      router.navigate(['/profile-select']);
      return false;
   }
};
