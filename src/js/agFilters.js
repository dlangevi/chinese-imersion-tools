export class StarsFilter {
  init(params) {
    this.eGui = document.createElement('div');
    this.options = [
      '★★★★★',
      '★★★★',
      '★★★',
      '★★',
      '★',
      'none',
    ];
    const optionsHtml = this.options.map((elem) => {
      return `<div>
          <label for="${elem}">
            <input type="checkbox" id="${elem}" 
                   value="${elem}" checked> ${elem}  
          </label>
          </div>`;
    }).join('');

    this.eGui.innerHTML = `<div style="display: inline-block;">
              ${optionsHtml}
            </div>`;
    this.starsCheckboxes = this.eGui.querySelectorAll('input[type=checkbox]');
    this.starsCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        this.onChanged();
      });
    });
    this.filterActive = false;
    this.stars = 0;
    this.filterChangedCallback = params.filterChangedCallback;
  }

  onChanged() {
    const checkBoxes = [...this.starsCheckboxes.values()];
    const checked = checkBoxes.filter((checkbox) => checkbox.checked).map(
        (checkbox) => checkbox.value);
    this.options = checked;
    this.filterChangedCallback();
  }

  getGui() {
    return this.eGui;
  }

  doesFilterPass(params) {
    return this.options.includes(params.data.stars);
  }

  isFilterActive() {
    return this.options.length != 6;
  }
}

export class KnownFilter {
  init(params) {
    // Todo figure out how to start active, since this doesn't seem to actually
    // do it for some reason
    this.eGui = document.createElement('div');
    this.filterActive = true;
    this.value = 'unknown';
    this.filterChangedCallback = params.filterChangedCallback;
  }

  getGui() {
    return this.eGui;
  }

  doesFilterPass(params) {
    if (this.value == 'known') {
      return params.data.isKnown;
    } else {
      return !params.data.isKnown;
    }
  }

  isFilterActive() {
    return true;
    return this.value != 'all';
  }

  getModel() {
    return {
      state: this.value,
    };
  }

  setModel(newModel) {
    this.value = newModel.state;
    this.filterChangedCallback();
  }
}

export class WordFilter {
  init(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = `<div style="display: inline-block;">
        <span class=words></span>
      </div>`;
    this.wordsSpan = this.eGui.querySelector('.words');
    this.filterActive = false;
    this.filterChangedCallback = params.filterChangedCallback;
    this.addedWords = new Set();
  }

  addWord(word) {
    this.addedWords.add(word);
    this.filterChangedCallback();
  }

  getGui() {
    this.wordsSpan = [...this.addedWords.values()].join(',');
    return this.eGui;
  }

  doesFilterPass(params) {
    return !this.addedWords.has(params.data.word);
  }

  isFilterActive() {
    return this.addedWords.size != 0;
  }
}
