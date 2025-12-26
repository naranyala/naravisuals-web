import { defineComponent, inject, ref } from 'vue';
import { type PropType } from 'vue';

import { css, keyframes } from 'goober';
import clsx from 'clsx';
import { Theme } from '../theme';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const styles = {
  overlay: (theme: Theme) => css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${fadeIn} 0.3s ease-out;
  `,
  content: (theme: Theme, hasError: boolean) => css`
    background: ${theme.colors.background};
    padding: 24px;
    border-radius: ${theme.radii};
    box-shadow: ${theme.shadows};
    max-width: 400px;
    width: 100%;
    border: 2px solid ${hasError ? '#dc3545' : 'transparent'};
    & h2 {
      color: ${theme.colors.text};
      margin-top: 0;
    }
    & button.close {
      position: absolute;
      top: 8px;
      right: 12px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
  `,
};

interface ModalProps {
  open: boolean;
  hasError?: boolean;
  onClose: () => void;
}

export default defineComponent({
  props: {
    open: { type: Boolean, required: true },
    hasError: { type: Boolean, default: false },
    onClose: { type: Function as PropType<ModalProps['onClose']>, required: true },
  },
  setup(props, { slots }) {
    const theme = inject('theme') as Theme;
    const isVisible = ref(props.open);

    return () => props.open ? (
      <div class={styles.overlay(theme)} onClick={props.onClose}>
        <div
          class={clsx(styles.content(theme, !!props.hasError))}
          onClick={(e: Event) => e.stopPropagation()} // Prevent close on content click
        >
          <button class="close" onClick={props.onClose}>×</button>
          {slots.default?.()}
        </div>
      </div>
    ) : null;
  },
});
