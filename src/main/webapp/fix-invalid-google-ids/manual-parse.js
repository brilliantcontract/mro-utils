function AppViewModel() {
  this.rawText = ko.observable('');
  this.records = ko.observableArray([]);

  this.parse = () => {
    const arr = parseTabText(this.rawText());
    this.records(arr);
  };

  this.validate = () => {
    // no validation logic required
  };

  this.copyIsValid = () => {
    const text = collectIsValid(this.records());
    navigator.clipboard.writeText(text);
  };
}

ko.applyBindings(new AppViewModel());
