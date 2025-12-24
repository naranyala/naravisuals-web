import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Fix: Remove '?raw' query and use eager: true for proper image loading
const modules = import.meta.glob('../images/**/*.{jpg,jpeg,png,webp,gif}', {
  eager: true
})

// Fix: Properly extract image URLs from module imports
const images = Object.entries(modules).map(([path, module]) => {
  // Handle both ESM default exports and direct values
  return module.default || module
})

console.log('Modules:', modules)
console.log('Images:', images)

export default defineComponent({
  name: 'ImageGallery',
  setup() {
    const imgs = ref(images)
    const openIndex = ref(null)
    const isOpen = ref(false)

    // Handle case when no images are loaded
    if (imgs.value.length === 0) {
      console.warn('No images found. Check your ../images directory')
    }

    const openAt = async (index) => {
      openIndex.value = index
      isOpen.value = true
      await nextTick()
      if (document.activeElement) {
        document.activeElement.blur()
      }
    }

    const close = () => {
      isOpen.value = false
      openIndex.value = null
    }

    const prev = () => {
      if (openIndex.value === null) return
      openIndex.value = (openIndex.value - 1 + imgs.value.length) % imgs.value.length
    }

    const nextImg = () => {
      if (openIndex.value === null) return
      openIndex.value = (openIndex.value + 1) % imgs.value.length
    }

    const onKey = (e) => {
      if (!isOpen.value) return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') nextImg()
    }

    onMounted(() => {
      window.addEventListener('keydown', onKey)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKey)
    })

    const overlayClick = (e) => {
      if (e.target.dataset.role === 'overlay') close()
    }

    return () => (
      <div>
        {/* Show message if no images */}
        {imgs.value.length === 0 ? (
          <div style={styles.noImages}>
            <p>No images found in ../images directory</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Place images in: src/images/ or check your path
            </p>
          </div>
        ) : (
          <>
            {/* Gallery grid */}
            <div style={styles.gallery}>
              {imgs.value.map((src, i) => (
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
                    loading="lazy"
                    onError={(e) => {
                      console.error('Failed to load image:', src)
                      e.currentTarget.style.display = 'none'
                    }}
                    onMouseEnter={(ev) => {
                      ev.currentTarget.style.transform = 'scale(1.06)'
                    }}
                    onMouseLeave={(ev) => {
                      ev.currentTarget.style.transform = 'scale(1)'
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
                    src={imgs.value[openIndex.value]}
                    alt={`Image ${openIndex.value + 1} of ${imgs.value.length}`}
                    style={styles.lightboxImg}
                    onError={(e) => {
                      console.error('Failed to load lightbox image:', imgs.value[openIndex.value])
                    }}
                  />

                  <div style={styles.controls}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        style={styles.btn}
                        onClick={prev}
                        aria-label="Previous image"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    ✕
                  </button>

                  <div style={styles.captionContainer}>
                    <div style={styles.caption}>
                      {openIndex.value + 1} / {imgs.value.length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }
})

const styles = {
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    padding: '12px',
    boxSizing: 'border-box'
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
    transition: 'transform 0.2s ease'
  },
  thumbImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.25s ease',
    width: '100%',
    height: '100%'
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
    boxSizing: 'border-box'
  },
  lightboxInner: {
    position: 'relative',
    maxWidth: '95%',
    maxHeight: '95%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lightboxImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    objectFit: 'contain'
  },
  controls: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
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
    outline: 'none'
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
    outline: 'none'
  },
  captionContainer: {
    position: 'absolute',
    bottom: '12px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center'
  },
  caption: {
    color: '#ddd',
    fontSize: '14px',
    textAlign: 'center',
    padding: '8px 16px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '20px'
  },
  noImages: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
    fontSize: '16px'
  }
}
