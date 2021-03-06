'use strict';
const CACHE_NAME = 'todoist-fridge';

// Files to cache, skeleton of the app
const urlsToCache = [
    './sw.js',
    './index.html',
    './manifest.json',
    './src/app.js',
    './src/list.js',
    './src/main.js',
    './src/settings.js',
    './vendor/vue-resource.min.js',
    './vendor/vue-router.min.js',
    './vendor/vue.min.js',
    './vendor/vuex.min.js',
    './vendor/media.js',
    './vendor/no-sleep.js',
    './vendor/lemon.min.css',
    './vendor/boxicons.min.css',
    './vendor/boxicons.eot',
    './vendor/boxicons.svg',
    './vendor/boxicons.ttf',
    './vendor/boxicons.woff',
    './assets/icons/favicon.ico',
    './assets/icons/icon-96.png',
    './assets/icons/icon-48.png',
    './assets/icons/icon-144.png',
    './assets/icons/icon-196.png',
    './assets/icons/icon-384.png',
    './assets/icons/android-chrome-192x192.png',
    './assets/icons/android-chrome-512x512.png',
    './assets/full.svg',
    './assets/list.svg',
    './assets/none.svg',
    './assets/settings.svg'
];

// Set the callback for the install step
self.oninstall = function(event) {
    console.log('[serviceWorker]: Installing...');
    // perform install steps
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                console.log('[serviceWorker]: Cache All');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log(
                    '[serviceWorker]: Intalled And Skip Waiting on Install'
                );
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.log(error);
            })
    );
};

// Set the callback for every fetch action
self.onfetch = function(event) {
    console.log('[serviceWorker]: Fetching ' + event.request.url);
    // One url we should ignore, for example data
    const raceUrl = 'API/';

    // Make and cache the request
    if (event.request.url.indexOf(raceUrl) > -1) {
        event.respondWith(
            caches.open(CACHE_NAME).then(function(cache) {
                return fetch(event.request)
                    .then(function(res) {
                        cache.put(event.request.url, res.clone());
                        return res;
                    })
                    .catch(err => {
                        console.log('[serviceWorker]: Fetch Error ' + err);
                    });
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(function(res) {
                return (
                    res ||
                    fetch(event.request)
                    .then(function(res) {
                        return res;
                    })
                    .catch(err => {
                        console.log('[serviceWorker]: Fetch Error ' + err);
                    })
                );
            })
        );
    }
};

self.onactivate = function(event) {
    console.log('[serviceWorker]: Actived');

    var whiteList = [CACHE_NAME];

    event.waitUntil(
        caches
            .keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (whiteList.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                console.log('[serviceWorker]: Clients Claims');
                return self.clients.claim();
            })
    );
};
