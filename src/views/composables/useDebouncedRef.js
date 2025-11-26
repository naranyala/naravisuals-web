import {watch} from "vue"

export function useDebouncedRef(value, delay = 300) {
  const r = ref(value)
  let t

  watch(r, () => {
    clearTimeout(t)
    t = setTimeout(() => final.value = r.value, delay)
  })

  const final = ref(value)

  return final
}

