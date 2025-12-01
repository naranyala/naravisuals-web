// composables/useScreenSize.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useScreenSize() {
  // Define breakpoints (customize as needed)
  const breakpoints = {
    sm: 640,   // Mobile
    md: 768,   // Tablet
    lg: 1024,  // Laptop
    xl: 1280,  // Desktop
  };

  // Reactive screen size
  const screenSize = ref({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  // Update screen size
  const updateScreenSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    screenSize.value = {
      width,
      height,
      isMobile: width < breakpoints.sm,
      isTablet: width >= breakpoints.sm && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
    };
  };

  // Lifecycle hooks
  onMounted(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
  });

  return { screenSize, breakpoints };
}

