// composables/useScreenSize.ts
import { ref, onMounted, onUnmounted } from 'vue'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useScreenSize() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 0)

  const current = ref<Breakpoint>('md')

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight

    if (width.value >= breakpoints['2xl']) current.value = '2xl'
    else if (width.value >= breakpoints.xl) current.value = 'xl'
    else if (width.value >= breakpoints.lg) current.value = 'lg'
    else if (width.value >= breakpoints.md) current.value = 'md'
    else if (width.value >= breakpoints.sm) current.value = 'sm'
    else current.value = 'xs'
  }

  const isMobile = () => ['xs', 'sm'].includes(current.value)
  const isTablet = () => ['md'].includes(current.value)
  const isDesktop = () => ['lg', 'xl', '2xl'].includes(current.value)

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return {
    width,
    height,
    current,
    isMobile,
    isTablet,
    isDesktop,
    // Tailwind-style helpers
    isSmAndUp: () => width.value >= breakpoints.sm,
    isMdAndUp: () => width.value >= breakpoints.md,
    isLgAndUp: () => width.value >= breakpoints.lg,
    isXlAndUp: () => width.value >= breakpoints.xl,
  }
}
