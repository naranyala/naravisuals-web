import {ref, watch} from "vue"

export function useSyncedRef(prop, emit) {
  const state = ref(prop.value)

  watch(prop, v => state.value = v)
  watch(state, v => emit("update:modelValue", v))

  return state
}

