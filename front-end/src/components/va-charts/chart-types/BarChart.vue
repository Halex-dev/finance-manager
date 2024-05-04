<template>
  <Bar :data="props.data" :options="options" />
</template>

<script lang="ts" setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale } from 'chart.js'
//import { DeepPartial } from 'chart.js/dist/types/utils'

ChartJS.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale)

const props = defineProps<{
  data: any
  options?: any //DeepPartial<any>
}>()
</script>
