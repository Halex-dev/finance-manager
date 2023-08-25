<template>
    <CRow>
        <CAlert id="MyAlert" color="danger" :visible="liveExampleVisible" dismissible @close="() => { liveExampleVisible = false }">{{ alertText }}</CAlert>
        <CCol :md="12">
            <CCard class="mb-4">
                <CCardBody>
                    <CCardTitle>Category</CCardTitle>
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
                            <span @click="deleteCategory(props.row.id)">
                                <CIcon :icon="cilTrash" size="xl"/>
                            </span>
                        </span>
                        <span v-else-if="props.column.field == 'type'">
                            {{ getTypeLabel(props.formattedRow[props.column.field]) }}
                        </span>
                        <span v-else>
                            {{props.formattedRow[props.column.field]}}
                        </span>
                    </template>
                    <template #selected-row-actions>
                        <span @click="deleteCategoryRow();">
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
        <CModalTitle>Add category</CModalTitle>
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
                <CFormLabel for="inputType">Select type of category</CFormLabel>
                <CFormSelect
                    id="inputType"
                    aria-label="Select a type of category"
                    :options="typeRows"
                    v-model="selectedLevel"
                    :class="{ 'is-invalid': fieldErrors.type }"
                >
                </CFormSelect>
                <div v-if="fieldErrors.type" class="invalid-feedback">{{ errorMessages.type }}</div>
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
            <CButton color="primary" @click="addCategory()">Add</CButton>
            </CModalFooter>
        </CForm>
        </CModalBody>
    </CModal>
    <CModal size="lg" alignment="center" backdrop="static" :visible="ModalEdit" @close="() => { ModalEdit = false }">
        <CModalHeader>
        <CModalTitle>Edit Category</CModalTitle>
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
                <CFormLabel for="selectedEditType">Select type of category</CFormLabel>
                <CFormSelect
                    id="selectedEditType"
                    aria-label="Select a type of category"
                    :options="typeRows"
                    v-model="selectedEditType"
                    :class="{ 'is-invalid': fieldErrors.editType }"
                >
                </CFormSelect>
                <div v-if="fieldErrors.editType" class="invalid-feedback">{{ errorMessages.type }}</div>
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
            <CButton color="primary" @click="UpdateCategory()">Update</CButton>
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
        selectedLevel: null,
        selectedEditType: null,
        selectedRows: [],
        rows: [],
        typeRows:[
            'Open this select menu',
            { label: 'Necessarie', value: 1 },
            { label: 'Discrezionali', value: 2 },
            { label: 'Risparmio/Investimenti', value: 3}
        ],
        fieldErrors: {
            description: false,
            date: false,
            type: false,
            editDescription: false,
            editDate: false,
            editType: false,
        },
        errorMessages: {
            description: "Questo campo non può essere vuoto",
            date: "Questo campo non può essere vuoto",
            type: "Questo campo non può essere vuoto",
        },
        columns: [
            {
                label: 'ID',
                field: 'id',
                type: 'number',
            },
            {
                label: 'Description',
                field: 'description',
            },
            {
                label: 'Type',
                field: 'type',
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
        this.fetchCategory();
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Add +1 cause months start from 0
        const day = String(today.getDate()).padStart(2, '0');

        this.selectedDate = `${year}-${month}-${day}`;
  },
  methods: {
    getTypeLabel(typeValue) {
        console.log('typeValue:', typeValue);
        const foundType = this.typeRows.find(type => type.value === typeValue);
        return foundType ? foundType.label : typeValue;
    },
    async selectionChanged(params) {
        this.selectedRows = params.selectedRows;
    },
    async fetchCategory() { //Function to fetch the table
        try {
            const response = await axios.get('http://localhost:3000/api/categories/');
            this.rows = response.data;
        } catch (error) {
            console.error('Error fetching categorys:', error);
        }
    },
    async addCategory() { //Add a row in the database of the server 
        const inputDescription = document.getElementById('inputDescription');
        const inputDate = document.getElementById('inputDate');
 
        const newCategoryData = {
            description: inputDescription.value,
            type: parseFloat(this.selectedLevel),
            date: inputDate.value,
        };

        // Validate input fields
        if (!newCategoryData.date || newCategoryData.date === '') {
            this.fieldErrors.date = true; // Set date error state
            return;
        } else {
            this.fieldErrors.date = false; // Reset date error state on validation success
        }

        if (!newCategoryData.description || newCategoryData.description.trim() === '') {
            this.fieldErrors.description = true; // Set description error state
            return;
        } else {
            this.fieldErrors.description = false; // Reset description error state on validation success
        }

        if (!newCategoryData.type || newCategoryData.type < 0) {
            this.fieldErrors.type = true; // Set description error state
            return;
        } else {
            this.fieldErrors.type = false; // Reset description error state on validation success
        }

        // Send request to create category
        try {
            await axios.post('http://localhost:3000/api/categories/', newCategoryData); // Replace with actual POST endpoint
            this.fetchCategory(); // Update the table
        } catch (error) {
            console.error('Error adding new category:', error);
            this.SendAlert(error);
        }

        this.ModalAdd = false; // Close the Add Category modal
    },
    async deleteCategory(id) { //Delete row in the database
        try {
            await axios.delete(`http://localhost:3000/api/categories/${id}`);
            this.fetchCategory();// Update the table
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    },
    async deleteCategoryRow() { //Delete all the row selected in the database
        try {
            const rows = this.selectedRows;
            for (const row of rows) {
                await this.deleteCategory(row.id);
            }
            
            // Update the table
            this.fetchCategory();
        } catch (error) {
            console.error('Error deleting category:', error);
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

            if (inputEditDescription && inputEditDate) {
                inputEditDescription.value = row.description;
                inputEditDate.value = row.date;
                this.selectedEditType = row.type;
                this.EditID = row.id;
            }
        });
    },
    async UpdateCategory(){ //Update a row in the database
      const inputEditDescription = document.getElementById('inputEditDescription');
      const inputEditDate = document.getElementById('inputEditDate');

      const updateData = {
        description: inputEditDescription.value,
        type: parseFloat(this.selectedEditType),
        date: inputEditDate.value,
      };

      if (!updateData.date || updateData.date === '') {
        this.fieldErrors.editDate = true; // Set error state for date input
        return;
      } else {
        this.fieldErrors.editDate = false; // Reset error state if validation passes
      }

      if (!updateData.description || updateData.description.trim() === '') {
        this.fieldErrors.editDescription = true; // Set error state for description input
        return;
      } else {
        this.fieldErrors.editDescription = false; // Reset error state if validation passes
      }

      if (!updateData.type || updateData.type < 0) {
            this.fieldErrors.editType = true; // Set description error state
            return;
        } else {
            this.fieldErrors.editType = false; // Reset description error state on validation success
        }

      try {
        const response = await axios.post(`http://localhost:3000/api/categories/${this.EditID}`,updateData);

        console.log('Update category:', response.data);
        // Update the table
        this.fetchCategory();
      } catch (error) {
        console.error('Error updating category:', error);
        this.SendAlert(error);
      }

      this.ModalEdit = false;
    }
  },
};
</script>