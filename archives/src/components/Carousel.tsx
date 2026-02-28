import clsx from 'clsx';
import { css, keyframes } from 'goober';
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
} from 'vue';

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

interface CarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showControls?: boolean;
  className?: string;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const styles = {
  carousel: css`
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  `,

  viewport: css`
    position: relative;
    height: 400px;
    background: #f3f4f6;
  `,

  slide: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${fadeIn} 0.5s ease-in-out;
  `,

  image: css`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  `,

  caption: css`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    color: white;
    padding: 2rem 1rem 1rem;
    font-size: 1.125rem;
    font-weight: 500;
  `,

  controls: css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    &.prev {
      left: 1rem;
    }

    &.next {
      right: 1rem;
    }
  `,

  indicators: css`
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
  `,

  indicator: css`
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background: white;
      transform: scale(1.2);
    }

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.7);
    }
  `,

  loading: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6b7280;
    font-size: 1.125rem;
  `,
};

export default defineComponent({
  name: 'Carousel',

  props: {
    images: {
      type: Array as PropType<CarouselImage[]>,
      required: true,
    },
    autoPlay: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number,
      default: 5000,
    },
    showIndicators: {
      type: Boolean,
      default: true,
    },
    showControls: {
      type: Boolean,
      default: true,
    },
    className: String,
  },

  emits: ['image-change'],

  setup(props, { emit }) {
    const currentIndex = ref(0);
    const isLoading = ref(true);
    let autoPlayInterval: number | null = null;

    const currentImage = computed(() => props.images[currentIndex.value]);

    const nextImage = () => {
      currentIndex.value = (currentIndex.value + 1) % props.images.length;
      emit('image-change', currentImage.value);
    };

    const prevImage = () => {
      currentIndex.value =
        currentIndex.value === 0
          ? props.images.length - 1
          : currentIndex.value - 1;
      emit('image-change', currentImage.value);
    };

    const goToImage = (index: number) => {
      currentIndex.value = index;
      emit('image-change', currentImage.value);
    };

    const startAutoPlay = () => {
      if (props.autoPlay && props.images.length > 1) {
        autoPlayInterval = setInterval(nextImage, props.interval);
      }
    };

    const stopAutoPlay = () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    };

    const handleImageLoad = () => {
      isLoading.value = false;
    };

    onMounted(() => {
      startAutoPlay();
    });

    onUnmounted(() => {
      stopAutoPlay();
    });

    return () => (
      <div
        class={clsx(styles.carousel, props.className)}
        onMouseenter={stopAutoPlay}
        onMouseleave={startAutoPlay}
      >
        <div class={styles.viewport}>
          {isLoading.value && (
            <div class={styles.loading}>Loading image...</div>
          )}

          <div class={styles.slide}>
            <img
              src={currentImage.value.src}
              alt={currentImage.value.alt}
              class={styles.image}
              onLoad={handleImageLoad}
            />
            {currentImage.value.caption && (
              <div class={styles.caption}>{currentImage.value.caption}</div>
            )}
          </div>

          {props.showControls && props.images.length > 1 && (
            <>
              <button class={clsx(styles.controls, 'prev')} onClick={prevImage}>
                ‹
              </button>
              <button class={clsx(styles.controls, 'next')} onClick={nextImage}>
                ›
              </button>
            </>
          )}

          {props.showIndicators && props.images.length > 1 && (
            <div class={styles.indicators}>
              {props.images.map((_, index) => (
                <button
                  key={index}
                  class={clsx(
                    styles.indicator,
                    index === currentIndex.value && 'active',
                  )}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
});
