import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-star-background',
  template: `
    <div class="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden">
      <div class="stars overflow-hidden">
        @for (star of stars; track $index) {
          <div
            class="star absolute bg-white rounded-full opacity-0 animate-twinkle"
            [style.left.%]="star.x"
            [style.top.%]="star.y"
            [style.width.px]="star.size"
            [style.height.px]="star.size"
            [style.animation-delay.s]="star.delay"
            [style.animation-duration.s]="star.duration"
          ></div>
        }
      </div>
      <div class="shooting-stars">
        @for (sStar of shootingStars; track $index) {
          <div
            class="shooting-star absolute h-[2px] w-[100px] bg-gradient-to-r from-white to-transparent opacity-0 animate-shoot"
            [style.left.%]="sStar.x"
            [style.top.%]="sStar.y"
            [style.animation-delay.s]="sStar.delay"
            [style.animation-duration.s]="sStar.duration"
          ></div>
        }
      </div>
    </div>
  `,
  styles: `
    @keyframes twinkle {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes shoot {
      0% { transform: translateX(0) scaleX(0); opacity: 0; }
      10% { opacity: 0.7; }
      50% { transform: translateX(200px) scaleX(1); opacity: 0.2; }
      100% { transform: translateX(400px) scaleX(0); opacity: 0; }
    }
    .animate-twinkle {
      animation: twinkle infinite ease-in-out;
    }
    .animate-shoot {
      animation: shoot infinite linear;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarBackgroundComponent {
  stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  shootingStars = Array.from({ length: 5 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 20,
    duration: Math.random() * 2 + 1,
  }));
}
