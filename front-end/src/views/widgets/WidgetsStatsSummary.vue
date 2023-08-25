<template>
  <CRow>
    <CCol :xs="4">
      <CWidgetStatsA class="mb-4" color="primary">
        <template #value
          >€{{ this.currentSpending }}
          <span class="fs-6 fw-normal">
            ({{ this.percentageCost }}% <CIcon v-if="this.percentageCost > 0" icon="cil-arrow-top" />
              <CIcon v-else icon="cil-arrow-bottom" />)      
          </span>
        </template>
        <template #title>Costs</template>
        <template #chart>
          <CChart
            ref="chartCost"
            type="line"
            class="mt-3"
            style="height: 70px"
            :data="chartDataCost"
            :options="chartOptions"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :xs="4">
      <CWidgetStatsA class="mb-4" color="info">
        <template #value
          >€{{ this.currentIncome }}
          <span class="fs-6 fw-normal">
            ({{ this.percentageIncome }}% <CIcon v-if="this.percentageIncome > 0" icon="cil-arrow-top" />
              <CIcon v-else icon="cil-arrow-bottom" />)
          </span>
        </template>
        <template #title>Income</template>
        <template #chart>
          <CChart
            ref="chartIncome"
            type="line"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="chartDataCost"
            :options="chartOptions"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :xs="4">
      <CWidgetStatsA class="mb-4" color="warning">
        <template #value
          >€{{ this.currentIncome }}
          <span class="fs-6 fw-normal">
            ({{ this.percentageDiff }}% <CIcon v-if="this.percentageDiff > 0" icon="cil-arrow-top" />
              <CIcon v-else icon="cil-arrow-bottom" />)
          </span>
        </template>
        <template #title>Different</template>
        <template #chart>
          <CChart
            type="line"
            class="mt-3"
            style="height: 70px"
            :data="chartDataCost"
            :options="chartOptions"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
  </CRow>
</template>

<script>
import { CChart } from '@coreui/vue-chartjs'
import axios from 'axios';
export default {
  name: 'WidgetsStatsA',
  components: {
    CChart,
  },
  data(){
    return {
      currentIncome: 0,
      currentSpending : 0,
      currentDiff: 0,
      percentageCost : 0,
      percentageIncome : 0,
      percentageDiff : 0,
      responseCosts: [],
      responseIncomes: [],
      chartRefIncome: null,
      chartRefCost: null,
      chartDataCost: {
        labels: [], // Etichette dell'asse x
        datasets: [
          {
            label: 'Price',
            backgroundColor: 'transparent',
            borderColor: 'rgba(255,255,255,.55)',
            pointBackgroundColor: '#321fdb',
            data: [], // Array di numeri come dati del grafico
          },
        ],
      },
      chartOptions: {
        plugins: {
          legend: {
            display: false,
          },
        },
        maintainAspectRatio: false,
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
        elements: {
          line: {
            borderWidth: 2,
            tension: 0.4,
          },
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
          },
        },
      }
    }
  },
  mounted() { 
    this.chartRefCost = this.$refs.chartCost; // Riferimento al componente CChart
    this.chartRefIncome = this.$refs.chartIncome; // Riferimento al componente CChart
    this.calculateStats();     
  },
  methods:{
    async fetchCostByDate(startDate, endDate){
      try {
          const responseCosts = await axios.get('http://localhost:3000/api/costs', {
              params: {
                  startDate: startDate,
                  endDate: endDate
              }
          })
          
          this.responseCosts = responseCosts.data;
          return responseCosts.data;
      } catch (error) {
          console.error('Error fetching costs:', error);
      }  
    },
    async fetchIncomeByDate(startDate, endDate){
      try {
          const responseIncomes = await axios.get('http://localhost:3000/api/incomes', {
              params: {
                  startDate: startDate,
                  endDate: endDate
              }
          })

          this.responseIncomes = responseIncomes.data;
          return responseIncomes.data;
      } catch (error) {
          console.error('Error fetching costs:', error);
      }
    },
    async calculateStats(){
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // I mesi in JavaScript partono da 0

      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      
      const firstDayOfThisMonth = new Date(currentYear, currentMonth, 1); // Primo giorno del mese corrente
      const lastDayOfThisMonth = new Date(currentYear, currentMonth + 1, 0); // Ultimo giorno del mese corrente

      const firstDayOfLastMonth = new Date(currentYear, lastMonth, 1); // Primo giorno del mese precedente
      const lastDayOfLastMonth = new Date(currentYear, currentMonth, 0); // Ultimo giorno del mese precedente
      
      const oldIncomes = await this.fetchIncomeByDate(firstDayOfLastMonth, lastDayOfLastMonth);
      const incomes = await this.fetchIncomeByDate(firstDayOfThisMonth, lastDayOfThisMonth);

      const oldCosts = await this.fetchCostByDate(firstDayOfLastMonth, lastDayOfLastMonth);
      const costs = await this.fetchCostByDate(firstDayOfThisMonth, lastDayOfThisMonth);

      //TODO ALERT ERRORE SERVER
      if(!costs && !oldCosts && !incomes && !oldIncomes)
        return;
      
      this.currentIncome = incomes.reduce((total, income) => total + income.income, 0);
      this.currentSpending = costs.reduce((total, cost) => total + cost.price, 0);

      const lastIncome = oldIncomes.reduce((total, income) => total + income.income, 0);
      const lastSpending = oldCosts.reduce((total, cost) => total + cost.price, 0);

      // Calcola la percentuale di differenza
      this.percentageCost = (((this.currentSpending - lastSpending) / lastSpending) * 100).toFixed(2); // DEVO CONTARE TUTTO
      this.percentageIncome = (((this.currentIncome - lastIncome) / lastIncome) * 100).toFixed(2); // DEVO CONTARE TUTTO

      this.currentDiff = this.currentIncome - this.currentSpending;
      const lastDiff = lastIncome - lastSpending;

      // DEVO CONTARE SOLO LA DIFFERENZA
      this.percentageDiff = (((this.currentDiff - lastDiff) / lastDiff) * 100).toFixed(2); // DEVO CONTARE TUTTO

      // Assegna i prezzi dei costi alla variabile del grafico
      this.chartRefCost.chart.data.datasets[0].data = costs.map(cost => cost.price);
      this.chartRefCost.chart.data.labels = costs.map(cost => cost.date);
      this.chartRefCost.chart.update();

      this.chartRefIncome.chart.data.datasets[0].data = incomes.map(income => income.income);
      this.chartRefIncome.chart.data.labels = incomes.map(income => income.date);
      this.chartRefIncome.chart.update();
    }
  }
}

</script>
