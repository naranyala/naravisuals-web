import { onMounted, onUnmounted, unref } from 'vue';

export function useEventListener(target, event, handler) {
  // Use a watcher for the target, but here we'll keep it simple:
  let targetElement = unref(target);

  // If no target is provided, assume window
  if (!targetElement) {
    targetElement = window;
  }
  
  onMounted(() => {
    targetElement.addEventListener(event, handler);
  });

  onUnmounted(() => {
    targetElement.removeEventListener(event, handler);
  });
}
