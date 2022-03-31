import {
  CenteredRenderer,
  MarkLearnedRenderer,
} from './agRenderers.js';
import {
  KnownFilter,
  StarsFilter,
  WordFilter,
} from './agFilters.js';

function override(dictA, dictB) {
  return {
    ...dictA,
    ...dictB,
  };
}

export function starsColumn(other) {
  return override({
    headerName: 'Stars',
    field: 'stars',
    width: 200,
    cellRenderer: CenteredRenderer,
    filter: StarsFilter,
  }, other);
}

export function markLearnedColumn(other) {
  return override({
    headerName: 'Mark',
    field: 'markButton',
    cellRenderer: MarkLearnedRenderer,
    resizable: false,
    width: 50,
  },
  other);
}

export function wordColumn(other) {
  return override({
    headerName: 'Word',
    field: 'word',
    resizable: true,
    sort: 'desc',
    sortIndex: 2,
    cellRenderer: CenteredRenderer,
    width: 130,
    filter: WordFilter,
  }, other);
}

export function occuranceColumn(other) {
  return override({
    headerName: '#',
    field: 'occurances',
    sort: 'desc',
    sortIndex: 1,
    width: 100,
    cellRenderer: CenteredRenderer,
    filter: 'agNumberColumnFilter',
  }, other);
}

export function isKnownColumn(other) {
  return override({
    headerName: 'isKnown',
    field: 'isKnown',
    resizable: false,
    filter: KnownFilter,
    cellRenderer: CenteredRenderer,
    width: 160,
  }, other);
}

