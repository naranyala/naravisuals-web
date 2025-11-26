// composables/useDebounceFn.ts
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
) {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
