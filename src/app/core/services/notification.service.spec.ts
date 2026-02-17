import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('NotificationService', () => {
   let service: NotificationService;

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [NotificationService],
      });
      service = TestBed.inject(NotificationService);
   });

   it('should be created with no notifications', () => {
      expect(service).toBeTruthy();
      expect(service.notifications()).toEqual([]);
   });

   it('should add a notification when show() is called', () => {
      service.show('Test message', 'error');

      const notifications = service.notifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Test message');
      expect(notifications[0].type).toBe('error');
   });

   it('should default to "info" type when no type is provided', () => {
      service.show('Info message');

      expect(service.notifications()[0].type).toBe('info');
   });

   it('should support multiple notifications at once', () => {
      service.show('First', 'error');
      service.show('Second', 'success');
      service.show('Third', 'info');

      expect(service.notifications().length).toBe(3);
      expect(service.notifications()[0].message).toBe('First');
      expect(service.notifications()[1].message).toBe('Second');
      expect(service.notifications()[2].message).toBe('Third');
   });

   it('should remove a notification when dismiss() is called', () => {
      service.show('To dismiss', 'error');
      const id = service.notifications()[0].id;

      service.dismiss(id);

      expect(service.notifications().length).toBe(0);
   });

   it('should only dismiss the targeted notification', () => {
      service.show('Keep', 'info');
      service.show('Remove', 'error');
      const removeId = service.notifications()[1].id;

      service.dismiss(removeId);

      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].message).toBe('Keep');
   });

   it('should auto-dismiss notifications after 4 seconds', () => {
      vi.useFakeTimers();

      service.show('Auto dismiss', 'success');
      expect(service.notifications().length).toBe(1);

      vi.advanceTimersByTime(4000);

      expect(service.notifications().length).toBe(0);

      vi.useRealTimers();
   });
});

