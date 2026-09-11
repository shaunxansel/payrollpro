const CACHE_NAME = "payrollpro-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./employees.html",
    "./add-employee.html",
    "./employee-details.html",
    "./payroll.html",
    "./reports.html",
    "./settings.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


// ======================================================
// INSTALL
// ======================================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))

    );

    self.skipWaiting();

});


// ======================================================
// ACTIVATE
// ======================================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            )

        )

    );

    self.clients.claim();

});


// ======================================================
// FETCH
// ======================================================

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)

            .then(response => {

                // Save the latest successful response
                const responseClone = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseClone);
                    });

                return response;

            })

            .catch(() => {

                // If network fails, use cached version
                return caches.match(event.request);

            })

    );

});