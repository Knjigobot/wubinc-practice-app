(function () {
    "use strict";

    angular.module('wubi.practiceView', ['ngRoute', 'DataServicesModule','practiceViewControllers', 'tutorDirectives'])

        .config(['$routeProvider', function ($routeProvider) {


            $routeProvider.when('/practice', {
                templateUrl: 'view1/practiceView.tpl.html',
                controller: 'PracticeViewController',
                resolve: {
                    keyCodes: function (dataService) {

                        return dataService.getKeyCodes();

                    },
                    queueInit: function (dataService, runner) {
                        if (!runner.learningQueue || runner.learningQueue.length === 0) {
                            return dataService.getHanzisByLength(4).then(function (fours) {
                                runner.initHanziQueue(fours, 4);
                                return fours;
                            });
                        }
                    }

                }
            });

        }]);


}());
