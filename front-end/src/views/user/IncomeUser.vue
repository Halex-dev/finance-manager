<template>
    <CRow>
        <CAlert id="MyAlert" color="danger" :visible="liveAlert" dismissible @close="() => { liveAlert = false }">{{ alertText }}</CAlert>
        <CCol :md="12">
            <CCard class="mb-4">
                <CCardBody>
                    <CCardTitle>Income</CCardTitle>
                    <CContainer class="pt-2">
                    <CRow>
                        <CCol xs="5">
                            <CFormLabel for="inputDate">Date Start:</CFormLabel>
                            <VueDatePicker v-model="startDate" :enable-time-picker="false"></VueDatePicker>
                        </CCol>
                        <CCol xs="5">
                            <CFormLabel for="inputDate">Date End:</CFormLabel>
                            <VueDatePicker v-model="endDate" :enable-time-picker="false"></VueDatePicker>
                        </CCol>
                        <CCol xs="2" class="d-flex justify-content-end align-items-end">
                            <span class="mx-1" @click="fetchIncomeByDate()">
                                <CIcon :icon="cilSearch" size="xxl"/>
                            </span>
                            <span @click="() => { ModalAdd = true }">
                                <CIcon :icon="cibAddthis" size="xxl"/>
                            </span>
                        </CCol>
                    </CRow>
                    </CContainer>
                    <div class="pt-4">
                        <vue-good-table class="items-center w-full bg-transparent border-collapse"
                        v-on:selected-rows-change="selectionChanged"
                        :columns="columns"
                        :rows="rows"
                        :select-options="{ 
                            enabled: true,
                            selectOnCheckboxOnly: true,
                        }"
                        :pagination-options="{
                            enabled: true,
                            mode: 'records' 
                        }"
                        :search-options="{
                            enabled: true
                        }"
                        styleClass="vgt-table">
                        
                        <template #table-row="props">
                            <span v-if="props.column.field == 'buttons'">
                                <span @click="openEditModal(props.row)">
                                    <CIcon :icon="cilPen" size="xl"/>
                                </span>
                                <span @click="deleteIncome(props.row.id)">
                                    <CIcon :icon="cilTrash" size="xl"/>
                                </span>
                            </span>
                            <span v-else-if="props.column.field == 'wallet'">
                                {{props.formattedRow[props.column.field].description}}
                            </span>
                            <span v-else-if="props.column.field == 'income'">
                                {{props.formattedRow[props.column.field]}}€	
                            </span>
                            <span v-else>
                                {{props.formattedRow[props.column.field]}}
                            </span>
                        </template>
                        <template #selected-row-actions>
                            <span @click="deleteIncomeRow();">
                                <CIcon :icon="cilTrash" size="xl"/>
                            </span>
                        </template>
                        </vue-good-table>
                    </div>  
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
    <CModal size="lg" alignment="center" backdrop="static" :visible="ModalAdd" @close="CloseModal()">
        <CModalHeader>
        <CModalTitle>Modal title</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm class="row g-3">
            <CCol md="12">
            <CFormLabel for="inputDescription">Description</CFormLabel>
            <CFormInput
                id="inputDescription"
                />
            </CCol>
            <CCol md="6">
              <CFormLabel for="inputIncome">Income</CFormLabel>
              <CFormInput
                id="inputIncome"
                :class="{ 'is-invalid': fieldErrors.income }"
                type="number"
                min=0
                :value=0
                />
                <div v-if="fieldErrors.income" class="invalid-feedback">{{ errorMessages.income }}</div>
            </CCol>
            <CCol md="6">
              <CFormLabel for="inputWallet">Wallet</CFormLabel>
              <CFormSelect
                  aria-label="Select a wallet"
                  :options="walletRows"
                  v-model="selectedWallet"
                  :class="{ 'is-invalid': fieldErrors.wallet }"
              >
              </CFormSelect>
              <div v-if="fieldErrors.wallet" class="invalid-feedback">{{ errorMessages.wallet }}</div>
            </CCol>
            <CCol md="6">
            <CFormLabel for="inputDate">Date</CFormLabel>
            <CFormInput
                type="date"
                id="inputDate"
                v-model="selectedDate"
                :class="{ 'is-invalid': fieldErrors.date }"
                />
                <div v-if="fieldErrors.date" class="invalid-feedback">{{ errorMessages.date }}</div>
            </CCol>
            <CModalFooter>
            <CButton color="secondary" @click="CloseModal()">
                Close
            </CButton>
            <CButton color="primary" @click="addIncome()">Add</CButton>
            </CModalFooter>
        </CForm>
        </CModalBody>
    </CModal>
    <CModal size="lg" alignment="center" backdrop="static" :visible="ModalEdit" @close="CloseModal()">
          <CModalHeader>
          <CModalTitle>Edit Category</CModalTitle>
          </CModalHeader>
          <CModalBody>
          <CForm class="row g-3">
              <CCol md="12">
              <CFormLabel for="inputEditDescription">Description</CFormLabel>
              <CFormInput
                  id="inputEditDescription"
                  />
              </CCol>
              <CCol md="6">
                  <CFormLabel for="inputEditIncome">Income</CFormLabel>
                  <CFormInput
                  id="inputEditIncome"
                  :class="{ 'is-invalid': fieldErrors.income }"
                  type="number"
                  min=0
                  />
                  <div v-if="fieldErrors.editIncome" class="invalid-feedback">{{ errorMessages.editIncome }}</div>
              </CCol>
              <CCol md="6">
                  <CFormLabel for="inputEditWallet">Wallet</CFormLabel>
                  <CFormSelect
                      aria-label="Select a wallet"
                      :options="walletRows"
                      v-model="selectedEditWallet"
                      :class="{ 'is-invalid': fieldErrors.editWallet }"
                  >
                  </CFormSelect>
                  <div v-if="fieldErrors.editWallet" class="invalid-feedback">{{ errorMessages.editWallet }}</div>
                  </CCol>
              <CCol md="6">
              <CFormLabel for="inputEditDate">Date</CFormLabel>
              <CFormInput
                  type="date"
                  id="inputEditDate"
                  v-model="selectedDate"
                  :class="{ 'is-invalid': fieldErrors.editDate }"
                  />
                  <div v-if="fieldErrors.editDate" class="invalid-feedback">{{ errorMessages.date }}</div>
              </CCol>
              <CModalFooter>
              <CButton color="secondary" @click="CloseModal()">
                  Close
              </CButton>
              <CButton color="primary" @click="updateIncome()">Update</CButton>
              </CModalFooter>
        </CForm>
        </CModalBody>
    </CModal>
    
  </template>
  
