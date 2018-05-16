import app from './app.js';

// import monsterCardStat from './monster-card-stat.js';
// Vue.component('monsterShortStat', monsterShortStat);
Vue.use(VueResource);
new Vue(app);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../sw.js')
        .then(function(registration) {
            // Registration Success
            console.log(
                '[serviceWorker]: registration successful with scope: ',
                registration.scope
            );
        })
        .catch(function(err) {
            // Registration failed :(
            console.log('[serviceWorker] registration failed', err);
        });
}
