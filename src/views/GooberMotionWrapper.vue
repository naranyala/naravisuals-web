<script setup>
import Accordion from "./goober-motion/Accordion.jsx"
import ModalDemo from "./goober-motion/ModalDemo.jsx"
import TodoList from "./goober-motion/TodoList.jsx"
import FuzzySearchList from "./goober-motion/FuzzySearchList.jsx"
import Treeview from "./goober-motion/Treeview.jsx"
import PrintYourCode from "./goober-motion/PrintYourCode.jsx"
import SlidingUpDrawer from "./goober-motion/SlidingUpDrawer.jsx"

</script>

<template>
  <div class="container">
    <Accordion />
    <ModalDemo />
    <TodoList />
    <FuzzySearchList />
    <Treeview />
    <PrintYourCode />
    <SlidingUpDrawer />
  </div>
</template>

<style scoped>
.container>div {
  border: 1px solid gray;
  border-radius: 20px;
  margin: 20px;
  padding-bottom: 200px;
}
</style>
