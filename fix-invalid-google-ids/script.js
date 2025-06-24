function AppViewModel() {
  this.rawText = ko.observable('');
  this.records = ko.observableArray([]);

  fetch('data.txt').then(r => r.text()).then(t => this.rawText(t));

  this.parse = () => {
    const arr = parseTabText(this.rawText());
    this.records(arr);
  };

  this.validate = () => {
    validateRecords(this.records());
    this.records.valueHasMutated();
  };
}

ko.applyBindings(new AppViewModel());
