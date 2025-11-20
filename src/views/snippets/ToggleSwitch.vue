
<template>
  <label class="switch">
    <input type="checkbox" v-model="checked" @change="$emit('update:modelValue', checked)" />
    <span class="slider"></span>
  </label>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const checked = ref(props.modelValue)

watch(() => props.modelValue, val => checked.value = val)
</script>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}
.switch input { display: none; }
.slider {
  position: absolute;
  cursor: pointer;
  background: #ccc;
  border-radius: 20px;
  top: 0; left: 0; right: 0; bottom: 0;
  transition: .4s;
}
.slider:before {
  content: "";
  position: absolute;
  height: 16px; width: 16px;
  left: 2px; bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: .4s;
}
input:checked + .slider { background: #42b983; }
input:checked + .slider:before { transform: translateX(20px); }
</style>
