import {withLoader} from './spinner.js';
import {migakuParse} from './shared.js';

window.addEventListener('DOMContentLoaded', (event) => {
  // Toggle the side navigation
  const sidebarToggle = document.body.querySelector('#sidebarToggle');
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
});

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
observer.observe(document.querySelector('body'), {
  subtree: true,
  childList: true,
});

