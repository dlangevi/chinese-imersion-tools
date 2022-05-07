import {
  withLoader,
} from './spinner.js';
import {
  post,
} from './shared.js';

export class MarkLearnedRenderer {
  // init method gets the details of the cell to be renderer
  init(params) {
    this.eGui = document.createElement('img');
    this.eGui.setAttribute('src', 'assets/img/circle-check.svg');
    this.eGui.classList.add('markLearned');
    // Turns out those svgs really slow down the site
    // this.eGui.classList.add('far');
    // this.eGui.classList.add('fa-check-circle');
    this.eventListener = () => {
      const row = params.node;
      const rowData = params.node.data;
      exportWord(rowData);
      if (rowData.isKnown == false) {
        row.setDataValue('isKnown', true);
      }
      const filterInstance = params.api.getFilterInstance(
          'word');
      filterInstance.addWord(rowData.word);
    };
    this.eGui.addEventListener('click', this.eventListener);
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}

export class RemoveBookRenderer {
  // init method gets the details of the cell to be renderer
  init(params) {
    this.eGui = document.createElement('img');
    this.eGui.setAttribute('src', 'assets/img/circle-check.svg');
    this.eGui.classList.add('markLearned');
    this.eventListener = () => {
      params.api.applyTransaction({
        remove: [{
          'title': params.node.id,
        }],
      });
    };
    this.eGui.addEventListener('click', this.eventListener);
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}

export class CenteredRenderer {
  init(params) {
    this.eGui = document.createElement('span');
    this.eGui.innerHTML = params.value;
    this.eGui.classList.add('centered');
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}

async function exportWord(rowData) {
  withLoader(async () => {
    // We are manually marking a word as learned, so set a large interval
    const words = {[rowData.word]: 10000};
    const contents = await post('/addWords', {
      words: words,
    });
    const obj = await contents.json();
    console.log(
        `Exported words ${Object.keys(words).join(',')} now ` +
      `know ${obj.totalWords} total words`,
    );
  });
}
