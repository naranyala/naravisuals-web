import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type Card, CardComponent } from '../card/card.component';

export type { Card };

export type CardCategory = 'all' | 'state' | 'ui' | 'advanced' | 'forms' | 'performance';

export interface CategoryTab {
  id: CardCategory;
  label: string;
  icon: string;
}

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
  selectedCategory = signal<CardCategory>('all');

  readonly categories: CategoryTab[] = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'state', label: 'State', icon: '📦' },
    { id: 'ui', label: 'UI', icon: '🎨' },
    { id: 'advanced', label: 'Advanced', icon: '🚀' },
    { id: 'forms', label: 'Forms', icon: '📝' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
  ];

  filteredCards = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    
    let result = this.cards;
    
    // Filter by category
    if (category !== 'all') {
      result = result.filter((card) => card.category === category);
    }
    
    // Filter by search query
    if (query) {
      result = result.filter(
        (card) =>
          card.title.toLowerCase().includes(query) || 
          card.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  });

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  selectCategory(category: CardCategory): void {
    this.selectedCategory.set(category);
    this.searchQuery.set('');
  }

  onCardClick(card: Card): void {
    this.cardClick.emit(card);
  }
}
