<template>
  <CRow>
    <CCol :xs="6">
      <CCard class="mb-4">
      <CCardHeader>Rule 50/30/20</CCardHeader>
      <CCardBody>
        <div class="category">
          <h4>Spese Necessarie (50%)</h4>
          <p>Limite di spesa: {{ this.tot50  }}€</p>
          <p>Speso finora: {{ this.current50 }}€</p>
          <p>Ancora disponibile: {{ this.tot50 - this.current50 }}€</p>
        </div>
          <div class="category">
          <h4>Spese Discrezionali (30%)</h4>
          <p>Limite di spesa: {{ this.tot30 }}€</p>
          <p>Speso finora: {{ this.current30 }}€</p>
          <p>Ancora disponibile: {{ this.tot30 - this.current30 }}€</p>
        </div>
        <div class="category">
          <h4>Risparmio/Investimenti (20%)</h4>
          <p>Limite di risparmio: {{ this.tot20 }}€</p>
          <p>Risparmiato finora: {{ this.current20 }}€</p>
          <p>Ancora disponibile: {{ this.tot20 - this.current20 }}€</p>
        </div>
      </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="6">
      <CCard class="mb-4">
        <CCardHeader><h4 class="card-title m-30">Costs divided by category</h4>
          <CButtonGroup
                  class="float-end me-3"
                  role="group"
                >
                <CButton color="secondary" variant="outline" :class="{ active: activeButton === 'day' }" @click="setActiveButton('day')">Day</CButton>
                <CButton color="secondary" variant="outline" :class="{ active: activeButton === 'month' }" @click="setActiveButton('month')">Month</CButton>
                <CButton color="secondary" variant="outline" :class="{ active: activeButton === 'year' }" @click="setActiveButton('year')">Year</CButton>
                </CButtonGroup>
        </CCardHeader>
        <CCardBody>
          <CChart
              ref="chartCategory"
              type="doughnut"
              style="height: 70px width: 70px"
              :data="chartData"
              :options="chartOptions"
            />
        </CCardBody>
      </CCard>
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
      categoryData: {},
      chartRefCategory: null,
      activeButton: 'month',
      tot50: 0,
      tot30: 0,
      tot20: 0,
      currentSpending: 0,
      current50: 0,
      current30: 0,
      current20: 0,
      chartData: {
        labels: ["test","troia","testone"], // Etichette dell'asse x
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            pointBackgroundColor: '#321fdb',
            data: [500,30,10], // Array di numeri come dati del grafico
          },
        ],
      },
      chartOptions: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
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
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}€ (${((value / context.dataset.data.reduce((a, b) => a + b)) * 100).toFixed(2)}%)`;
              },
            },
          },
        },
        //maintainAspectRatio: false,
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
    this.chartRefCategory = this.$refs.chartCategory; // Riferimento al componente CChart
    this.calculateStats();   
  },
  methods:{
    async setActiveButton(button) {
      this.activeButton = button;
    },
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
      
      const firstDayOfThisMonth = new Date(currentYear, currentMonth, 1); // Primo giorno del mese corrente
      const lastDayOfThisMonth = new Date(currentYear, currentMonth + 1, 0); // Ultimo giorno del mese corrente
      
      const costs = await this.fetchCostByDate(firstDayOfThisMonth, lastDayOfThisMonth);
      const incomes = await this.fetchIncomeByDate(firstDayOfThisMonth, lastDayOfThisMonth);

      //TODO ALERT ERRORE SERVER
      if(!costs)
        return;

      // Raggruppa i costi per categoria e calcola il totale per ciascuna categoria
      this.categoryData = costs.reduce((acc, cost) => {

        const categoryName = cost.category.description;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            total: 0,
            data: [],
            type: -1,
          };
        }
        acc[categoryName].total += cost.price;
        acc[categoryName].type = cost.category.type;
        acc[categoryName].data.push(cost.price);
        return acc;
      }, {});

      console.log(this.categoryData);

      // Assegna i prezzi dei costi alla variabile del grafico
      this.chartRefCategory.chart.data.datasets[0].data = Object.values(this.categoryData).map(category => category.total);
      this.chartRefCategory.chart.data.labels = Object.keys(this.categoryData);
      this.chartRefCategory.chart.update();

      const currentIncome = incomes.reduce((total, income) => total + income.income, 0);
      this.currentSpending = costs.reduce((total, cost) => total + cost.price, 0);

      this.tot50 = currentIncome * 50 / 100;
      this.tot30 = currentIncome * 30 / 100;
      this.tot20 = currentIncome * 20 / 100;

      for (const category in this.categoryData) {
        if(this.categoryData[category].type === 1){
          this.current50 += this.categoryData[category].total;
        }
        else if(this.categoryData[category].type === 2){
          this.current30 += this.categoryData[category].total;
        }
        else if(this.categoryData[category].type === 3){
          this.current20 += this.categoryData[category].total;
        }
      }
    }
  }
}
</script>

<style scoped>
.financial-rule {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 20px auto;
  width: 80%;
}

.category {
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  text-align: center;
}
</style>