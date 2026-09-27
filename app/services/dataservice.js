/**
 * Created by thomas on 21.12.14.
 */

angular.module('DataServicesModule', ['LocalStorageModule', 'CharacterModule', 'HanziModule']).
    factory('dataService', ['localStorageService', '$q', '$http', 'Character', '$log', '$location', 'Hanzi', function (localStorageService, $q, $http, Character, $log, $location, Hanzi) {

        var CHARACTERS_KEY = 'characters';
        var CACHE = 'cache';
        var QUEUE_KEY = 'QUEUE';
        var CHAR_INDEX_KEY = 'currentCharIndex';
        var service = {
            localData: null,
            cache: null,

            resetData: function () {

                localStorageService.remove(CHARACTERS_KEY);
                localStorageService.remove(CACHE);
                localStorageService.remove(CHAR_INDEX_KEY);
                this.getRootCharacters();
            },
            saveCurrentCharIndex: function (idx) {
                localStorageService.set(CHAR_INDEX_KEY, idx);
            },
            loadCurrentCharIndex: function () {
                var val = localStorageService.get(CHAR_INDEX_KEY);
                if (val !== null && val !== undefined && !isNaN(val)) {
                    return parseInt(val, 10);
                }
                return 0;
            },
            saveQueue: function (list) {
                this.save(QUEUE_KEY, list);
            },

            saveCache: function () {
                this.save(CACHE, this.cache);
            },
            saveCharacterToCash: function (char) {
                for (var i = 0; i < this.cache.length; i++) {
                    if (char.character === this.cache[i].character) {
                        this.cache[i] = angular.copy(char); //
                    }
                }

            },
            createCache: function () {

                //this.cache = [];
                this.save(CACHE, this.cache)
            },

            loadCache: function () {


                var cacheData = localStorageService.get(CACHE);

                if (angular.isDefined(cacheData) && cacheData !== null) {
                    var characterArray = [];
                    var data = cacheData;

                    Object.keys(data).forEach(function (key) {

                        characterArray.push(new Character(data[key]));

                    });

                    this.cache = characterArray;
                }
                else {
                }


            },

            getKeyCodes: function () {
                var keyCodes = $q.defer();
                $http.get('view1/keycodes.json').then(angular.bind(this, function (response) {

                    this.keyCodes = response.data;
                    keyCodes.resolve(this.keyCodes);
                }));
                return keyCodes.promise;
            },

            save: function (key, characterArray) {
                localStorageService.set(key, characterArray);
            },

            getRootCharacters: function () {
                var deferred = $q.defer();
                this.localData = localStorageService.get(CHARACTERS_KEY);
                if (this.localData !== null) {
                    var characterArray = [];
                    var data = this.localData;

                    Object.keys(data).forEach(function (key) {

                        characterArray.push(new Character(data[key]));

                    });


                    this.cache = characterArray;

                    deferred.resolve(this.cache);
                }
                else {
                    $http.get('view1/data.json').then(angular.bind(this, function (response) {

                        var characterArray = [];
                        var data = response.data;

                        Object.keys(data).forEach(function (key) {

                            for (var i = 0; i < data[key].files.length; i++) {

                                var info = {
                                    key: key,
                                    character: data[key].files[i],
                                    status: 'unseen',
                                    group: data[key]['group']
                                };
                                characterArray.push(new Character(info));
                            }
                        });
                        //$scope.data.characters = $scope.data.characters.splice(1,25);
                        localStorageService.set(CHARACTERS_KEY, characterArray);

                        this.localData = characterArray;       // used for resetting data

                        this.cache = characterArray;

                        deferred.resolve(this.localData);
                    }));
                }
                return deferred.promise;
            },
            candidatesByCode: {},
            dictByChar: {},

            getCandidates: function (charOrCode) {
                if (!charOrCode) return [];
                var code = '';
                if (typeof charOrCode === 'string') {
                    var s = charOrCode.toLowerCase().trim();
                    if (this.candidatesByCode[s]) {
                        return this.candidatesByCode[s];
                    }
                    if (this.dictByChar[charOrCode] && this.dictByChar[charOrCode].wubiCode && this.dictByChar[charOrCode].wubiCode[0]) {
                        code = this.dictByChar[charOrCode].wubiCode[0].toLowerCase().trim();
                    } else {
                        code = s;
                    }
                } else if (charOrCode.wubiCode && charOrCode.wubiCode[0]) {
                    code = charOrCode.wubiCode[0].toLowerCase().trim();
                }
                return (code && this.candidatesByCode[code]) ? this.candidatesByCode[code] : [];
            },

            findHanziIndex: function (query) {
                if (!query || !this.parsedHanzis) return -1;
                var q = query.trim().toLowerCase();
                for (var i = 0; i < this.parsedHanzis.length; i++) {
                    var h = this.parsedHanzis[i];
                    if (h.character === query.trim()) {
                        return i;
                    }
                    if (h.wubiCode && h.wubiCode[0] && h.wubiCode[0].toLowerCase().trim() === q) {
                        return i;
                    }
                }
                return -1;
            },

            getHanzis: function () {
                var deferred = $q.defer();
                if (this.parsedHanzis && this.parsedHanzis.length > 0) {
                    deferred.resolve(this.parsedHanzis);
                    return deferred.promise;
                }

                var self = this;
                var hanzis = [];
                var candMap = {};
                var dictMap = {};

                $http.get('view1/hanzis.json').then(function (response) {
                    var hanziList = response.data;
                    var len = hanziList.length;
                    for (var i = 0; i < len; i++) {
                        var item = hanziList[i];
                        var h = new Hanzi(item);
                        hanzis.push(h);

                        var code = (item.wubiCode && item.wubiCode[0]) ? item.wubiCode[0].toLowerCase().trim() : '';
                        if (code) {
                            if (!candMap[code]) {
                                candMap[code] = [];
                            }
                            candMap[code].push(item.character);
                        }
                        dictMap[item.character] = h;
                    }

                    self.candidatesByCode = candMap;
                    self.dictByChar = dictMap;
                    self.parsedHanzis = hanzis;
                    deferred.resolve(hanzis);
                });
                return deferred.promise;
            },
            getHanzisByLength: function (keystrokeNumber) {
                return this.getHanzis().then(function (hanzis) {
                    var filtered = [];
                    for (var i = 0; i < hanzis.length; i++) {
                        if (hanzis[i].wubiCode && hanzis[i].wubiCode[0] && hanzis[i].wubiCode[0].length === keystrokeNumber) {
                            filtered.push(hanzis[i]);
                        }
                    }
                    return filtered;
                });
            },

            getDict: function () {
                var deferred = $q.defer();
                var self = this;
                if (this.dictByChar && Object.keys(this.dictByChar).length > 0) {
                    deferred.resolve(this.dictByChar);
                    return deferred.promise;
                }
                this.getHanzis().then(function () {
                    deferred.resolve(self.dictByChar);
                });
                return deferred.promise;
            }
        };


        service.getRootCharacters().then(function () {

            service.loadCache();
            service.getKeyCodes();
        });
        return service;

    }])
    .filter('wubiLength', [function () {
        return function (input, keystrokeNumber) {
            if (!input || !angular.isArray(input)) return [];
            var copy = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].wubiCode && input[i].wubiCode[0] && input[i].wubiCode[0].length === keystrokeNumber) {
                    copy.push(input[i]);
                }
            }
            return copy;
        };
    }]);