// ModalFullScreenDarkMotionOne.jsx
import { defineComponent, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { css } from 'goober';
import clsx from 'clsx';
import { animate } from 'motion';



export default defineComponent({
  name: 'ModalFullscreen',
  props: {
    modelValue: { type: Boolean, required: true },
    closeOnBackdrop: { type: Boolean, default: true },
    teleportToBody: { type: Boolean, default: true },
    title: { type: String, default: '' },
    compact: { type: Boolean, default: false },
    className: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'close', 'open'],
  setup(props, { emit, slots }) {
    const isRendered = ref(props.modelValue); // controls actual render for exit animation
    const backdropRef = ref(null);
    const dialogRef = ref(null);
    let backdropAnim = null;
    let dialogAnim = null;

    const playEnter = async () => {
      // ensure elements exist
      await nextTick();
      const b = backdropRef.value;
      const d = dialogRef.value;
      if (!b || !d) return;

      // reset any inline styles from previous runs
      b.style.opacity = '0';
      d.style.opacity = '0';
      d.style.transform = 'translateY(18px) scale(0.995)';

      // backdrop fade in
      backdropAnim = animate(
        b,
        { opacity: [0, 1] },
        { duration: 0.22, easing: 'ease-in-out' }
      );

      // dialog slide/scale in
      dialogAnim = animate(
        d,
        { opacity: [0, 1], transform: ['translateY(18px) scale(0.995)', 'translateY(0px) scale(1)'] },
        { duration: 0.28, easing: [0.2, 0.9, 0.2, 1] }
      );

      // lock body scroll
      document.body.style.overflow = 'hidden';
    };

    const playExit = async () => {
      const b = backdropRef.value;
      const d = dialogRef.value;
      if (!b || !d) {
        // fallback: immediately unrender
        isRendered.value = false;
        document.body.style.overflow = '';
        return;
      }

      // cancel previous animations if running
      try { backdropAnim?.cancel(); dialogAnim?.cancel(); } catch (e) {}

      // play exit animations and wait for them to finish
      const p1 = animate(b, { opacity: [1, 0] }, { duration: 0.22, easing: 'ease-in-out' }).finished;
      const p2 = animate(
        d,
        { opacity: [1, 0], transform: ['translateY(0px) scale(1)', 'translateY(12px) scale(0.995)'] },
        { duration: 0.22, easing: 'ease-in-out' }
      ).finished;

      try {
        await Promise.all([p1, p2]);
      } catch (e) {
        // ignore animation errors
      } finally {
        // cleanup and unrender
        isRendered.value = false;
        document.body.style.overflow = '';
      }
    };

    // watch modelValue to mount/unmount with animation
    watch(
      () => props.modelValue,
      (visible) => {
        if (visible) {
          isRendered.value = true;
          // nextTick to ensure DOM nodes exist before animating
          nextTick().then(playEnter);
          emit('open');
        } else {
          // play exit then unmount
          playExit();
          emit('close', 'programmatic');
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      // ensure body scroll restored
      document.body.style.overflow = '';
      try { backdropAnim?.cancel(); dialogAnim?.cancel(); } catch (e) {}
    });

    const onBackdropClick = (e) => {
      if (!props.closeOnBackdrop) return;
      if (e.target === e.currentTarget) {
        emit('update:modelValue', false);
        emit('close', 'backdrop');
      }
    };

    return () => {
      if (!isRendered.value) return null;

      const content = (
        <div
          ref={backdropRef}
          class={styles.backdrop}
          onClick={onBackdropClick}
        >
          <div ref={dialogRef} class={clsx(styles.dialog, props.className)}>
            <div class={styles.header}>
              <button
                type="button"
                class={styles.backButton}
                onClick={() => {
                  emit('update:modelValue', false);
                  emit('close', 'back-button');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <div class={styles.titleWrap}>
                {slots.header ? slots.header() : <h3 class={styles.title}>{props.title}</h3>}
              </div>
            </div>

            <div class={clsx(styles.body, props.compact && styles.compactBody)}>
              {slots.default ? slots.default() : null}
            </div>
          </div>
        </div>
      );

      return props.teleportToBody ? <teleport to="body">{content}</teleport> : content;
    };
  },
});


const styles = {
  backdrop: css`
    position: fixed;
    inset: 0;
    background: rgba(2,6,23,0.75);
    display: flex;
    align-items: stretch;
    justify-content: center;
    z-index: 1200;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  `,
  dialog: css`
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, #071025 0%, #04121a 100%);
    color: #e6eef8;
    border-radius: 0;
    box-shadow: none;
    overflow: auto;
    border: none;
    display: flex;
    flex-direction: column;
    -webkit-tap-highlight-color: transparent;
  `,
  header: css`
    height: 64px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    background: linear-gradient(180deg, rgba(6,18,30,0.92), rgba(4,10,18,0.92));
    flex: 0 0 64px;
  `,
  backButton: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #cfe7ff;
    transition: background 120ms ease, transform 120ms ease;
    &:hover { background: rgba(255,255,255,0.03); transform: translateX(-2px); }
    svg { display: block; }
  `,
  titleWrap: css`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  `,
  title: css`
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #e6f0ff;
  `,
  body: css`
    padding: 20px;
    flex: 1 1 auto;
    overflow: auto;
    font-size: 14px;
    color: #d7e7fb;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00));
  `,
  compactBody: css`
    padding: 12px;
  `,
};
