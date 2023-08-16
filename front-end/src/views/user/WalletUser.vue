<template>
    <CRow>
        <CAlert id="MyAlert" color="danger" :visible="liveExampleVisible" dismissible @close="() => { liveExampleVisible = false }">{{ alertText }}</CAlert>
        <CCol :md="12">
            <CCard class="mb-4">
                <CCardBody>
                    <CCardTitle>Wallet</CCardTitle>
                    <div class="d-flex flex-row-reverse my-2">
                        <span @click="() => { ModalAdd = true }">
                            <CIcon :icon="cibAddthis" size="xl"/>
                        </span>
                    </div>
                    
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
                            <span @click="OpenEditModal(props.row)">
                                <CIcon :icon="cilPen" size="xl"/>
                            </span>
                            <span @click="deleteWallet(props.row.id)">
                                <CIcon :icon="cilTrash" size="xl"/>
                            </span>
                        </span>
                        <span v-else-if="props.column.field == 'money'">
                            {{props.formattedRow[props.column.field]}} €
                        </span>
                        <span v-else>
                            {{props.formattedRow[props.column.field]}}
                        </span>
                    </template>
                    <template #selected-row-actions>
                        <span @click="deleteWalletRow();">
                            <CIcon :icon="cilTrash" size="xl"/>
                        </span>
                    </template>
                    </vue-good-table>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
    <CModal size="lg" alignment="center" backdrop="static" :visible="ModalAdd" @close="() => { ModalAdd = false }">
        <CModalHeader>
        <CModalTitle>Modal title</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm class="row g-3">
            <CCol md="12">
            <CFormLabel for="inputDescription">Description</CFormLabel>
            <CFormInput
                id="inputDescription"
                :class="{ 'is-invalid': fieldErrors.description }"
                />
                <div v-if="fieldErrors.description" class="invalid-feedback">{{ errorMessages.description }}</div>
            </CCol>
            <CCol md="6">
              <CFormLabel for="inputMoney">Money</CFormLabel>
              <CFormInput
                id="inputMoney"
                :class="{ 'is-invalid': fieldErrors.money }"
                type="number"
                min=0
                :value=0
                />
                <div v-if="fieldErrors.money" class="invalid-feedback">{{ errorMessages.money }}</div>
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
            <CButton color="secondary" @click="() => { ModalAdd = false }">
                Close
            </CButton>
            <CButton color="primary" @click="addWallet()">Add</CButton>
            </CModalFooter>
        </CForm>
        </CModalBody>
    </CModal>
    <CModal size="lg" alignment="center" backdrop="static" :visible="ModalEdit" @close="() => { ModalEdit = false }">
        <CModalHeader>
        <CModalTitle>Edit Wallet</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm class="row g-3">
            <CCol md="12">
            <CFormLabel for="inputEditDescription">Description</CFormLabel>
            <CFormInput
                id="inputEditDescription"
                :class="{ 'is-invalid': fieldErrors.editDescription }"
                />
                <div v-if="fieldErrors.editDescription" class="invalid-feedback">{{ errorMessages.description }}</div>
            </CCol>
            <CCol md="6">
              <CFormLabel for="inputEditMoney">Money</CFormLabel>
              <CFormInput
                id="inputEditMoney"
                :class="{ 'is-invalid': fieldErrors.money }"
                type="number"
                min=0
                />
                <div v-if="fieldErrors.money" class="invalid-feedback">{{ errorMessages.money }}</div>
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
            <CButton color="secondary" @click="() => { ModalEdit = false }">
                Close
            </CButton>
            <CButton color="primary" @click="updateWallet()">Update</CButton>
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
  import { cibAddthis, cilPen, cilTrash } from '@coreui/icons';
  
  export default {
  components: {
        VueGoodTable,
        CIcon,
    },
  setup() {
    return {
        cilTrash,
        cibAddthis,
        cilPen,
    }
  },
  data(){
    return {
        ModalAdd: false,
        ModalEdit: false,
        selectedDate: '',
        liveExampleVisible: false,
        alertText: "",
        EditID: null,
        selectedRows: [],
        rows: [],
        fieldErrors: {
            description: false,
            date: false,
            money: false,
        },
        errorMessages: {
            description: "Questo campo non può essere vuoto",
            date: "Questo campo non può essere vuoto",
            money: "Questo campo non può essere vuoto",
        },
        columns: [
            {
                label: 'Description',
                field: 'description',
            },
            {
                label: 'Money',
                field: 'money',
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
    async fetchWallet() { //Function to fetch the table
        try {
            const response = await axios.get('http://localhost:3000/api/wallets/');
            this.rows = response.data;
        } catch (error) {
            console.error('Error fetching wallets:', error);
        }
    },
    async addWallet() { //Add a row in the database of the server 
        const inputDescription = document.getElementById('inputDescription');
        const inputDate = document.getElementById('inputDate');
        const inputMoney = document.getElementById('inputMoney');

        const moneyValue = parseFloat(inputMoney.value);
        if (!isNaN(moneyValue)) { // Arrotonda il valore money a due decimali
            inputMoney.value = moneyValue.toFixed(2);
        }

        const newWalletData = {
            description: inputDescription.value,
            date: inputDate.value,
            money: parseFloat(inputMoney.value),
        };

        // Validate input fields
        if (!newWalletData.date || newWalletData.date === '') {
            this.fieldErrors.date = true; // Set date error state
            return;
        } else {
            this.fieldErrors.date = false; // Reset date error state on validation success
        }
  
        // Validate input fields
        if (!newWalletData.money || newWalletData.money < 0) {
            this.fieldErrors.money = true; // Set date error state
            return;
        } else {
            this.fieldErrors.money = false; // Reset date error state on validation success
        }

        if (!newWalletData.description || newWalletData.description.trim() === '') {
            this.fieldErrors.description = true; // Set description error state
            return;
        } else {
            this.fieldErrors.description = false; // Reset description error state on validation success
        }
  
        // Send request to create wallet
        try {
            await axios.post('http://localhost:3000/api/wallets/', newWalletData); // Replace with actual POST endpoint
            this.fetchWallet(); // Update the table
        } catch (error) {
            console.error('Error adding new wallet:', error);
            this.SendAlert(error);
        }
  
        this.ModalAdd = false; // Close the Add Category modal
    },
    async updateWallet(){ //Update a row in the database
        const inputEditDescription = document.getElementById('inputEditDescription');
        const inputEditDate = document.getElementById('inputEditDate');
        const inputEditMoney = document.getElementById('inputEditMoney');
            
        const moneyValue = parseFloat(inputEditMoney.value);
        if (!isNaN(moneyValue)) { // Round the money value to two decimal places
            inputEditMoney.value = moneyValue.toFixed(2);
        }

        const updateData = {
            description: inputEditDescription.value,
            date: inputEditDate.value,
            money: parseFloat(inputEditMoney.value),
        };
    
        if (!updateData.date || updateData.date === '') {
            this.fieldErrors.editDate = true; // Set error state for date input
            return;
        } else {
            this.fieldErrors.editDate = false; // Reset error state if validation passes
        }
    
        // Validate input fields
        if (!updateData.money || updateData.money < 0) {
            this.fieldErrors.editMoney = true; // Set date error state
            return;
        } else {
            this.fieldErrors.editMoney = false; // Reset date error state on validation success
        }

        if (!updateData.description || updateData.description.trim() === '') {
            this.fieldErrors.editDescription = true; // Set error state for description input
            return;
        } else {
            this.fieldErrors.editDescription = false; // Reset error state if validation passes
        }
    
        try {
            const response = await axios.post(`http://localhost:3000/api/wallets/${this.EditID}`,updateData);
    
            console.log('Update wallet:', response.data);
            // Update the table
            this.fetchWallet();
        } catch (error) {
            console.error('Error updating wallet:', error);
            this.SendAlert(error);
        }
    
        this.ModalEdit = false;
    },
    async deleteWallet(id) { //Delete row in the database
        try {
            await axios.delete(`http://localhost:3000/api/wallets/${id}`);
            this.fetchWallet();// Update the table
        } catch (error) {
            console.error('Error deleting wallet:', error);
        }
    },
    async deleteWalletRow() { //Delete all the row selected in the database
        try {
            const rows = this.selectedRows;
            for (const row of rows) {
                await this.deleteWallet(row.id);
            }
            
            // Update the table
            this.fetchWallet();
        } catch (error) {
            console.error('Error deleting wallet:', error);
        }
    },
    async SendAlert(error) { //Create an allert for the custom message
        this.alertText = error.response.data.message;
        this.liveExampleVisible = true;
  
        setTimeout(() => {
            this.liveExampleVisible = false;
        }, 5000); // 5000 milliseconds = 5 seconds
    },
    async OpenEditModal(row){ //Open and setting up the modal to edit value
        this.ModalEdit = true;
  
        this.$nextTick(() => {
            const inputEditDescription = document.getElementById('inputEditDescription');
            const inputEditDate = document.getElementById('inputEditDate');
            const inputEditMoney = document.getElementById('inputEditMoney');
  
            if (inputEditDescription && inputEditDate && inputEditMoney) {
                inputEditDescription.value = row.description;
                inputEditDate.value = row.date;
                inputEditMoney.value = row.money;
                this.EditID = row.id;
            }
        });
    },
  },
  };
  </script>  