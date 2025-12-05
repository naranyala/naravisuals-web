/* SlidingDrawer.jsx – Dark Edition */
import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue';
import { css } from 'goober';
import { animate } from 'motion';

/* ========== ALL STYLES (DARK THEME) GROUPED AT TOP ========== */
const styles = {
    backdrop: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 9998;
    display: none;
    opacity: 0;
  `,

    drawer: css`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #0f172a;                  /* slate-900/950 */
    color: #e2e8f0;                        /* slate-200 */
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.6);
    max-height: var(--max-height, 90vh);
    width: 100%;
    z-index: 9999;
    overflow-y: auto;
    display: none;
    transform: translateY(100%);

    /* Dark handle */
    &::before {
      content: '';
      display: block;
      width: 44px;
      height: 5px;
      background: #475569;                 /* slate-500 */
      border-radius: 3px;
      margin: 14px auto;
    }
  `,

    content: css`
    padding: 0 1.5rem 2rem;
  `,
};

/* ========== SLIDING DRAWER COMPONENT ========== */
const SlidingDrawer = defineComponent({
    name: 'SlidingDrawer',
    props: {
        modelValue: { type: Boolean, default: false },
        maxHeight: { type: String, default: '90vh' },
    },
    emits: ['update:modelValue'],

    setup(props, { slots, emit }) {
        const isOpen = ref(props.modelValue);
        const drawerRef = ref(null);
        const backdropRef = ref(null);

        // v-model sync
        watch(() => props.modelValue, (v) => { if (v !== isOpen.value) isOpen.value = v; });
        watch(isOpen, (v) => emit('update:modelValue', v));

        const performOpen = async () => {
            const drawer = drawerRef.value;
            const backdrop = backdropRef.value;
            if (!drawer || !backdrop) return;

            drawer.style.setProperty('--max-height', props.maxHeight);
            drawer.style.display = 'block';
            backdrop.style.display = 'block';

            await new Promise(r => setTimeout(r, 10)); // force reflow

            animate(backdrop, { opacity: [0, 1] }, { duration: 0.28 });
            animate(drawer, { transform: ['translateY(100%)', 'translateY(0)'] }, {
                duration: 0.38,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            });
        };

        const performClose = async () => {
            const drawer = drawerRef.value;
            const backdrop = backdropRef.value;
            if (!drawer || !backdrop) return;

            await Promise.all([
                animate(backdrop, { opacity: 0 }, { duration: 0.22 }).finished,
                animate(drawer, { transform: 'translateY(100%)' }, {
                    duration: 0.32,
                    easing: 'cubic-bezier(0.55, 0, 1, 0.45)',
                }).finished,
            ]);

            drawer.style.display = 'none';
            backdrop.style.display = 'none';
        };

        // React to isOpen changes
        watch(isOpen, (open) => (open ? performOpen() : performClose()));

        // Close on backdrop click or Escape
        const handleBackdrop = (e) => e.target === backdropRef.value && (isOpen.value = false);
        const handleEsc = (e) => e.key === 'Escape' && isOpen.value && (isOpen.value = false);

        onMounted(() => {
            window.addEventListener('keydown', handleEsc);
            if (isOpen.value) performOpen();
        });
        onUnmounted(() => window.removeEventListener('keydown', handleEsc));

        return () => (
            <>
                <div ref={backdropRef} class={styles.backdrop} onClick={handleBackdrop} />
                <div ref={drawerRef} class={styles.drawer}>
                    <div class={styles.content}>{slots.default?.()}</div>
                </div>
            </>
        );
    },
});

/* ========== DEMO PAGE (DARK THEME) ========== */
export default {
    setup() {
        const open = ref(false);

        return () => (
            <div style={{
                minHeight: '100vh',
                background: '#020617',               /* slate-950 */
                color: '#cbd5e1',                     /* slate-300 */
                padding: '3rem',
                fontFamily: 'system-ui, sans-serif',
            }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
                    Dark Sliding Drawer
                </h1>

                <button
                    onClick={() => (open.value = true)}
                    style={{
                        padding: '16px 36px',
                        fontSize: '1.2rem',
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid #475569',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                    }}
                >
                    Open Drawer
                </button>

                <SlidingDrawer v-model={open.value} maxHeight="88vh">
                    <div style={{ paddingTop: '1rem' }}>
                        <h2 style={{ fontSize: '2rem', margin: '0 0 1.5rem', color: '#f8fafc' }}>
                            Settings
                        </h2>
                        <p style={{ lineHeight: 1.7, color: '#94a3b8', marginBottom: '2rem' }}>
                            Pure dark-mode bottom sheet with Motion One animations. Looks perfect on OLED.
                        </p>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <button
                                onClick={() => (open.value = false)}
                                style={{
                                    padding: '14px 32px',
                                    background: '#0ea5e9',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
                                }}
                            >
                                Close Drawer
                            </button>

                            <button
                                style={{
                                    padding: '14px 32px',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    border: '1px solid #475569',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Secondary Action
                            </button>
                        </div>
                    </div>
                </SlidingDrawer>
            </div>
        );
    },
};
