<template>
  <div class="flex justify-center w-full h-full overflow-hidden relative">
    <canvas ref="canvas" style="max-width: 100%"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import tinycolor from 'tinycolor2'

import type { Revenues } from '../../../data/charts/revenueChartData'
import { earningsColor, expensesColor, formatMoney } from '../../../data/charts/revenueChartData'

const { revenues, months } = defineProps<{
  months: string[]
  revenues: Revenues[]
}>()

Chart.register(...registerables)

const BR_THICKNESS = 15

const expensesData = computed(() => {
  return revenues.map(({ expenses }) => {
    return expenses
  })
})

const revenueData = computed(() => {
  return revenues.map(({ earning }) => {
    return earning
  })
})

const canvas = ref<HTMLCanvasElement | null>(null)
const doShowChart = ref(false)

Chart.register([
  {
    id: 'background-color',
    //If i want to do smth before draw the char
    /*
    beforeDatasetDraw: function (chart) {
      const ctx = chart.ctx
      const config = chart.config

      config.data.datasets.forEach(function (dataset, datasetIndex) {
        const meta = chart.getDatasetMeta(datasetIndex)
        if (meta.type === 'bar') {
          const bgColor = earningsColor
          // Loop through each bar in the dataset
          meta.data.forEach(function (bar) {
            ctx.fillStyle = bgColor
            ctx.fillRect(bar.x - BR_THICKNESS / 2, 0, BR_THICKNESS, chart.chartArea.bottom)
          })
        }
      })
    },
    */
  },
])

const darkEarningsColor = tinycolor(earningsColor).darken(20).toString()

onMounted(() => {
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Earnings', // Etichetta del dataset dei costi
              data: revenueData.value, // Dati dei costi
              backgroundColor: darkEarningsColor, // Colore per le barre dei costi
              barThickness: BR_THICKNESS, // Spessore delle barre per il dataset dei costi
            },
            {
              label: 'Expenses', // Etichetta del dataset delle spese
              data: expensesData.value, // Dati delle spese
              backgroundColor: expensesColor, // Colore per le barre delle spese
              barThickness: BR_THICKNESS, // Spessore delle barre per il dataset delle spese
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              stacked: false,
              grid: {
                display: false,
              },
              border: {
                width: 0,
              },
            },
            y: {
              display: false,
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return formatMoney(Number(value))
                },
              },
            },
          },
        },
      })
    }
  }

  nextTick(() => {
    doShowChart.value = true
  })
})
</script>

<style lang="scss" scoped>
canvas {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
