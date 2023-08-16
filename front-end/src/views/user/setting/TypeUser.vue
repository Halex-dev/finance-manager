<template>
    <CAlert color="primary" :visible="liveExampleVisible" dismissible @close="() => { liveExampleVisible = false }">A simple primary alert—check it out!</CAlert>
    <CButton color="primary" @click="() => { liveExampleVisible = true }">Show live alert</CButton>  
</template>
  
<script>
    export default {
      data() {
        return {
            liveExampleVisible: false, 
        }
      },
    }
</script>