import {createCard} from './ankiInterface.js';
import {topNavLoaded} from './topnav.js';
import {
  post,
} from './shared.js';

async function main() {
  await topNavLoaded();
  const customList = localStorage.getItem('listSelect');
  if (customList) {
    await loadFileList(customList);
  } else {
    await loadFileList('all');
  }

  document.querySelector('#process').addEventListener('click', () => {
    loadBook();
  });

  document.querySelector('#createCard').addEventListener('click',
      () => createCard());

  document.querySelectorAll('.next-step')
      .forEach((input) => {
        input.addEventListener('click', (evt) => {
          const currentDiv = evt.target;
          const currentStep = currentDiv.parentNode;
          const nextStep = currentDiv.parentNode.nextSibling;

          nextStep.style.display = 'block';
          currentStep.style.display = 'none';
        });
      });

  document.querySelectorAll('.previous-step')
      .forEach((input) => {
        input.addEventListener('click', (evt) => {
          const currentDiv = evt.target;
          const currentStep = currentDiv.parentNode;
          const previousStep = currentDiv.parentNode.previousSibling;

          previousStep.style.display = 'block';
          currentStep.style.display = 'none';
        });
      });
}

async function loadBook() {
  const fileSelector = document.querySelector('#jsonFiles');
  localStorage.setItem('ch|loadFile', fileSelector.value);
  const response = await post('/loadfileWords', {
    name: fileSelector.value,
  });
  const data = await response.json();
  console.log(data);
  const targets = data.words.filter((row) => row.isKnown == false);
  targets.sort((rowA, rowB) => {
    if (rowA.occurances < rowB.occurances) {
      return 1;
    } else if (rowA.occurances > rowB.occurances) {
      return -1;
    } else {
      if (rowA.word < rowB.word) {
        return 1;
      } else {
        return -1;
      }
    }
  });
  console.log(targets);
}

async function loadFileList(list) {
  const response = await post('/filelist', {
    list: list,
  });
  const data = await response.json();
  const fileSelector = document.querySelector('#jsonFiles');
  fileSelector.innerHTML = '';

  const savedFile = localStorage.getItem('ch|loadFile');

  data.forEach((title) => {
    const opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    fileSelector.appendChild(opt);
    if (title == savedFile) {
      fileSelector.value = savedFile;
    }
  });

  return;
}

main();
