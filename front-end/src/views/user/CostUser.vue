<template>
  <CRow>
      <CAlert id="MyAlert" color="danger" :visible="liveAlert" dismissible @close="() => { liveAlert = false }">{{ alertText }}</CAlert>
      <CCol :md="12">
          <CCard class="mb-4">
              <CCardBody>
                  <CCardTitle>Cost</CCardTitle>
                  <CContainer class="pt-2">
                    <CRow class="align-items-end">
                        <CCol xs="5">
                            <CFormLabel for="inputDate">Date Start:</CFormLabel>
                            <VueDatePicker v-model="startDate" :enable-time-picker="false"></VueDatePicker>
                        </CCol>
                        <CCol xs="5">
                            <CFormLabel for="inputDate">Date End:</CFormLabel>
                            <VueDatePicker v-model="endDate" :enable-time-picker="false"></VueDatePicker>
                        </CCol>
                        <CCol xs="2" class="d-flex justify-content-end align-items-end">
                            <span class="mx-1" @click="fetchCostByDate()">
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
                          <span @click="deleteCost(props.row.id)">
                              <CIcon :icon="cilTrash" size="xl"/>
                          </span>
                      </span>
                      <span v-else-if="props.column.field == 'category' || props.column.field == 'wallet'">
                          {{props.formattedRow[props.column.field].description}}
                      </span>
                      <span v-else-if="props.column.field == 'price'">
                          {{props.formattedRow[props.column.field]}}€	
                      </span>
                      <span v-else>
                          {{props.formattedRow[props.column.field]}}
                      </span>
                  </template>
                  <template #selected-row-actions>
                      <span @click="deleteCostRow();">
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
            <CFormLabel for="inputPrice">Price</CFormLabel>
            <CFormInput
              id="inputPrice"
              :class="{ 'is-invalid': fieldErrors.price }"
              type="number"
              min=0
              :value=0
              />
              <div v-if="fieldErrors.price" class="invalid-feedback">{{ errorMessages.price }}</div>
          </CCol>
          <CCol md="6">
            <CFormLabel for="inputCategory">Category</CFormLabel>
            <CFormSelect
                id="inputCategory"
                aria-label="Select a category"
                :options="categoryRows"
                v-model="selectedCategory"
                :class="{ 'is-invalid': fieldErrors.category }"
            >
            </CFormSelect>
            <div v-if="fieldErrors.category" class="invalid-feedback">{{ errorMessages.category }}</div>
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
            <VueDatePicker id="inputDate" v-model="selectedDate" :class="{ 'is-invalid': fieldErrors.date }" :enable-time-picker="false"><div v-if="fieldErrors.date" class="invalid-feedback">{{ errorMessages.date }}</div></VueDatePicker>
          </CCol>
          <CCol md="6">
            <CFormCheck id="CheckAmortization" label="Amortization" v-model="showAmortization"/>
            <div v-if="showAmortization">
                <CFormRange label="How many months:" :min="2" :max="36" :value="3" v-model="selectedMonths" id="customRange2"/>
                <p>Selected Months: {{ selectedMonths }}</p>
            </div>
          </CCol>
          <CModalFooter>
          <CButton color="secondary" @click="CloseModal()">
              Close
          </CButton>
          <CButton color="primary" @click="addCost()">Add</CButton>
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
                <CFormLabel for="inputEditPrice">Price</CFormLabel>
                <CFormInput
                id="inputEditPrice"
                :class="{ 'is-invalid': fieldErrors.price }"
                type="number"
                min=0
                />
                <div v-if="fieldErrors.editPrice" class="invalid-feedback">{{ errorMessages.editPrice }}</div>
            </CCol>
            <CCol md="6">
                <CFormLabel for="inputEditCategory">Category</CFormLabel>
                <CFormSelect
                    id="inputEditCategory"
                    aria-label="Select a category"
                    :options="categoryRows"
                    v-model="selectedEditCategory"
                    :class="{ 'is-invalid': fieldErrors.editCategory }"
                >
                </CFormSelect>
                <div v-if="fieldErrors.editCategory" class="invalid-feedback">{{ errorMessages.editCategory }}</div>
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
                <VueDatePicker id="inputEditDate" v-model="selectedDate" :class="{ 'is-invalid': fieldErrors.editDate }" :enable-time-picker="false"><div v-if="fieldErrors.date" class="invalid-feedback">{{ errorMessages.date }}</div></VueDatePicker>
            </CCol>
            <CModalFooter>
            <CButton color="secondary" @click="CloseModal()">
                Close
            </CButton>
            <CButton color="primary" @click="updateCost()">Update</CButton>
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
      VueDatePicker ,
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
      showAmortization: false,
      selectedMonths: "3",
      ModalAdd: false,
      ModalEdit: false,
      selectedDate: '',
      liveAlert: false,
      selectedEditWallet: null,
      selectedEditCategory: null,
      alertText: "",
      EditID: null,
      selectedCategory: null,
      categoryRows: [],
      selectedWallet: null,
      walletRows: [],
      selectedRows: [],
      rows: [],
      fieldErrors: {
          date: false,
          category: false,
          wallet: false,
          price: false,
          editDate: false,
          editCategory: false,
          editWallet: false,
          editPrice: false,
      },
      errorMessages: {
          date: "Questo campo non può essere vuoto",
          price: "Il prezzo deve essere maggiore di 0",
          category: "Devi selezionare una categoria",
          wallet: "Devi selezionare un wallet",
      },
      columns: [
          {
            label: 'Price',
            field: 'price',
            type: 'number',
          },
          {
            label: 'Description',
            field: 'description',
          },
          {
            label: 'Category',
            field: 'category',
            type: 'number',
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
            dateInputFormat: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
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
    this.fetchCategory();

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // I mesi in JavaScript partono da 0

    this.startDate = new Date(currentYear, currentMonth, 1); // Primo giorno del mese corrente
    this.endDate = currentDate; // Ultimo giorno del mese corrente
    this.fetchCostByDate();

    this.selectedDate = currentDate;
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
        this.selectedCategory = null;
        this.selectedWallet = null;
        this.selectedEditCategory = null;
        this.selectedEditWallet = null; 

        this.resetFieldErrors();
  },
  async openEditModal(row){ //Open and setting up the modal to edit value
        this.selectedEditCategory = row.category.id;
        this.selectedEditWallet = row.wallet.id;
        this.ModalEdit = true;

        this.$nextTick(() => {
            const inputEditDescription = document.getElementById('inputEditDescription');
            const inputEditDate = document.getElementById('inputEditDate');
            const inputEditPrice = document.getElementById('inputEditPrice');

            if (inputEditDescription && inputEditDate) {
                inputEditDescription.value = row.description;
                inputEditDate.value = row.date;
                inputEditPrice.value = row.price;
                this.EditID = row.id;
            }
        });  
  },
  async fetchWallet() {
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
  async fetchCategory() {
    try {
        const responseCategories = await axios.get('http://localhost:3000/api/categories/');
        const categories = responseCategories.data;

        this.categoryRows = [
            { label: 'Select a category', value: -1 }, // Default option
            ...categories.map(category => ({
                label: category.description, // Use the appropriate property of the category data
                value: parseFloat(category.id),   // Use the appropriate property of the category data
            })),
        ];
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
  },
  async fetchCost() { //Function to fetch the table
    try {
        const responseCosts = await axios.get('http://localhost:3000/api/costs/');
        this.rows = responseCosts.data;
    } catch (error) {
        console.error('Error fetching costs:', error);
    }
  },
  async fetchCostByDate(){
    try {
        const responseCosts = await axios.get('http://localhost:3000/api/costs', {
            params: {
                startDate: this.startDate,
                endDate: this.endDate
            }
        })

        this.rows = responseCosts.data;
    } catch (error) {
        console.error('Error fetching costs:', error);
    }
  },
  async addCost() { //Add a row in the database of the server 

    
    const inputDescription = document.getElementById('inputDescription');
    const inputPrice = document.getElementById('inputPrice');

    const priceValue = parseFloat(inputPrice.value);
    if (!isNaN(priceValue)) { // Arrotonda il valore money a due decimali
        inputPrice.value = priceValue.toFixed(2);
    }

    if (!this.selectedCategory || this.selectedCategory < 0) {
        this.fieldErrors.category = true; // Set category error state
        return;
    } else {
        this.fieldErrors.category = false; // Reset category error state on validation success
    }
        
    if (!this.selectedWallet || this.selectedWallet < 0) {
        this.fieldErrors.wallet = true; // Set wallet error state
        return;
    } else {
        this.fieldErrors.wallet = false; // Reset wallet error state on validation success
    }

    const newData = {
        description: inputDescription.value,
        date: this.selectedDate,
        status: 0,
        price: parseFloat(inputPrice.value),
        wallet: this.selectedWallet,
        category: this.selectedCategory,
        checkAmortization: this.showAmortization,
        selectedMonths: this.selectedMonths,
    };

    // Validate input fields
    if (!newData.date || newData.date === '') {
        this.fieldErrors.date = true; // Set date error state
        return;
    } else {
        this.fieldErrors.date = false; // Reset date error state on validation success
    }

    console.log(newData);
    // Validate input fields
    if (!newData.price || newData.price < 0) {
        this.fieldErrors.price = true; // Set date error state
        return;
    } else {
        this.fieldErrors.price = false; // Reset date error state on validation success
    }

    // Send request to create category
    try {
        await axios.post('http://localhost:3000/api/costs/', newData); // Replace with actual POST endpoint
        this.fetchCostByDate(); // Update the table
    } catch (error) {
        console.error('Error adding new category:', error);
        this.sendAlert(error);
    }

    this.selectedCategory = null;
    this.selectedWallet = null;
    this.ModalAdd = false; // Close the Add Category modal
  },
  async updateCost(){ //Update a row in the database //TODO SISTEMARE LA FUNZIONE + ORDINE SULLA TABELLA PER WALLET O CATEGORY
    const inputEditDescription = document.getElementById('inputEditDescription');
    const inputEditDate = document.getElementById('inputEditDate');
    const inputEditPrice = document.getElementById('inputEditPrice');

    const priceValue = parseFloat(inputEditPrice.value);
    if (!isNaN(priceValue)) { // Arrotonda il valore money a due decimali
        inputEditPrice.value = priceValue.toFixed(2);
    }

    if (!this.selectedEditCategory || this.selectedEditCategory < 0) {
        this.fieldErrors.editCategory = true; // Set category error state
        return;
    } else {
        this.fieldErrors.editCategory = false; // Reset category error state on validation success
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
        price: parseFloat(inputEditPrice.value),
        wallet: parseFloat(this.selectedEditWallet),
        category: parseFloat(this.selectedEditCategory),
    };

    if (!updateData.date || updateData.date === '') {
      this.fieldErrors.editDate = true; // Set error state for date input
      return;
    } else {
      this.fieldErrors.editDate = false; // Reset error state if validation passes
    }

    try {
      const response = await axios.post(`http://localhost:3000/api/costs/${this.EditID}`,updateData);

      console.log('Update category:', response.data);
      // Update the table
      this.fetchCostByDate();
    } catch (error) {
      console.error('Error updating category:', error);
      this.sendAlert(error);
    }

    this.ModalEdit = false;
  },
  async deleteCost(id) { //Delete row in the database
      try {
          await axios.delete(`http://localhost:3000/api/costs/${id}`);
          this.fetchCostByDate();// Update the table
      } catch (error) {
          console.error('Error deleting category:', error);
      }
  },
  async deleteCostRow() { //Delete all the row selected in the database
      try {
          const rows = this.selectedRows;
          for (const row of rows) {
              await this.deleteCost(row.id);
          }
          
          // Update the table
          this.fetchCostByDate();
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
