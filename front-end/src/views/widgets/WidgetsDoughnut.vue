<template>
  <CRow>
    <CCol :xs="6">
      <CCard class="mb-4">
      <CCardHeader>Rule 50/30/20</CCardHeader>
      <CCardBody>
        <div class="category">
          <h4>Necessary Cost: (50%)</h4>
          <p>Expense limit: {{ this.tot50  }}€</p>
          <p>Spent so far: {{ this.current50 }}€</p>
          <p>Still available: {{ this.tot50 - this.current50 }}€</p>
        </div>
          <div class="category">
          <h4>Discretionary Expenses (30%)</h4>
          <p>Expense limit: {{ this.tot30 }}€</p>
          <p>Spent so far: {{ this.current30 }}€</p>
          <p>Still available: {{ this.tot30 - this.current30 }}€</p>
        </div>
        <div class="category">
          <h4>Savings/Investments (20%)</h4>
          <p>Savings limit: {{ this.tot20 }}€</p>
          <p>RSaved so far: {{ this.current20 }}€</p>
          <p>Still available: {{ this.tot20 - this.current20 }}€</p>
        </div>
      </CCardBody>
      </CCard>
    </CCol>
    <CCol :xs="6">
      <CCard class="mb-4">
        <CCardHeader><h4 class="card-title m-30">Costs divided by category</h4>
          <CButtonGroup
                  class="float-end me-2"
                  role="group"
                >
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

export default {
  name: 'WidgetsDoughnut',
  props: {
    dataCosts: {
      type: Object,
      required: true
    },
    dataIncomes: {
      type: Object,
      required: true
    },
    dataCostsYear: {
      type: Object,
      required: true
    }
  },
  components: {
    CChart,
  },
  data(){
    return {
      categoryDataMonth: null,
      categoryDataYear: null,
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

      if(this.activeButton === 'year'){
        this.chartRefCategory.chart.data.datasets[0].data = Object.values(this.categoryDataYear).map(category => category.total);
        this.chartRefCategory.chart.data.labels = Object.keys(this.categoryDataYear);
        this.chartRefCategory.chart.update();
      }
      else{
        this.chartRefCategory.chart.data.datasets[0].data = Object.values(this.categoryDataMonth).map(category => category.total);
        this.chartRefCategory.chart.data.labels = Object.keys(this.categoryDataMonth);
        this.chartRefCategory.chart.update();
      }
    },
    async calculateChart(costs){
        return costs.reduce((acc, cost) => {

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
    },
    async calculateStats(){
      
      const costs = this.dataCosts;
      const costsYear = this.dataCostsYear;
      const incomes = this.dataIncomes;

      //TODO ALERT ERRORE SERVER
      if(!costs || !incomes || !costsYear)
        return;

      // Raggruppa i costi per categoria e calcola il totale per ciascuna categoria
      this.categoryDataMonth = await this.calculateChart(costs);
      this.categoryDataYear = await this.calculateChart(costsYear);

      //console.log(this.categoryDataMonth);
      //console.log(this.categoryDataYear);

      // Assegna i dati al grafico di categoria
      this.chartRefCategory.chart.data.datasets[0].data = Object.values(this.categoryDataMonth).map(category => category.total);
      this.chartRefCategory.chart.data.labels = Object.keys(this.categoryDataMonth);
      this.chartRefCategory.chart.update();

      const currentIncome = incomes.reduce((total, income) => total + income.income, 0);
      this.currentSpending = costs.reduce((total, cost) => total + cost.price, 0);

      this.tot50 = currentIncome * 50 / 100;
      this.tot30 = currentIncome * 30 / 100;
      this.tot20 = currentIncome * 20 / 100;

      for (const category in this.categoryDataMonth) {
        if(this.categoryDataMonth[category].type === 1){
          this.current50 += this.categoryDataMonth[category].total;
        }
        else if(this.categoryDataMonth[category].type === 2){
          this.current30 += this.categoryDataMonth[category].total;
        }
        else if(this.categoryDataMonth[category].type === 3){
          this.current20 += this.categoryDataMonth[category].total;
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