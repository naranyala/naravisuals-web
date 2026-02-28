import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type CardCategory } from '../card-list/card-list.component';

export interface Card {
  title: string;
  description: string;
  icon: string;
  color: string;
  content?: string;
  link?: string;
  category: CardCategory;
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
