import {withLoader} from './spinner.js';
import {migakuParse} from './shared.js';

let isTopNavLoaded = false;

window.addEventListener('DOMContentLoaded', async (event) => {
  // Toggle the side navigation
  const sidebarToggle = document.body.querySelector('#sidebarToggle');
  // document.body.classList.toggle('sb-sidenav-toggled');
  if (sidebarToggle) {
    // Uncomment Below to persist sidebar toggle between refreshes
    // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
    //     document.body.classList.toggle('sb-sidenav-toggled');
    // }
    sidebarToggle.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.toggle('sb-sidenav-toggled');
      localStorage.setItem('sb|sidebar-toggle', document.body.classList
          .contains('sb-sidenav-toggled'));
    });
  }

  document.querySelector('#toggleButton').addEventListener('click',
      toggleMigakuContainer);
  document.querySelector('#parseButton').addEventListener('click',
      migakuParse);

  document.querySelector('#syncButton').addEventListener('click',
      ankiLoad);
  document.querySelector('#saveProgress').addEventListener('click',
      saveWordList);

  window.addEventListener('keydown', function(e) {
    if (e.key == 't') {
      migakuParse();
    }
  }, false);

  document.querySelector('#listSelect').addEventListener('change', () => {
    const selector = document.querySelector('#listSelect');
    const currentList = selector.value;
    localStorage.setItem('listSelect', currentList);
  });

  await loadLists();
  isTopNavLoaded = true;
});

async function loadLists() {
  const response = await fetch('/listlist');
  const data = await response.json();
  const selector = document.querySelector('#listSelect');
  const opt = document.createElement('option');
  opt.value = 'all';
  opt.innerHTML = 'all';
  selector.appendChild(opt);
  const selectedList = localStorage.getItem('listSelect');
  data.forEach((title) => {
    const opt = document.createElement('option');
    opt.value = title;
    opt.innerHTML = title;
    selector.appendChild(opt);
    if (title == selectedList) {
      selector.value = selectedList;
    }
  });
  return;
}

export function topNavLoaded() {
  const timeout = 10000; // 10s
  const start = Date.now();
  return new Promise(waitForLoad);

  // waitForLoad makes the decision whether the condition is met
  // or not met or the timeout has been exceeded which means
  // this promise will be rejected
  // @this foo ??? what is the right thing to do here
  function waitForLoad(resolve, reject) {
    if (isTopNavLoaded) {
      resolve(isTopNavLoaded);
    } else if (timeout && (Date.now() - start) >= timeout) {
      reject(new Error('timeout'));
    } else {
      setTimeout(waitForLoad.bind(this, resolve, reject), 30);
    }
  }
}

function toggleMigakuContainer() {
  const container = document.querySelector('#migaku-toolbar-container');
  const state = container.style.display;
  if (state != 'block') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}


async function saveWordList() {
  withLoader(async () => {
    const response = await fetch('/saveWordlist');
    const data = await response.json();
    console.log(data);
  });
}

async function ankiLoad() {
  withLoader(async () => {
    const response = await fetch('/loadAnki');
    const data = await response.json();
    console.log(data);
  });
}


// Prevent migaku empty spans from messing stuff up
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    mutation.addedNodes.forEach((addedNode) => {
      if (addedNode.innerText == '' && addedNode.nodeName ==
        'SPAN') {
        addedNode.remove();
      }
    });
  });
});
if (true) {
  observer.observe(document.querySelector('body'), {
    subtree: true,
    childList: true,
  });
}
