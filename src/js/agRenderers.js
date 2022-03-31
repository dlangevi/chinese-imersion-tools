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
    //
    this.eventListener = () => {
      const row = params.node;
      const rowData = params.node.data;
      exportWords([rowData]);
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

async function exportWords(rows) {
  withLoader(async () => {
    const words = [...new Set(rows.map((row) => row.word))];
    const contents = await post('/addWords', {
      words: words,
    });
    const obj = await contents.json();
    console.log(
        `Exported words ${words.join(',')} now ` +
      `know ${obj.totalWords} total words`,
    );
  });
}
