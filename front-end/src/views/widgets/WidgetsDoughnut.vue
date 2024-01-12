<template>
  <CRow>
    <CCol :xs="6">
      <CCard class="mb-4">
        <div>
          <CNav variant="tabs">
            <CNavItem v-for="(tab, index) in tabs" :key="index">
              <CNavLink :active="activeTab === index" @click="changeTab(index)" :style="{ cursor: 'pointer', color: '#374253'}">
                {{ tab.title }}
              </CNavLink>
            </CNavItem>
          </CNav>
          <div>
            <!-- Contenuto della tab 1 -->
            <div v-if="activeTab === 0">
              <CCardBody>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Necessary Cost:</span>
                    <span class="ms-auto fw-semibold">Expense limit: {{ (this.currentIncome * 50 / 100) }}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent50) ? "--": this.percent50  }}%)</span> 
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent50 < 100" color="success" :value="this.percent50">{{ this.currentNecessary }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent50)" color="success" :value="this.percent50">{{ this.currentNecessary }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent50">{{ this.currentNecessary }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Discretionary Expenses:</span>
                    <span class="ms-auto fw-semibold">Expense limit: {{ (this.currentIncome * 30 / 100) }}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent30) ? "--": this.percent30 }}%)</span>
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent30 < 100" color="warning" :value="this.percent30">{{ this.currentDiscretionary }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent30)" color="warning" :value="this.percent30">{{ this.currentDiscretionary }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent30">{{ this.currentDiscretionary }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Savings/Investments:</span>
                    <span class="ms-auto fw-semibold">Savings limit: {{ (this.currentIncome * 20 / 100) }}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent20) ? "--": this.percent20}}%)</span>
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent20 < 100" color="info" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent20)" color="info" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
              </CCardBody>
            </div>
            <div v-if="activeTab === 1">
              <CCardBody>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Necessary Cost:</span>
                    <span class="ms-auto fw-semibold">Expense limit: {{ (this.currentIncome * 80 / 100)}}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent80) ? "--": this.percent80}}%)</span>
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent80 < 100" color="success" :value="this.percent80">{{ this.currentNecessary + this.currentDiscretionary }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent80)" color="success" :value="this.percent80">{{ this.currentNecessary + this.currentDiscretionary }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent80">{{ this.currentNecessary + this.currentDiscretionary }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Savings/Investments:</span>
                    <span class="ms-auto fw-semibold">Savings limit: {{ (this.currentIncome * 20 / 100) }}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent20) ? "--": this.percent20 }}%)</span>
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent20 < 100" color="warning" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent20)" color="warning" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
              </CCardBody>
            </div>
            <div v-if="activeTab === 2">
              <CCardBody>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Necessary Cost:</span>
                    <span class="ms-auto fw-semibold">Expense limit: {{ (this.currentIncome * 60 / 100) }}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent60) ? "--": this.percent60 }}%)</span>
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent60 < 100" color="success" :value="this.percent60">{{ this.currentNecessary }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent60)" color="success" :value="this.percent60">{{ this.currentNecessary }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent60">{{ this.currentNecessary }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Discretionary Expenses:</span>
                    <span class="ms-auto fw-semibold">Expense limit: {{ (this.currentIncome * 20 / 100)}}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent20Disc) ? "--": this.percent20Disc }}%)</span>
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent20Disc < 100" color="warning" :value="this.percent20Disc">{{ this.currentDiscretionary }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent20Disc)" color="warning" :value="this.percent20Disc">{{ this.currentDiscretionary }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent20Disc">{{ this.currentDiscretionary }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
                <div class="progress-group">
                  <div class="progress-group-header">
                    <span class="title">Savings/Investments:</span>
                    <span class="ms-auto fw-semibold">Savings limit: {{ (this.currentIncome * 20 / 100) }}€
                      <span class="text-medium-emphasis small">({{ isNaN(this.percent20) ? "--": this.percent20 }}%)</span>
                    </span>
                  </div>
                  <div class="progress-group-bars">
                    <CProgress class="mb-3">
                      <CProgressBar v-if="this.percent20 < 100" color="info" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                      <CProgressBar v-else-if="isNaN(this.percent20)" color="info" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                      <CProgressBar v-else color="danger" variant="striped" :value="this.percent20">{{ this.currentSaves }}€</CProgressBar>
                    </CProgress>
                  </div>
                </div>
              </CCardBody>
            </div>
            <!-- Contenuto delle altre schede... -->
          </div>
        </div>
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
import { CNav, CNavItem, CNavLink } from '@coreui/vue';

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
    CNav,
    CNavItem,
    CNavLink,
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
      percent50: 0,
      percent30: 0,
      percent20: 0,
      percent20Disc: 0,
      currentIncome: 0,
      currentNecessary: 0,
      currentDiscretionary: 0,
      currentSaves: 0,
      chartData: {
        labels: ["test","troia","testone"], // Etichette dell'asse x
        datasets: [
          {
            //TODO Far si che prende il colore dalla category e far si che lo vedo nella tabella di categoria etc
            backgroundColor: [
              '#41B883', '#E46651', '#00D8FF', '#DD1B16',
              '#34A853', '#FF8800', '#1A73E8', '#FABC09',
              '#4285F4', '#EA4335', '#FBBC05', '#34A853',
              '#FF5500', '#651FFF', '#FF6F00', '#2979FF',
              '#FFD600', '#6200EA', '#F50057', '#0091EA',
              '#FF3D00', '#3D5AFE', '#FFAB00', '#304FFE',
            ],
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
      },
      tabs: [
        { title: 'Rule 50/30/20'},
        { title: 'Rule 80/20'},
        { title: 'Rule 60/20/20'},
      ],
      activeTab: 0,
    }
  },
  mounted() {   
    this.chartRefCategory = this.$refs.chartCategory; // Riferimento al componente CChart
    this.calculateStats();   
  },
  methods:{
    changeTab(index) {
      this.activeTab = index;
    },
    async setActiveButton(button) {
      this.activeButton = button;

      if(this.activeButton === 'year'){
        this.chartRefCategory.chart.data.datasets[0].data = Object.values(this.categoryDataYear).map(category => category.total);
        this.chartRefCategory.chart.data.labels = Object.keys(this.categoryDataYear);
        //this.chartRefCategory.chart.data.datasets[0].backgroundColor = Object.values(this.categoryDataYear).map(category => category.color);
        this.chartRefCategory.chart.update();
      }
      else{
        this.chartRefCategory.chart.data.datasets[0].data = Object.values(this.categoryDataMonth).map(category => category.total);
        this.chartRefCategory.chart.data.labels = Object.keys(this.categoryDataMonth);
        //this.chartRefCategory.chart.data.datasets[0].backgroundColor = Object.values(this.categoryDataMonth).map(category => category.color);
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
            color: cost.category.color,
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

      // Assegna i dati al grafico di categoria
      //this.chartRefCategory.chart.data.datasets[0].backgroundColor = Object.values(this.categoryDataMonth).map(category => category.color);
      this.chartRefCategory.chart.data.datasets[0].data = Object.values(this.categoryDataMonth).map(category => category.total);
      this.chartRefCategory.chart.data.labels = Object.keys(this.categoryDataMonth);
      this.chartRefCategory.chart.update();

      this.currentIncome = incomes.reduce((total, income) => total + income.income, 0);
      this.currentSpending = costs.reduce((total, cost) => total + cost.price, 0);

      const tot50 = this.currentIncome * 50 / 100;
      const tot30 = this.currentIncome * 30 / 100;
      const tot80 = this.currentIncome * 80 / 100;
      const tot60 = this.currentIncome * 60 / 100;
      const tot20 = this.currentIncome * 20 / 100;

      for (const category in this.categoryDataMonth) {
        if(this.categoryDataMonth[category].type === 1){
          this.currentNecessary += this.categoryDataMonth[category].total;
        }
        else if(this.categoryDataMonth[category].type === 2){
          this.currentDiscretionary += this.categoryDataMonth[category].total;
        }
        else if(this.categoryDataMonth[category].type === 3){
          this.currentSaves += this.categoryDataMonth[category].total;
        }
      }

      this.percent50 = Number( parseFloat((this.currentNecessary / tot50) * 100).toFixed(2));
      this.percent30 = Number(parseFloat((this.currentDiscretionary / tot30) * 100).toFixed(2));
      this.percent20 = Number(parseFloat((this.currentSaves / tot20) * 100).toFixed(2));

      this.percent80 = Number(parseFloat(((this.currentNecessary + this.currentDiscretionary) / tot80) * 100).toFixed(2));
      this.percent60 = Number(parseFloat((this.currentNecessary / tot60) * 100).toFixed(2));
      this.percent20Disc = Number(parseFloat((this.currentDiscretionary / tot20) * 100).toFixed(2));

      console.log(this.percent50);
    }
  }
}
</script>