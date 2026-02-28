// src/components/Breadcrumb.tsx

import clsx from 'clsx';
import { css } from 'goober';
import { defineComponent, type PropType } from 'vue';

const styles = {
  breadcrumb: css`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 8px 0;
  `,

  item: css<{ isLast: boolean }>`
    display: inline-flex;
    align-items: center;
    color: ${(props) => (props.isLast ? '#111827' : '#6b7280')};
    font-weight: ${(props) => (props.isLast ? 500 : 400)};
    font-size: 14px;

    &:not(:last-child)::after {
      content: '/';
      margin: 0 8px;
      color: #d1d5db;
    }
  `,

  link: css<{ isLast: boolean }>`
    text-decoration: none;
    color: ${(props) => (props.isLast ? 'inherit' : '#3b82f6')};
    cursor: ${(props) => (props.isLast ? 'default' : 'pointer')};

    &:hover {
      text-decoration: ${(props) => (props.isLast ? 'none' : 'underline')};
    }
  `,

  icon: css`
    margin-right: 6px;
    font-size: 12px;
  `,
};

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string | 'slash' | 'chevron';
}

export const Breadcrumb = defineComponent({
  name: 'Breadcrumb',
  props: {
    items: {
      type: Array as PropType<BreadcrumbItem[]>,
      required: true,
    },
    separator: {
      type: String,
      default: 'slash',
    },
  },
  render() {
    const lastIndex = this.items.length - 1;

    return (
      <nav class={styles.breadcrumb} aria-label="Breadcrumb">
        {this.items.map((item, index) => {
          const isLast = index === lastIndex;

          const content = (
            <>
              {item.icon && <i class={cx(item.icon, styles.icon)} />}
              {item.label}
            </>
          );

          if (isLast || !item.href) {
            return (
              <span
                class={styles.item({ isLast })}
                aria-current={isLast ? 'page' : undefined}
              >
                {content}
              </span>
            );
          }

          return (
            <div class={styles.item({ isLast })}>
              <a
                class={styles.link({ isLast })}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
              >
                {content}
              </a>
            </div>
          );
        })}
      </nav>
    );
  },
});
