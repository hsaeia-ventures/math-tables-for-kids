import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
   selector: 'app-toast',
   template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      @for (n of notify.notifications(); track n.id) {
        <div
          class="pointer-events-auto min-w-[280px] max-w-sm px-5 py-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-slide-in"
          [class]="typeClasses(n.type)"
          role="alert"
        >
          <span class="text-xl shrink-0">{{ typeIcon(n.type) }}</span>
          <p class="text-sm font-medium flex-1">{{ n.message }}</p>
          <button
            (click)="notify.dismiss(n.id)"
            class="shrink-0 text-white/50 hover:text-white text-lg leading-none"
            aria-label="Cerrar"
          >✕</button>
        </div>
      }
    </div>
  `,
   styles: `
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `,
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
   readonly notify = inject(NotificationService);

   typeClasses(type: 'error' | 'success' | 'info'): string {
      switch (type) {
         case 'error': return 'bg-red-900/80 border-red-500/60 text-red-100';
         case 'success': return 'bg-green-900/80 border-green-500/60 text-green-100';
         case 'info': return 'bg-blue-900/80 border-blue-500/60 text-blue-100';
      }
   }

   typeIcon(type: 'error' | 'success' | 'info'): string {
      switch (type) {
         case 'error': return '☄️';
         case 'success': return '🌟';
         case 'info': return '🛸';
      }
   }
}