<script>
import axios from 'axios';
import 'vue-good-table-next/dist/vue-good-table-next.css'
import { VueGoodTable } from 'vue-good-table-next';
import { CIcon } from '@coreui/icons-vue';
import { cibAddthis, cilPen, cilTrash, cilSearch } from '@coreui/icons';
import VueDatePicker  from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

  export default {
  components: {
        VueGoodTable,
        CIcon,
        VueDatePicker,
    },
  setup() {
    return {
        cilTrash,
        cibAddthis,
        cilPen,
        cilSearch,
    }
  },
  data(){
    return {
        startDate: null, // La data di inzio selezionata
        endDate: null, // La data di fine selezionata
        ModalAdd: false,
        ModalEdit: false,
        selectedDate: '',
        liveAlert: false,
        selectedEditWallet: null,
        alertText: "",
        EditID: null,
        categoryRows: [],
        selectedWallet: null,
        walletRows: [],
        selectedRows: [],
        rows: [],
        fieldErrors: {
            date: false,
            wallet: false,
            income: false,
            editDate: false,
            editWallet: false,
            editIncome: false,
        },
        errorMessages: {
            date: "Questo campo non può essere vuoto",
            income: "Il prezzo deve essere maggiore di 0",
            category: "Devi selezionare una categoria",
            wallet: "Devi selezionare un wallet",
        },
        columns: [
            {
              label: 'Income',
              field: 'income',
              type: 'number',
            },
            {
              label: 'Description',
              field: 'description',
            },
            {
              label: 'Wallet',
              field: 'wallet',
              type: 'number',
            },
            {
              label: 'Created On',
              field: 'date',
              type: 'date',
              dateInputFormat: 'yyyy-MM-dd',
              dateOutputFormat: 'dd/MM/yyyy',
            },
            {
              label: 'Action',
              field: 'buttons',
              slot: 'buttons',
              sortable: false,
              globalSearchDisabled: true,
            },
          ],
    };
  },
  mounted() {
        this.fetchWallet();

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // I mesi in JavaScript partono da 0

        this.startDate = new Date(currentYear, currentMonth, 1); // Primo giorno del mese corrente
        this.endDate = currentDate; // Ultimo giorno del mese corrente
        this.fetchIncomeByDate();

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Add +1 cause months start from 0
        const day = String(today.getDate()).padStart(2, '0');
  
        this.selectedDate = `${year}-${month}-${day}`;
  },
  methods: {
    async selectionChanged(params) {
        this.selectedRows = params.selectedRows;
    },
    async resetFieldErrors(){
      for (const key in this.fieldErrors) {
          if (Object.hasOwnProperty.call(this.fieldErrors, key)) {
              this.fieldErrors[key] = false;
          }
       }
    },
    async CloseModal(){
          this.ModalAdd = false;
          this.ModalEdit = false;
          this.selectedWallet = null;
          this.selectedEditWallet = null; 
  
          this.resetFieldErrors();
    },
    async openEditModal(row){ //Open and setting up the modal to edit value
          this.selectedEditWallet = row.wallet.id;
          this.ModalEdit = true;
  
          this.$nextTick(() => {
              const inputEditDescription = document.getElementById('inputEditDescription');
              const inputEditDate = document.getElementById('inputEditDate');
              const inputEditIncome = document.getElementById('inputEditIncome');
  
              if (inputEditDescription && inputEditDate) {
                  inputEditDescription.value = row.description;
                  inputEditDate.value = row.date;
                  inputEditIncome.value = row.income;
                  this.EditID = row.id;
              }
          });  
    },
    async fetchWallet(){
        try {
          const responseWallets = await axios.get('http://localhost:3000/api/wallets/');
          const wallets = responseWallets.data;
  
          this.walletRows = [
              { label: 'Select a wallet', value: -1 }, // Default option
              ...wallets.map(wallet => ({
                  label: wallet.description, // Use the appropriate property of the wallet data
                  value: wallet.id,   // Use the appropriate property of the wallet data
              })),
          ];
          
      } catch (error) {
          console.error('Error fetching wallets:', error);
      }
    },
    async fetchIncome() { //Function to fetch the table
      try {
          const responseIncomes = await axios.get('http://localhost:3000/api/incomes/');
          this.rows = responseIncomes.data;
      } catch (error) {
          console.error('Error fetching costs:', error);
      }
    },
    async fetchIncomeByDate(){
        try {
            const responseIncomes = await axios.get('http://localhost:3000/api/incomes', {
                params: {
                    startDate: this.startDate,
                    endDate: this.endDate
                }
            })
            this.rows = responseIncomes.data;
        } catch (error) {
            console.error('Error fetching costs:', error);
        }
    },
    async addIncome() { //Add a row in the database of the server 
          const inputDescription = document.getElementById('inputDescription');
          const inputDate = document.getElementById('inputDate');
          const inputIncome = document.getElementById('inputIncome');
  
          const incomeValue = parseFloat(inputIncome.value);
          if (!isNaN(incomeValue)) { // Arrotonda il valore money a due decimali
              inputIncome.value = incomeValue.toFixed(2);
          }
  
          if (!this.selectedWallet || this.selectedWallet < 0) {
              this.fieldErrors.wallet = true; // Set wallet error state
              return;
          } else {
              this.fieldErrors.wallet = false; // Reset wallet error state on validation success
          }
  
          const newData = {
              description: inputDescription.value,
              date: inputDate.value,
              income: parseFloat(inputIncome.value),
              wallet: this.selectedWallet,
          };
  
          // Validate input fields
          if (!newData.date || newData.date === '') {
              this.fieldErrors.date = true; // Set date error state
              return;
          } else {
              this.fieldErrors.date = false; // Reset date error state on validation success
          }
  
          // Validate input fields
          if (!newData.income || newData.income < 0) {
              this.fieldErrors.income = true; // Set date error state
              return;
          } else {
              this.fieldErrors.income = false; // Reset date error state on validation success
          }
  
        // Send request to create category
        try {
            await axios.post('http://localhost:3000/api/incomes/', newData); // Replace with actual POST endpoint
            this.fetchIncomeByDate(); // Update the table
        } catch (error) {
            console.error('Error adding new category:', error);
            this.sendAlert(error);
        }
  
        this.selectedWallet = null;
        this.ModalAdd = false; // Close the Add Category modal
    },
    async updateIncome(){ //Update a row in the database

      const inputEditDescription = document.getElementById('inputEditDescription');
      const inputEditDate = document.getElementById('inputEditDate');
      const inputEditIncome = document.getElementById('inputEditIncome');
  
      const incomeValue = parseFloat(inputEditIncome.value);
      if (!isNaN(incomeValue)) { // Arrotonda il valore money a due decimali
          inputEditIncome.value = incomeValue.toFixed(2);
      }
  
      if (!this.selectedEditWallet || this.selectedEditWallet < 0) {
          this.fieldErrors.editWallet = true; // Set wallet error state
          return;
      } else {
          this.fieldErrors.editWallet = false; // Reset wallet error state on validation success
      }
  
      const updateData = {
          description: inputEditDescription.value,
          date: inputEditDate.value,
          income: parseFloat(inputEditIncome.value),
          wallet: parseFloat(this.selectedEditWallet),
      };
  
      if (!updateData.date || updateData.date === '') {
        this.fieldErrors.editDate = true; // Set error state for date input
        return;
      } else {
        this.fieldErrors.editDate = false; // Reset error state if validation passes
      }
  
      try {
        const response = await axios.post(`http://localhost:3000/api/incomes/${this.EditID}`,updateData);
  
        console.log('Update category:', response.data);
        // Update the table
        this.fetchIncomeByDate();
      } catch (error) {
        console.error('Error updating category:', error);
        this.sendAlert(error);
      }
  
      this.ModalEdit = false;
    },
    async deleteIncome(id) { //Delete row in the database
        try {
            await axios.delete(`http://localhost:3000/api/incomes/${id}`);
            this.fetchIncomeByDate();// Update the table
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    },
    async deleteIncomeRow() { //Delete all the row selected in the database
        try {
            const rows = this.selectedRows;
            for (const row of rows) {
                await this.deleteIncome(row.id);
            }
            
            // Update the table
            this.fetchIncomeByDate();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    },
    async sendAlert(error) { //Create an allert for the custom message
        this.alertText = error.response.data.message;
        this.liveAlert = true;
  
        setTimeout(() => {
            this.liveAlert = false;
        }, 5000); // 5000 milliseconds = 5 seconds
    },
  },
  };
  </script>
  
  
  