class StarsFilter {
  init(params) {
    this.eGui = document.createElement('div');
    // this.eGui.innerHTML = `<div style="display: inline-block;">
    //            <select id="numberOfStars" name="fruit">
    //              <option value ="0">Nothing</option>
    //              <option value ="5">★★★★★</option>
    //              <option value ="4">★★★★</option>
    //              <option value ="3">★★★</option>
    //              <option value ="2">★★</option>
    //              <option value ="1">★</option>
    //            </select>
    //        </div>`;

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

class KnownFilter {
  init(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = `<div style="display: inline-block;">
      <input class='knownRadio' type='radio' name='known' value='all' checked>
      <lable>show all</lable>
      <input class='knownRadio' type='radio' name='known' value='known'>
      <lable>show known</lable>
      <input class='knownRadio' type='radio' name='known' value='unknown'>
      <lable>show unknown</lable>
    </div>`;
    this.radios = this.eGui.querySelectorAll('[name=\'known\']');
    this.radios.forEach((radio) => {
      radio.addEventListener('change', (event) => {
        this.onChanged(radio);
      });
    });
    this.filterActive = false;
    this.value = 'all';
    this.filterChangedCallback = params.filterChangedCallback;
  }

  onChanged(radio) {
    this.value = radio.value;
    this.filterChangedCallback();
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

class WordFilter {
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
