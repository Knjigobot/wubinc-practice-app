(function () {
    "use strict";

    angular.module('wubi.charactersView', ['ngRoute', 'DataServicesModule', 'RunnerModule', 'HanziModule'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/characters', {
                templateUrl: 'characters-view/characters-view.tpl.html',
                controller: 'CharactersViewController',
                resolve: {
                    hanzis: function (dataService, runner) {
                        return dataService.getHanzis().then(function (allHanzis) {
                            if (!runner.fullHanziList || runner.fullHanziList.length === 0) {
                                runner.initHanziQueue(allHanzis, 4);
                            }
                            return allHanzis;
                        });
                    }
                }
            });
        }])

        .controller('CharactersViewController', ['$scope', 'runner', 'dataService', '$location', function ($scope, runner, dataService, $location) {
            $scope.totalCount = runner.getTotalCount() || (runner.fullHanziList ? runner.fullHanziList.length : 102999);

            // 1-based display number reflecting current runner / localStorage position
            var current0Based = runner.getCurrentIndex();
            $scope.displayNumber = current0Based + 1;
            $scope.sliderValue = current0Based + 1;

            $scope.currentCharacter = null;
            $scope.variants = [];
            $scope.wubiCode = '';
            $scope.wubiKeys = [];
            $scope.searchQuery = '';
            $scope.searchMessage = '';

            function updateDisplay() {
                var idx = $scope.displayNumber - 1;
                if (!runner.fullHanziList || runner.fullHanziList.length === 0) return;

                if (idx < 0) idx = 0;
                if (idx >= runner.fullHanziList.length) idx = runner.fullHanziList.length - 1;

                $scope.displayNumber = idx + 1;
                $scope.sliderValue = idx + 1;

                var charObj = runner.setCharIndex(idx);
                $scope.currentCharacter = charObj;

                if (charObj) {
                    $scope.variants = dataService.getCandidates(charObj);
                    if (!$scope.variants || $scope.variants.length === 0) {
                        $scope.variants = [charObj.character];
                    }
                    if (charObj.wubiCode && charObj.wubiCode[0]) {
                        $scope.wubiCode = charObj.wubiCode[0].toUpperCase();
                        $scope.wubiKeys = charObj.wubiCode[0].trim().toLowerCase().split('');
                    } else {
                        $scope.wubiCode = '';
                        $scope.wubiKeys = [];
                    }
                }
            }

            $scope.onNumberChange = function () {
                var num = parseInt($scope.displayNumber, 10);
                if (isNaN(num)) return;
                if (num < 1) num = 1;
                if (num > $scope.totalCount) num = $scope.totalCount;
                $scope.displayNumber = num;
                updateDisplay();
            };

            $scope.onSliderChange = function () {
                $scope.displayNumber = parseInt($scope.sliderValue, 10);
                updateDisplay();
            };

            $scope.jumpTo = function (num) {
                if (num < 1) num = 1;
                if (num > $scope.totalCount) num = $scope.totalCount;
                $scope.displayNumber = num;
                updateDisplay();
            };

            $scope.step = function (delta) {
                var num = (parseInt($scope.displayNumber, 10) || 1) + delta;
                $scope.jumpTo(num);
            };

            $scope.searchChar = function () {
                if (!$scope.searchQuery) return;
                var idx = dataService.findHanziIndex($scope.searchQuery);
                if (idx >= 0) {
                    $scope.searchMessage = 'Found "' + $scope.searchQuery + '" at #' + (idx + 1);
                    $scope.jumpTo(idx + 1);
                } else {
                    $scope.searchMessage = 'Not found for "' + $scope.searchQuery + '"';
                }
            };

            $scope.goToPractice = function () {
                $location.path('/practice');
            };

            // Initialize display
            updateDisplay();
        }]);
}());
