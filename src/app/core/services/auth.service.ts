import { Injectable, inject, signal } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut, User } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private auth = inject(Auth);

   /**
    * Observable for reactive logic (backstage).
    * Ideal for triggering data fetches like profiles.
    */
   readonly user$ = authState(this.auth);

   /**
    * Signal for the UI (stage).
    * Provides a clean, synchronous API for templates.
    */
   readonly currentUser = toSignal(this.user$);

   async signInWithGoogle(): Promise<void> {
      const provider = new GoogleAuthProvider();
      try {
         await signInWithPopup(this.auth, provider);
      } catch (error) {
         console.error('Google Sign-in Error:', error);
         throw error;
      }
   }

   async logout(): Promise<void> {
      try {
         await signOut(this.auth);
      } catch (error) {
         console.error('Logout Error:', error);
         throw error;
      }
   }

   get isLoggedIn(): boolean {
      return !!this.currentUser();
   }
}
