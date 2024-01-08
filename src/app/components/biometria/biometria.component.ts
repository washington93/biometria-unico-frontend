import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-biometria',
  standalone: true,
  imports: [CommonModule],
  template: `<p>biometria works!</p>`,
  styleUrl: './biometria.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiometriaComponent {}
