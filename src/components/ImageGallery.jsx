// ImageGallery.jsx
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { css } from 'goober'

// Fix: Remove '?raw' query and use eager: true for proper image loading
const modules = import.meta.glob('../images/**/*.{jpg,jpeg,png,webp,gif}', {
  eager: true
})

// Fix: Properly extract image URLs from module imports
const images = Object.entries(modules).map(([path, module]) => {
  // Handle both ESM default exports and direct values
  return module.default || module
})



export default defineComponent({
  name: 'ImageGallery',
  setup() {
    const imgs = ref(images)
    const openIndex = ref(null)
    const isOpen = ref(false)
    const loadedImages = ref(new Set()) // Track loaded images
    const loadedLightboxImages = ref(new Set()) // Track loaded lightbox images

    // Handle case when no images are loaded
    if (imgs.value.length === 0) {
      console.warn('No images found. Check your ../images directory')
    }

    // Spinner component
    const Spinner = () => (
      <div class={styles.spinner}>
        <div class={styles.spinnerCircle}></div>
      </div>
    )

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

    const handleImageLoad = (index) => {
      loadedImages.value.add(index)
    }

    const handleLightboxImageLoad = (index) => {
      loadedLightboxImages.value.add(index)
    }

    const handleImageError = (src, index) => {
      console.error('Failed to load image:', src)
      // Mark as loaded (even if failed) to hide spinner
      loadedImages.value.add(index)
    }

    const handleLightboxImageError = (src, index) => {
      console.error('Failed to load lightbox image:', src)
      loadedLightboxImages.value.add(index)
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
          <div class={styles.noImages}>
            <p>No images found in ../images directory</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Place images in: src/images/ or check your path
            </p>
          </div>
        ) : (
          <>
            {/* Gallery grid */}
            <div class={styles.gallery}>
              {imgs.value.map((src, i) => (
                <div
                  key={i}
                  class={styles.thumbWrap}
                  onClick={() => openAt(i)}
                  title={`Open image ${i + 1}`}
                >
                  {!loadedImages.value.has(i) && <Spinner />}
                  <img
                    src={src}
                    alt={`Gallery image ${i + 1}`}
                    class={styles.thumbImg}
                    style={{ opacity: loadedImages.value.has(i) ? 1 : 0 }}
                    loading="lazy"
                    onLoad={() => handleImageLoad(i)}
                    onError={() => handleImageError(src, i)}
                    onMouseEnter={(ev) => {
                      if (loadedImages.value.has(i)) {
                        ev.currentTarget.style.transform = 'scale(1.06)'
                      }
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
                class={styles.overlay}
                onClick={overlayClick}
                aria-modal="true"
                role="dialog"
                aria-label="Image gallery lightbox"
              >
                <div class={styles.lightboxInner}>
                  {!loadedLightboxImages.value.has(openIndex.value) && (
                    <div class={styles.lightboxSpinner}>
                      <Spinner />
                    </div>
                  )}
                  <img
                    src={imgs.value[openIndex.value]}
                    alt={`Image ${openIndex.value + 1} of ${imgs.value.length}`}
                    class={styles.lightboxImg}
                    style={{ opacity: loadedLightboxImages.value.has(openIndex.value) ? 1 : 0 }}
                    onLoad={() => handleLightboxImageLoad(openIndex.value)}
                    onError={() => handleLightboxImageError(imgs.value[openIndex.value], openIndex.value)}
                  />

                  <div class={styles.controls}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        class={styles.btn}
                        onClick={prev}
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        class={styles.btn}
                        onClick={nextImg}
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <button
                    class={styles.closeBtn}
                    onClick={close}
                    aria-label="Close lightbox"
                  >
                    ✕
                  </button>

                  <div class={styles.captionContainer}>
                    <div class={styles.caption}>
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


// Define styles with Goober's css function
const styles = {
  gallery: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    padding: 12px;
    box-sizing: border-box;
  `,
  thumbWrap: css`
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    cursor: pointer;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #111;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  `,
  thumbImg: css`
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    display: block;
    transition: all 0.25s ease;
    width: 100%;
    height: 100%;
  `,
  overlay: css`
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    box-sizing: border-box;
  `,
  lightboxInner: css`
    position: relative;
    max-width: 95%;
    max-height: 95%;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  lightboxImg: css`
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
    object-fit: contain;
    transition: opacity 0.3s ease;
  `,
  lightboxSpinner: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  `,
  controls: css`
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    transform: translateY(-50%);
    pointer-events: none;
  `,
  btn: css`
    pointer-events: auto;
    background-color: rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.08);
    color: #fff;
    padding: 10px 14px;
    margin: 0 8px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    font-size: 18px;
    transition: background-color 0.2s ease;
    outline: none;

    &:hover {
      background-color: rgba(0,0,0,0.7);
    }
  `,
  closeBtn: css`
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: transparent;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    outline: none;

    &:hover {
      background-color: rgba(255,255,255,0.1);
    }
  `,
  captionContainer: css`
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
  `,
  caption: css`
    color: #ddd;
    font-size: 14px;
    text-align: center;
    padding: 8px 16px;
    background-color: rgba(0,0,0,0.5);
    border-radius: 20px;
  `,
  noImages: css`
    padding: 40px;
    text-align: center;
    color: #999;
    font-size: 16px;
  `,
  spinner: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  `,
  spinnerCircle: css`
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `
}

