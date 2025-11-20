<template>
  <div class="container">
    <CustomButton @click="showModal = true" variant="primary">
      Open Modal
    </CustomButton>

    <CustomInput
      v-model="username"
      label="Username"
      placeholder="Enter your username"
    />

    <Card title="User Card" shadow="medium">
      <p>Username: {{ username }}</p>
    </Card>

    <Modal v-model:show="showModal" title="Demo Modal">
      <p>This is a modal content</p>
      <template #footer>
        <CustomButton @click="showModal = false">Close</CustomButton>
      </template>
    </Modal>

    <LoadingSpinner size="large" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CustomButton from './CustomButton.vue'
import CustomInput from './CustomInput.vue'
import Modal from './Modal.vue'
import Card from './Card.vue'
import LoadingSpinner from './LoadingSpinner.vue'

const username = ref('')
const showModal = ref(false)
</script>
