import { Injectable, signal } from '@angular/core';

export interface Notification {
   id: number;
   message: string;
   type: 'error' | 'success' | 'info';
}

@Injectable({
   providedIn: 'root',
})
export class NotificationService {
   private nextId = 0;
   readonly notifications = signal<Notification[]>([]);

   show(message: string, type: 'error' | 'success' | 'info' = 'info'): void {
      const id = this.nextId++;
      this.notifications.update(list => [...list, { id, message, type }]);

      setTimeout(() => this.dismiss(id), 4000);
   }

   dismiss(id: number): void {
      this.notifications.update(list => list.filter(n => n.id !== id));
   }
}
