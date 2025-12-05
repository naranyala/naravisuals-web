// composables/useDragAndDrop.js
import { ref } from 'vue'

export function useDragAndDrop() {
  const isDragging = ref(false)
  const files = ref([])
  const dataTransfer = ref(null)

  const onDragOver = (e) => {
    e.preventDefault()
    isDragging.value = true
  }

  const onDragLeave = () => {
    isDragging.value = false
  }

  const onDrop = (e) => {
    e.preventDefault()
    isDragging.value = false
    dataTransfer.value = e.dataTransfer
    files.value = [...e.dataTransfer.files]
  }

  return [
    { isDragging, files, dataTransfer },
    { onDragOver, onDragLeave, onDrop }
  ]
}
