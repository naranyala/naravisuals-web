import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface CodeExample {
  filename: string;
  code: string;
  language?: string;
}

export interface TechDetail {
  title: string;
  description: string;
  color: string;
  icon: string;
  features: string[];
  codeExamples?: CodeExample[];
  link?: string;
}

@Component({
  selector: 'app-tech-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tech-detail.component.html',
  styleUrl: './tech-detail.component.scss',
})
export class TechDetailComponent {
  @Input({ required: true }) detail!: TechDetail;
}
