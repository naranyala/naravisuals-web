import { Pipe, type PipeTransform, Injectable } from '@angular/core';
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercent,
  formatCompact,
  formatCurrency,
  formatSpeed,
} from '../utils/format.utils';
import { formatDate, formatTime, formatDateTime, formatRelativeTime } from '../utils/time.utils';

/**
 * Format bytes to human-readable string
 * Usage: {{ 1234567 | formatBytes }} or {{ 1234567 | formatBytes:1 }}
 */
@Pipe({
  name: 'formatBytes',
  standalone: true,
})
export class FormatBytesPipe implements PipeTransform {
  transform(bytes: number, decimals = 2): string {
    return formatBytes(bytes, decimals);
  }
}

/**
 * Format duration in milliseconds
 * Usage: {{ 1234567 | formatDuration }}
 */
@Pipe({
  name: 'formatDuration',
  standalone: true,
})
export class FormatDurationPipe implements PipeTransform {
  transform(ms: number): string {
    return formatDuration(ms);
  }
}

/**
 * Format number with locale
 * Usage: {{ 1234567.89 | formatNumber }} or {{ 1234567.89 | formatNumber:'de-DE' }}
 */
@Pipe({
  name: 'formatNumber',
  standalone: true,
})
export class FormatNumberPipe implements PipeTransform {
  transform(num: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string {
    return formatNumber(num, locale, options);
  }
}

/**
 * Format as percentage
 * Usage: {{ 0.75 | formatPercent }} or {{ 0.75 | formatPercent:2 }}
 */
@Pipe({
  name: 'formatPercent',
  standalone: true,
})
export class FormatPercentPipe implements PipeTransform {
  transform(value: number, decimals = 1): string {
    return formatPercent(value, decimals);
  }
}

/**
 * Format with compact notation (1.5K, 2.3M)
 * Usage: {{ 1500 | formatCompact }} or {{ 1500 | formatCompact:2 }}
 */
@Pipe({
  name: 'formatCompact',
  standalone: true,
})
export class FormatCompactPipe implements PipeTransform {
  transform(num: number, decimals = 1): string {
    return formatCompact(num, decimals);
  }
}

/**
 * Format currency
 * Usage: {{ 1234.56 | formatCurrency }} or {{ 1234.56 | formatCurrency:'EUR':'de-DE' }}
 */
@Pipe({
  name: 'formatCurrency',
  standalone: true,
})
export class FormatCurrencyPipe implements PipeTransform {
  transform(amount: number, currency = 'USD', locale = 'en-US'): string {
    return formatCurrency(amount, currency, locale);
  }
}

/**
 * Format speed (bytes per second)
 * Usage: {{ 1234567 | formatSpeed }}
 */
@Pipe({
  name: 'formatSpeed',
  standalone: true,
})
export class FormatSpeedPipe implements PipeTransform {
  transform(bytesPerSecond: number, decimals = 2): string {
    return formatSpeed(bytesPerSecond, decimals);
  }
}

/**
 * Format date
 * Usage: {{ date | formatDate }} or {{ date | formatDate:'long' }}
 */
@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  transform(date: Date | string | number, format: 'short' | 'medium' | 'long' | 'full' | 'iso' | 'relative' = 'medium', locale = 'en-US'): string {
    return formatDate(date, format, locale);
  }
}

/**
 * Format time
 * Usage: {{ date | formatTime }} or {{ date | formatTime:true:true }}
 */
@Pipe({
  name: 'formatTime',
  standalone: true,
})
export class FormatTimePipe implements PipeTransform {
  transform(date: Date | string | number, showSeconds = false, hour12 = true, locale = 'en-US'): string {
    return formatTime(date, showSeconds, hour12, locale);
  }
}

/**
 * Format date and time
 * Usage: {{ date | formatDateTime }}
 */
@Pipe({
  name: 'formatDateTime',
  standalone: true,
})
export class FormatDateTimePipe implements PipeTransform {
  transform(date: Date | string | number, locale = 'en-US'): string {
    return formatDateTime(date, locale);
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * Usage: {{ date | formatRelativeTime }}
 */
@Pipe({
  name: 'formatRelativeTime',
  standalone: true,
})
export class FormatRelativeTimePipe implements PipeTransform {
  transform(date: Date | string | number, locale = 'en-US'): string {
    return formatRelativeTime(date, locale);
  }
}

/**
 * Format number with thousand separators (simpler alternative to FormatNumberPipe)
 * Usage: {{ 1234567 | numberFormat }} -> '1,234,567'
 */
@Pipe({
  name: 'numberFormat',
  standalone: true,
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string, locale: string = 'en-US'): string {
    if (value == null || value === '') {
      return '';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (Number.isNaN(num)) {
      return String(value);
    }

    return num.toLocaleString(locale);
  }
}

/**
 * Filters an array by a search term
 * Usage: {{ items | filterBy: searchTerm : 'name' }}
 */
@Pipe({
  name: 'filterBy',
  standalone: true,
  pure: false, // Non-pure pipe to detect array changes
})
export class FilterByPipe implements PipeTransform {
  transform<T extends Record<string, any>>(
    items: T[],
    searchTerm: string,
    property?: keyof T
  ): T[] {
    if (!items || !searchTerm) {
      return items;
    }

    const term = searchTerm.toLowerCase();

    return items.filter(item => {
      if (property) {
        return String(item[property]).toLowerCase().includes(term);
      }

      // Search all properties
      return Object.values(item).some(value => String(value).toLowerCase().includes(term));
    });
  }
}

/**
 * All format pipes bundled together for easy import
 * Usage: import { FormatPipes } from './pipes/format.pipes';
 */
export const FormatPipes = [
  FormatBytesPipe,
  FormatDurationPipe,
  FormatNumberPipe,
  FormatPercentPipe,
  FormatCompactPipe,
  FormatCurrencyPipe,
  FormatSpeedPipe,
  FormatDatePipe,
  FormatTimePipe,
  FormatDateTimePipe,
  FormatRelativeTimePipe,
  NumberFormatPipe,
  FilterByPipe,
];
