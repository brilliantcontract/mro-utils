function AppViewModel() {
  this.rawText = ko.observable('');
  this.records = ko.observableArray([]);

  this.parse = () => {
    const arr = parseTabText(this.rawText());
    this.records(arr);
  };

  this.validate = () => {
    validateRecordsByCid(this.records());
    populateNewData(this.records());
    showNewDataColumn();
  };

  this.copyIsValid = () => {
    const text = collectIsValid(this.records());
    navigator.clipboard.writeText(text);
  };

  this.copyNewData = () => {
    const text = collectNewData(this.records());
    navigator.clipboard.writeText(text);
  };
}

ko.applyBindings(new AppViewModel());

function showNewDataColumn() {
  document.getElementById('new-data-th').classList.remove('d-none');
  document.querySelectorAll('.new-data-cell').forEach(td => td.classList.remove('d-none'));
}
