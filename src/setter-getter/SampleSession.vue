<template>
  <div>
    <h3>Session Cart</h3>
    <p>Items: {{ cart.get().length }}</p>
    <button @click="addItem">Add Item</button>
    <button @click="clearCart">Clear Cart</button>
    <p v-if="cart.isExpired()">Session expired!</p>
  </div>
</template>

<script setup>
import { useSession } from './useSession'

const cart = useSession('shopping_cart', [], 30) // 30 minutes expiry

function addItem() {
  const items = cart.get()
  items.push({ id: Date.now(), name: `Item ${items.length + 1}` })
  cart.set(items)
}

function clearCart() {
  cart.remove()
}
</script>
