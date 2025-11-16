
<template>
  <FAQList :items="faqs" />
</template>

<script setup>
import FAQList from "./reusables/FAQList.vue"

const faqs = [
  {
    question: "General question",
    answer: "Simple answer",
  },
  {
    question: "Account issues",
    children: [
      {
        question: "Login problem",
        answer: "Try resetting your password."
      },
      {
        question: "Security",
        children: [
          {
            question: "2FA",
            answer: "Use an authenticator app."
          }
        ]
      }
    ]
  }
]
</script>
