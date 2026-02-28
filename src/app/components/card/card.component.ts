import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Card {
  title: string;
  description: string;
  icon: string;
  color: string;
  content?: string;
  link?: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input({ required: true }) card!: Card;
  @Output() cardClick = new EventEmitter<Card>();

  onClick(): void {
    this.cardClick.emit(this.card);
  }
}
