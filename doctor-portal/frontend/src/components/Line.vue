<template>
<div id="gd"></div>
</template>

<script lang="">
import { defineComponent } from 'vue';
import Plotly from "plotly.js-dist-min"
const tangram = require("@tangramdotdev/tangram")

let model = new tangram.Model("../v2.tangram")



export default defineComponent({
  name: 'LineChart',
  data(){
    return {
      y: [],
      y_: []
    }
  },
  
  mounted(){
    this.axios.get("https://hackmit2021-backend.azurewebsites.net/patient/1").then(resp => {
      console.log(resp.data)
      // testData.datasets[0].label = resp.data.glucoses[0].resource.subject.display
      for( var i = 0; i < resp.data.glucoses.length; i++){
        // console.log(testData.datasets[0].data)
        this.y.push(parseInt(resp.data.glucoses[i].resource.text.div))
      }
      let max = resp.data.glucoses.length;
      for(var i =resp.data.glucoses.length-11; i< max;i++){
        let input = {
          d1: parseInt(resp.data.glucoses[i].resource.text.div),
          d2: parseInt(resp.data.glucoses[i+1].resource.text.div),
          d3: parseInt(resp.data.glucoses[i+2].resource.text.div),
          d4: parseInt(resp.data.glucoses[i+3].resource.text.div),
          d5: parseInt(resp.data.glucoses[i+4].resource.text.div),
          d6: parseInt(resp.data.glucoses[i+5].resource.text.div),
          d7: parseInt(resp.data.glucoses[i+6].resource.text.div),
          d8: parseInt(resp.data.glucoses[i+7].resource.text.div),
          d9: parseInt(resp.data.glucoses[i+8].resource.text.div),
          d10: parseInt(resp.data.glucoses[i+9].resource.text.div)
        }

        let output = model.predict(input)
        resp.data.glucoses.push(output)
        y_.push(output)
      }
      console.log(this.y)
      Plotly.newPlot("gd", /* JSON object */ {
          "data": [{ "y": this.y }, ],
          "layout": { "width": 600, "height": 400}
      })
      
    })
    
  },

  
});
</script>