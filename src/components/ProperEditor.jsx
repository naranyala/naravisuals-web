import { defineOptions, ink } from 'ink-mde'

import {defineComponent, ref, onMounted, watchEffect} from "vue"


export default defineComponent({
  name: "ProperEditor",
  setup(){

    onMounted(() => {})

watchEffect(() => {


const state = { doc: '# Start with some text' }

const options = defineOptions({
  doc: state.doc,
  hooks: {
    afterUpdate: (doc) => {
      state.doc = doc
    },
  },
})

const editor = ink(document.querySelector('textarea'), options)

editor.update(state.doc)

})
    return (
      <div>
        <textarea id="editor"/>
      </div>
    )
  }
})
