import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Card, CardComponent } from '../card/card.component';

export type { Card };

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss',
})
export class CardListComponent {
  @Input({ required: true }) cards: Card[] = [];
  @Output() cardClick = new EventEmitter<Card>();

  searchQuery = signal('');

  filteredCards = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.cards;
    }
    return this.cards.filter(
      (card) =>
        card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query)
    );
  });

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onCardClick(card: Card): void {
    this.cardClick.emit(card);
  }
}
