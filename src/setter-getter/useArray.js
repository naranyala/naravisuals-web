// useArray.js
import { ref } from 'vue'

export function useArray(initialArray = []) {
  const array = ref(initialArray)

  const get = () => array.value

  const set = (newArray) => {
    array.value = newArray
  }

  const push = (item) => {
    array.value.push(item)
    // Create new reference to trigger reactivity
    array.value = [...array.value]
  }

  const remove = (index) => {
    array.value.splice(index, 1)
    array.value = [...array.value]
  }

  const update = (index, newItem) => {
    array.value[index] = newItem
    array.value = [...array.value]
  }

  const clear = () => {
    array.value = []
  }

  const filter = (callback) => {
    array.value = array.value.filter(callback)
  }

  const find = (callback) => {
    return array.value.find(callback)
  }

  return {
    get,
    set,
    push,
    remove,
    update,
    clear,
    filter,
    find,
    array // reactive ref for template
  }
}
