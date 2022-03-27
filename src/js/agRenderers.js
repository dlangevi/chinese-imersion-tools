class MarkLearnedRenderer {
  // init method gets the details of the cell to be renderer
  init(params) {
    this.eGui = document.createElement('button');
    this.eGui.innerHTML = '+';
    this.eGui.classList.add('markLearned');
    this.eventListener = () => {
      var row = params.node
      var rowData = params.node.data
      exportWords([rowData])
      if (rowData.isKnown == false) {
        row.setDataValue('isKnown', true)
      }
      const filterInstance = Tables.sentences.api.getFilterInstance(
        'word');
      filterInstance.addWord(rowData.word);
      reCalcWordStats();
    }
    this.eGui.addEventListener('click', this.eventListener);
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}

class RemoveBookRenderer {
  // init method gets the details of the cell to be renderer
  init(params) {
    this.eGui = document.createElement('button');
    this.eGui.innerHTML = 'x';
    this.eGui.classList.add('markLearned');
    this.eventListener = () => {
      Tables.myBookList.api.applyTransaction({
        remove:[{'title': params.node.id}]
      });
    }
    this.eGui.addEventListener('click', this.eventListener);
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}

class CenteredRenderer {
  init(params) {
    this.eGui = document.createElement('span')
    this.eGui.innerHTML = params.value
    this.eGui.classList.add('centered')
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }

}
