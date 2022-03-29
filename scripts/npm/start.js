import concurrently from 'concurrently';

concurrently([
    { command: 'node scripts/npm/sb-watch.js', name: 'SB_WATCH', prefixColor: 'bgBlue.bold' },
    { command: 'nodemon src/app.js', name: 'RUN_NODE', prefixColor: 'bgBlue.bold' }
], {
    prefix: 'name',
    killOthers: ['failure', 'success'],
}).then(success, failure);

function success() {
    console.log('Success');    

}

function failure() {
    console.log('Failure');
}
