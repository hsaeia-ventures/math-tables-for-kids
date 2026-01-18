import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private sounds: Map<string, Howl> = new Map();

  constructor() {
    this.loadSound('click', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    this.loadSound('success', 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    this.loadSound('failure', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    this.loadSound('complete', 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3');
  }

  private loadSound(key: string, url: string): void {
    this.sounds.set(
      key,
      new Howl({
        src: [url],
        preload: true,
      })
    );
  }

  play(key: 'click' | 'success' | 'failure' | 'complete'): void {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.play();
    }
  }
}
