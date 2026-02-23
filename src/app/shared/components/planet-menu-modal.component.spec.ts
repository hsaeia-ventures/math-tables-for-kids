import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PlanetMenuModalComponent } from './planet-menu-modal.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentRef } from '@angular/core';

describe('PlanetMenuModalComponent', () => {
   let component: PlanetMenuModalComponent;
   let componentRef: ComponentRef<PlanetMenuModalComponent>;
   let fixture: ComponentFixture<PlanetMenuModalComponent>;

   beforeEach(() => {
      TestBed.configureTestingModule({
         imports: [PlanetMenuModalComponent],
      });

      fixture = TestBed.createComponent(PlanetMenuModalComponent);
      component = fixture.componentInstance;
      componentRef = fixture.componentRef;

      // Set required inputs
      componentRef.setInput('tableId', 5);
      componentRef.setInput('tableName', 'Tabla 5');
      componentRef.setInput('planetEmoji', '🍃');
      componentRef.setInput('planetColor', 'linear-gradient(135deg, #4ade80, #22c55e)');
      componentRef.setInput('isOpen', true);
      componentRef.setInput('trainingCompleted', false);

      fixture.detectChanges();
   });

   it('should create the component', () => {
      expect(component).toBeTruthy();
   });

   describe('Rendering when open', () => {
      it('should render the modal when isOpen is true', () => {
         const el = fixture.nativeElement as HTMLElement;
         const overlay = el.querySelector('#planet-menu-overlay');
         expect(overlay).toBeTruthy();
      });

      it('should display the planet name', () => {
         const el = fixture.nativeElement as HTMLElement;
         const h3 = el.querySelector('h3');
         expect(h3?.textContent?.trim()).toBe('Tabla 5');
      });

      it('should display the planet emoji', () => {
         const el = fixture.nativeElement as HTMLElement;
         const text = el.textContent;
         expect(text).toContain('🍃');
      });

      it('should show the Training button', () => {
         const el = fixture.nativeElement as HTMLElement;
         const btn = el.querySelector('#planet-menu-training-btn');
         expect(btn).toBeTruthy();
         expect(btn?.textContent).toContain('Entrenar');
      });

      it('should show the Mission button', () => {
         const el = fixture.nativeElement as HTMLElement;
         const btn = el.querySelector('#planet-menu-mission-btn');
         expect(btn).toBeTruthy();
         expect(btn?.textContent).toContain('Misión Real');
      });
   });

   describe('Rendering when closed', () => {
      it('should NOT render the modal when isOpen is false', () => {
         componentRef.setInput('isOpen', false);
         fixture.detectChanges();

         const el = fixture.nativeElement as HTMLElement;
         const overlay = el.querySelector('#planet-menu-overlay');
         expect(overlay).toBeFalsy();
      });
   });

   describe('Training completed badge', () => {
      it('should show "Completado" badge when trainingCompleted is true', () => {
         componentRef.setInput('trainingCompleted', true);
         fixture.detectChanges();

         const el = fixture.nativeElement as HTMLElement;
         const badge = el.querySelector('#training-completed-badge');
         expect(badge).toBeTruthy();
         expect(badge?.textContent?.trim()).toContain('Completado');
      });

      it('should NOT show badge when trainingCompleted is false', () => {
         componentRef.setInput('trainingCompleted', false);
         fixture.detectChanges();

         const el = fixture.nativeElement as HTMLElement;
         const badge = el.querySelector('#training-completed-badge');
         expect(badge).toBeFalsy();
      });
   });

   describe('Training encouragement', () => {
      it('should show encouragement text when NOT trained', () => {
         componentRef.setInput('trainingCompleted', false);
         fixture.detectChanges();

         const el = fixture.nativeElement as HTMLElement;
         const suggestion = el.querySelector('#training-suggestion');
         expect(suggestion).toBeTruthy();
         expect(suggestion?.textContent).toContain('Entrenar antes de la misión');
      });

      it('should NOT show encouragement text when trained', () => {
         componentRef.setInput('trainingCompleted', true);
         fixture.detectChanges();

         const el = fixture.nativeElement as HTMLElement;
         const suggestion = el.querySelector('#training-suggestion');
         expect(suggestion).toBeFalsy();
      });
   });

   describe('Output events', () => {
      it('should emit selectMode with "training" when training button is clicked', () => {
         const spy = vi.fn();
         component.selectMode.subscribe(spy);

         const el = fixture.nativeElement as HTMLElement;
         const btn = el.querySelector('#planet-menu-training-btn') as HTMLButtonElement;
         btn.click();

         expect(spy).toHaveBeenCalledWith('training');
      });

      it('should emit selectMode with "mission" when mission button is clicked', () => {
         const spy = vi.fn();
         component.selectMode.subscribe(spy);

         const el = fixture.nativeElement as HTMLElement;
         const btn = el.querySelector('#planet-menu-mission-btn') as HTMLButtonElement;
         btn.click();

         expect(spy).toHaveBeenCalledWith('mission');
      });

      it('should emit closeModal when close button is clicked', () => {
         const spy = vi.fn();
         component.closeModal.subscribe(spy);

         const el = fixture.nativeElement as HTMLElement;
         const btn = el.querySelector('#planet-menu-close-btn') as HTMLButtonElement;
         btn.click();

         expect(spy).toHaveBeenCalled();
      });

      it('should emit closeModal when clicking on overlay backdrop', () => {
         const spy = vi.fn();
         component.closeModal.subscribe(spy);

         const el = fixture.nativeElement as HTMLElement;
         const overlay = el.querySelector('#planet-menu-overlay') as HTMLElement;

         // Simulate click directly on overlay (not a child)
         overlay.click();

         expect(spy).toHaveBeenCalled();
      });
   });
});
