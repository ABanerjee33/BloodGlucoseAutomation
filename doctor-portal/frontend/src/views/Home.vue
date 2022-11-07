<template>
  <div class="home">
    
    <Line />
    

  </div>
</template>

<script lang="">
import { defineComponent } from 'vue';
import Line from "@/components/Line";

export default defineComponent({
  name: 'Home',
  components: {
    Line,
  },


  data(){
    return {
    }
  }
});
</script>
