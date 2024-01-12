<template>
  <div>
    <CRow>
      <WidgetSummary  v-if="dataFetched" :data-costs="this.fetchCosts" :data-incomes="this.fetchIncomes" :data-old-costs="this.fetchOldCosts" :data-old-incomes="this.fetchOldIncome"/>
    </CRow>
    <CRow>
    <WidgetsDoughnut v-if="dataFetched" :data-costs="this.fetchCosts" :data-incomes="this.fetchIncomes" :data-costs-year="this.fetchCostsYear"/>
    </CRow>
  </div>
</template>

<script>

//TODO FIXARE LE PERCENTUALI SE NON ESISTONO COSTI O INCOME NEL MESE SCORSO
import WidgetSummary from '../widgets/WidgetsStatsSummary.vue'
import WidgetsDoughnut from '../widgets/WidgetsDoughnut.vue'
import axios from 'axios';

export default {
  name: 'DashboardUser',
  components: {
    WidgetSummary,
    WidgetsDoughnut,
  },
  data() {
    return {
      fetchCosts: null,
      fetchIncomes: null,
      fetchOldIncome: null,
      fetchOldCosts: null,
      fetchCostsYear: null,
      dataFetched: false,
    };
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
  },
  async mounted() {

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // I mesi in JavaScript partono da 0
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const firstDayOfThisMonth = new Date(currentYear, currentMonth, 1); // Primo giorno del mese corrente
    const lastDayOfThisMonth = new Date(currentYear, currentMonth + 1, 0); // Ultimo giorno del mese corrente

    this.fetchCosts = await this.fetchCostByDate(firstDayOfThisMonth, lastDayOfThisMonth);
    this.fetchIncomes = await this.fetchIncomeByDate(firstDayOfThisMonth, lastDayOfThisMonth);

    const firstDayOfLastMonth = new Date(currentYear, lastMonth, 1); // Primo giorno del mese precedente
    //const lastDayOfLastMonth = new Date(currentYear, currentMonth, 0); // Ultimo giorno del mese precedente
      
    this.fetchOldIncome = await this.fetchIncomeByDate(firstDayOfLastMonth, currentDate);
    this.fetchOldCosts = await this.fetchCostByDate(firstDayOfLastMonth, currentDate);

    const firstDayOfThisYear = new Date(currentYear, 0, 1); // Primo giorno dell'anno

    //this.fetchOldIncome = await this.fetchIncomeByDate(firstDayOfThisYear, lastDayOfThisMonth);
    this.fetchCostsYear = await this.fetchCostByDate(firstDayOfThisYear, lastDayOfThisMonth);
    this.dataFetched = true;
  },
  setup() {
    const progressGroupExample1 = [
      { title: 'Monday', value1: 34, value2: 78 },
      { title: 'Tuesday', value1: 56, value2: 94 },
      { title: 'Wednesday', value1: 12, value2: 67 },
      { title: 'Thursday', value1: 43, value2: 91 },
      { title: 'Friday', value1: 22, value2: 73 },
      { title: 'Saturday', value1: 53, value2: 82 },
      { title: 'Sunday', value1: 9, value2: 69 },
    ]
    const progressGroupExample2 = [
      { title: 'Male', icon: 'cil-user', value: 53 },
      { title: 'Female', icon: 'cil-user-female', value: 43 },
    ]
    const progressGroupExample3 = [
      {
        title: 'Organic Search',
        icon: 'cib-google',
        percent: 56,
        value: '191,235',
      },
      { title: 'Facebook', icon: 'cib-facebook', percent: 15, value: '51,223' },
      { title: 'Twitter', icon: 'cib-twitter', percent: 11, value: '37,564' },
      { title: 'LinkedIn', icon: 'cib-linkedin', percent: 8, value: '27,319' },
    ]
    return {
      progressGroupExample1,
      progressGroupExample2,
      progressGroupExample3,
    }
  },
}
</script>
