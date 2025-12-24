import {defineComponent} from "vue"

import HtmlRendererWithPrismjs from "./HtmlRendererWithPrismjs.jsx"
import HtmlRendererWithShiki from "./HtmlRendererWithShiki.jsx"

export default defineComponent({
  name: "HtmlRendererWrapper",
  props: { content: String },
  setup(props){

  },
  render(){

    console.log("content: ", props.content)

    return (
      <div>



      <HtmlRendererWithShiki rawHtml={props.content}/>


      {/*


        <HtmlRendererWithPrismjs content={props.content}/>
      <pre>{JSON.stringify(props.rawHtml, null, 2)}</pre>
        */}

      </div>
    )
  }
})
