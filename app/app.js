'use strict';

// Declare app level module which depends on views, and components
angular.module('wubi', [
    'ngRoute',
    'ngMaterial',
    'ngSanitize',
    'ui.bootstrap',

    'wubi.practiceView',
    'wubi.setupView',
    'wubi.charactersView',
    'wubi.lookupView',
    'wubi.infoView'

]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/practice'});
    }])
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('wubi06Trainer');
    })
    .run(function () {
        // Preload and pre-decode all keyboard layout diagram and key component images into memory
        var keys = 'abcdefghijklmnopqrstuvwxy'.split('');
        var imagesToPreload = [
            'img/wubi06_custom.png'
        ];
        for (var i = 0; i < keys.length; i++) {
            imagesToPreload.push('img/keys/key_' + keys[i] + '.png');
        }

        window._wubiImageCache = {};
        imagesToPreload.forEach(function (src) {
            var img = new Image();
            img.src = src;
            if (img.decode) {
                img.decode().catch(function () {});
            }
            window._wubiImageCache[src] = img;
        });
    });