
import { ref, watch, watchEffect, onMounted, onUnmounted } from 'vue';

function useLocalStorage(storeKey, defaultValue = {}) {
  // Get initial value from localStorage or use default
  const initialValue = JSON.parse(localStorage.getItem(storeKey)) || defaultValue;
  const store = ref(initialValue);

  // Auto-save to localStorage when store changes
  watch(store, (newValue) => {
    localStorage.setItem(storeKey, JSON.stringify(newValue));
  }, { deep: true });

  return store;
}


export default useLocalStorage
