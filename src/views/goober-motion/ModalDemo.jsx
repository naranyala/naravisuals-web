import { defineComponent, ref, watch } from 'vue';
import { css } from 'goober';
import { animate } from 'motion';

const styles = {
    app: css`
        /* min-height: 100vh; */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `,
    title: css`
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        margin-bottom: 3rem;
        text-align: center;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `,
    buttonGrid: css`
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        max-width: 900px;
        width: 100%;
    `,
    button: css`
        padding: 1.25rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        color: white;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);

        &:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        &:active {
            transform: translateY(0);
        }
    `,
    overlay: css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        opacity: 0;
    `,
    modal: css`
        background: white;
        border-radius: 24px;
        max-width: 500px;
        width: 100%;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
    `,
    modalHeader: css`
        padding: 2rem 2rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `,
    modalTitle: css`
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    `,
    closeButton: css`
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #f3f4f6;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: #6b7280;

        &:hover {
            background: #e5e7eb;
            color: #374151;
        }
    `,
    modalBody: css`
        padding: 2rem;
        color: #4b5563;
        line-height: 1.7;
        font-size: 1rem;
    `,
    modalFooter: css`
        padding: 1.5rem 2rem;
        background: #f9fafb;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    `,
    modalButton: css`
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
    `,
    primaryButton: css`
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
    `,
    secondaryButton: css`
        background: white;
        color: #6b7280;
        border: 1px solid #d1d5db;

        &:hover {
            background: #f9fafb;
            color: #374151;
        }
    `,
};

export default defineComponent({
    name: 'ModalDemo',
    setup() {
        const isOpen = ref(false);
        const modalType = ref('default');
        const overlayRef = ref(null);
        const modalRef = ref(null);

        const modalContent = {
            default: {
                title: 'Welcome!',
                body: 'This is a beautiful modal component built with Vue 3, goober for styling, and motion for smooth animations. Click outside or press the close button to dismiss.',
            },
        };

        const openModal = (type) => {
            modalType.value = type;
            isOpen.value = true;
        };

        const closeModal = () => {
            if (!overlayRef.value || !modalRef.value) return;

            // Animate out
            animate(overlayRef.value, { opacity: 0 }, { duration: 0.2 });
            animate(
                modalRef.value,
                { transform: 'scale(0.9)', opacity: 0 },
                { duration: 0.2 }
            ).finished.then(() => {
                isOpen.value = false;
            });
        };

        watch(isOpen, async (newValue) => {
            if (newValue) {
                // Wait for next tick to ensure elements are mounted
                await new Promise(resolve => setTimeout(resolve, 0));

                if (overlayRef.value && modalRef.value) {
                    // Animate in
                    animate(
                        overlayRef.value,
                        { opacity: [0, 1] },
                        { duration: 0.3 }
                    );
                    animate(
                        modalRef.value,
                        {
                            transform: ['scale(0.9)', 'scale(1)'],
                            opacity: [0, 1]
                        },
                        { duration: 0.3, easing: [0.4, 0, 0.2, 1] }
                    );
                }
            }
        });

        const handleOverlayClick = (e) => {
            if (e.target === overlayRef.value) {
                closeModal();
            }
        };

        return () => (
            <div class={styles.app}>
                <h1 class={styles.title}>Modal Component Demo</h1>

                <div class={styles.buttonGrid}>
                    <button class={styles.button} onClick={() => openModal('default')}>
                        Open Default Modal
                    </button>
                </div>

                {isOpen.value && (
                    <div
                        ref={overlayRef}
                        class={styles.overlay}
                        onClick={handleOverlayClick}
                    >
                        <div ref={modalRef} class={styles.modal}>
                            <div class={styles.modalHeader}>
                                <h2 class={styles.modalTitle}>
                                    {modalContent[modalType.value].title}
                                </h2>
                                <button class={styles.closeButton} onClick={closeModal}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div class={styles.modalBody}>
                                {modalContent[modalType.value].body}
                            </div>

                            <div class={styles.modalFooter}>
                                <button
                                    class={`${styles.modalButton} ${styles.secondaryButton}`}
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    class={`${styles.modalButton} ${styles.primaryButton}`}
                                    onClick={closeModal}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    },
});
