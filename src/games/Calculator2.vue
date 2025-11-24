
<script setup>
import { ref } from "vue";

const emit = defineEmits(['toggle-container'])

const showModal = ref(false);
const current = ref("0");

const buttons = [
  "7","8","9","/",
  "4","5","6","*",
  "1","2","3","-",
  "0",".","=","+",
  "C"
];

function press(btn) {
  if (btn === "C") {
    current.value = "0";
  } else if (btn === "=") {
    try {
      // Evaluate safely
      current.value = eval(current.value).toString();
    } catch {
      current.value = "Error";
    }
  } else {
    if (current.value === "0" && btn !== "." && !isNaN(btn)) {
      current.value = btn;
    } else {
      current.value += btn;
    }
  }
}

function openCalc() {
  showModal.value = true;
  current.value = "0";
}

function closeCalc() {
  emit('toggle-container')
  showModal.value = false;
}
</script>


<template>
  <div>
    <div class="modal" @click="closeCalc">
      <div class="modal-content">
        <div class="display">{{ current }}</div>
        <div class="buttons">
          <button v-for="btn in buttons" :key="btn" @click="press(btn)">
            {{ btn }}
          </button>
        </div>
        <button @click="closeCalc">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
.display {
  background: #222;
  color: #0f0;
  font-size: 24px;
  padding: 10px;
  margin-bottom: 10px;
  text-align: right;
  border-radius: 4px;
}
.buttons {
  display: grid;
  grid-template-columns: repeat(4, 60px);
  gap: 8px;
  justify-content: center;
  margin-bottom: 10px;
}
button {
  padding: 12px;
  font-size: 18px;
  cursor: pointer;
}
</style>

