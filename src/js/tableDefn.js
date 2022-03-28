function override(dictA, dictB) {
  return {
    ...dictA,
    ...dictB
  }
}

function starsColumn(other) {
  return override({
    headerName: 'Stars',
    field: 'stars',
    width: 200,
    cellRenderer: CenteredRenderer,
    filter: StarsFilter,
  }, other);
}

function markLearnedColumn(other) {
  return override({
      headerName: 'Mark',
      field: 'markButton',
      cellRenderer: MarkLearnedRenderer,
      resizable: false,
      width: 50,
    },
    other);
}

function wordColumn(other) {
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

function occuranceColumn(other) {
  return override({
    headerName: '#',
    field: 'occurances',
    sort: 'desc',
    sortIndex: 1,
    width: 100,
    cellRenderer: CenteredRenderer,
    filter: 'agNumberColumnFilter'
  }, other);
}

function isKnownColumn(other) {
  return override({
    headerName: 'isKnown',
    field: 'isKnown',
    resizable: false,
    filter: KnownFilter,
    cellRenderer: CenteredRenderer,
    width: 160
  }, other);
}

var sentenceCols = [
  markLearnedColumn({
    suppressSizeToFit: true
  }),
  wordColumn({
    suppressSizeToFit: true
  }),
  occuranceColumn({
    suppressSizeToFit: true
  }),
  starsColumn({
    width: 160,
    suppressSizeToFit: true
  }),
  {
    headerName: 'Pos',
    field: 'position',
    width: 100,
    filter: true,
    cellRenderer: CenteredRenderer,
    suppressSizeToFit: true
  },
  {
    headerName: 'Sentence',
    field: 'sentence',
    resizable: true,
    cellRenderer: CenteredRenderer,
    wrapText: true,
  },
]

wordsCols = [
  wordColumn(),
  starsColumn(),
  {
    headerName: 'Interval',
    field: 'interval',
    resizable: false,
    sortable: true,
    cellRenderer: CenteredRenderer,
    width: 160,
    suppressSizeToFit: true
  },

]

docWordsCols = [
  markLearnedColumn(),
  wordColumn(),
  starsColumn(),
  occuranceColumn({
    width: 80
  }),
  isKnownColumn()
]

charCols = [
  wordColumn(),
  isKnownColumn({
    headerName: 'Alone',
  }),
]

docCharCols = [
  wordColumn(),
  occuranceColumn({
    width: 80
  }),
  isKnownColumn()
]

var Tables = {
  sentences: {
    columnDefs: sentenceCols,
    rowData: [],
    // todo, predict height based on number of characters in sentence
    rowHeight: 30,
    getRowHeight: params => {
      var sentenceLength = params.data.sentence.length
      if (sentenceLength > 150) {
        return 250;
      } else if (sentenceLength > 100) {
        return 150;
      } else {
        return 100;
      }
    },
    rowBuffer: 100,
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
    // If these can be ratelimited then reenable
    // onBodyScrollEnd: (event) => migakuParse(),
    onSortChanged: (event) => migakuParse(),
    onFilterChanged: (event) => {
      reCalcSentenceStats();
      migakuParse();
    },
  },
  words: {
    columnDefs: wordsCols,
    rowData: [],
    rowHeight: 60,
    rowBuffer: 20,
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
  },
  docWords: {
    columnDefs: docWordsCols,
    rowData: [],
    rowHeight: 60,
    rowBuffer: 20,
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
  },
  chars: {
    columnDefs: charCols,
    rowData: [],
    rowHeight: 60,
    rowBuffer: 20,
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
  },
  docChars: {
    columnDefs: docCharCols,
    rowData: [],
    rowHeight: 60,
    rowBuffer: 20,
    enableCellTextSelection: true,
    suppressRowClickSelection: true,
  }
}
