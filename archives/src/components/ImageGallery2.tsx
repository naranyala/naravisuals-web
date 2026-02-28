import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';

const modules = import.meta.glob('../images/**/*.{jpg,jpeg,png,webp,gif}', {
  // query: '?raw',
  eager: true,
});

const images = Object.values(modules).map((m) => m.default || m);

console.log(modules);
console.log(images);

export default defineComponent({
  name: 'ImageGallery',
  setup() {
    const imgs = images;
    const openIndex = ref(null);
    const isOpen = ref(false);

    const openAt = async (index) => {
      openIndex.value = index;
      isOpen.value = true;
      await nextTick();
      // Remove focus from any focused element
      if (document.activeElement) {
        document.activeElement.blur();
      }
    };

    const close = () => {
      isOpen.value = false;
      openIndex.value = null;
    };

    const prev = () => {
      if (openIndex.value === null) return;
      openIndex.value = (openIndex.value - 1 + imgs.length) % imgs.length;
    };

    const nextImg = () => {
      if (openIndex.value === null) return;
      openIndex.value = (openIndex.value + 1) % imgs.length;
    };

    const onKey = (e) => {
      if (!isOpen.value) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') nextImg();
    };

    onMounted(() => {
      window.addEventListener('keydown', onKey);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKey);
    });

    const overlayClick = (e) => {
      // Close when clicking the backdrop (but not when clicking the image)
      if (e.target.dataset.role === 'overlay') close();
    };

    return () => (
      <div>
        {/* Gallery grid */}
        <div style={styles.gallery}>
          {imgs.map((src, i) => (
            <div
              key={i}
              style={styles.thumbWrap}
              onClick={() => openAt(i)}
              title={`Open image ${i + 1}`}
            >
              <img
                src={src}
                alt={`Gallery image ${i + 1}`}
                style={styles.thumbImg}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </div>
          ))}
        </div>

        {/* Lightbox overlay */}
        {isOpen.value && openIndex.value !== null && (
          <div
            key="lightbox"
            data-role="overlay"
            style={styles.overlay}
            onClick={overlayClick}
            aria-modal="true"
            role="dialog"
            aria-label="Image gallery lightbox"
          >
            <div style={styles.lightboxInner}>
              <img
                src={imgs[openIndex.value]}
                alt={`Image ${openIndex.value + 1} of ${imgs.length}`}
                style={styles.lightboxImg}
              />

              <div style={styles.controls}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    style={styles.btn}
                    onClick={prev}
                    aria-label="Previous image"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        prev();
                      }
                    }}
                  >
                    ‹
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    style={styles.btn}
                    onClick={nextImg}
                    aria-label="Next image"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        nextImg();
                      }
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>

              <button
                style={styles.closeBtn}
                onClick={close}
                aria-label="Close lightbox"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    close();
                  }
                }}
              >
                ✕
              </button>

              <div style={styles.captionContainer}>
                <div style={styles.caption}>
                  {openIndex.value + 1} / {imgs.length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
});

const styles = {
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    padding: '12px',
    boxSizing: 'border-box',
  },
  thumbWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '10px',
    cursor: 'pointer',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    transition: 'transform 0.2s ease',
  },
  thumbImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.25s ease',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'fixed',
    inset: '0',
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    boxSizing: 'border-box',
  },
  lightboxInner: {
    position: 'relative',
    maxWidth: '95%',
    maxHeight: '95%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    objectFit: 'contain',
  },
  controls: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  btn: {
    pointerEvents: 'auto',
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    padding: '10px 14px',
    margin: '0 8px',
    borderRadius: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '18px',
    transition: 'background-color 0.2s ease',
    outline: 'none',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
    outline: 'none',
  },
  captionContainer: {
    position: 'absolute',
    bottom: '12px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  caption: {
    color: '#ddd',
    fontSize: '14px',
    textAlign: 'center',
    padding: '8px 16px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '20px',
  },
};
