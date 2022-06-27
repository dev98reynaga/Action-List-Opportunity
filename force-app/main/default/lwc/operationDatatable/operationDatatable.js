import { LightningElement, track, wire } from 'lwc';
import getAllOpportunity from '@salesforce/apex/OpportunityController.getAllOpportunity';
import { refreshApex } from '@salesforce/apex';

const columns = [
   { label: 'Name', fieldName: 'Name' },
   { label: 'StageName', fieldName: 'StageName' },
   { label: 'CreatedDate', fieldName: 'CreatedDate', type: 'date' },
   { label: 'LeadSource', fieldName: 'LeadSource' },
];

export default class OperationDatatable extends LightningElement {

   data = [];
   tableData = [];
   renderConfig = {
      virtualize: 'vertical',
   };
   columns = columns;
   lengthTableData = 0;

   valueFilter = '';
   valueSearch = '';

   preSelectedRows = [];
   selectedRecords = [];
   hiddenCheckBox = false;
   showSpinner = true;
   isSelected = false;

   existingRecord = true;

   @wire(getAllOpportunity, { params: '', filterField: '' })
   getAllOpportunityWire({ data, error }) {
      if (data) {
         this.data = data;
         this.tableData = this.data;
         this.lengthTableData = this.tableData.length;
         this.showSpinner = false;
      } else if (error) {
         console.log(error);
      }
   }

   handleRowSelectionTable(e) {
      const selectedRows = JSON.parse(JSON.stringify(e.detail.selectedRows));
      if (!this.hiddenCheckBox) {
         this.selectedRecords = selectedRows;
      }

   }

   handleClickSelected() {
      if (this.selectedRecords.length === 0) {
         this.existingRecord = false;
      }
      this.isSelected = true;
      this.hiddenCheckBox = true;
      this.tableData = this.selectedRecords;
   }

   handleClickAllData() {
      this.existingRecord = true;
      this.isSelected = false;
      let preSelectedRowsId = [];
      //this.showSpinner = true;
      this.hiddenCheckBox = false;
      this.selectedRecords.forEach(items => {
         preSelectedRowsId.push(items.Id);
      });
      this.tableData = this.data;
      this.preSelectedRows = preSelectedRowsId;
      //this.showSpinner = false;
   }

   filterRecordsTable() {
      getAllOpportunity({ params: this.valueSearch, filterField: this.valueFilter })
         .then(result => {
            this.tableData = result;
            this.lengthTableData = this.tableData.length;
         }).catch(error => console.log(error))
   }

   handleChangeFilter(e) {
      const action = e.target.dataset.filter;
      if (action === "filter") {
         this.valueFilter = e.detail.value;
      }
      if (action === "search") {
         this.valueSearch = e.target.value.trim();
      }
      if (!this.isSelected) {
         if (this.valueFilter.trim() !== "" && this.valueSearch.trim() !== "") {
            this.filterRecordsTable();
         } else if (this.valueSearch.trim() === "") {
            this.tableData = this.data
         }
         this.lengthTableData = this.tableData.length;
      } else {
         this.filterTableDataSelected();
      }

   }

   filterTableDataSelected() {
      let filterSelectedRecords = [];
      let tempSelectedrecords = [...this.selectedRecords];
      if(this.valueSearch.length > 0 && this.valueFilter.length > 0){
         filterSelectedRecords = this.selectedRecords.filter(items => {
            if(!items?.[this.valueFilter].indexOf(this.valueSearch)){
               return items;
            }
         })

         tempSelectedrecords = filterSelectedRecords;
      }
      this.tableData = tempSelectedrecords;
   }

   get options() {
      return [
         { label: 'None', value: '' },
         { label: 'Name', value: 'Name' },
         { label: 'StageName', value: 'StageName' },
      ];
   }

   handleRefreshTable() {
      refreshApex(this.tableData);
   }

   get selectedFilterValue() {
      return this.valueFilter.trim() === "";
   }

   get getAllRecord() {
      return `Records (${this.lengthTableData})`;
   }
   get getSelectedRecords() {
      return `Selected (${this.selectedRecords.length})`;
   }

}