(function () {
    "use strict";
    angular.module('tutorDirectives', ['services', 'wubiConstants', 'feedbackModule'])
        .directive('syncFocusWith', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
            return {
                restrict: 'A',
                scope: {
                    focusValue: "=syncFocusWith"
                },
                link: function ($scope, $element, attrs) {
                    $scope.$watch("focusValue", function (currentValue, previousValue) {
                        $timeout(function () {
                            if (currentValue === true) {


                                $element[0].focus();


                            } else if (currentValue === false) {


                                $element[0].blur();

                            }
                        }, 0);

                    });
                }
            };
        }])


        .directive('showAnswerViaChannel', ['feedbackChannel', function (feedbackChannel) {
            return {
                template: '<div ng-show="eventReceived"> wrong via channel</div>',
                link: function (scope) {

                    feedbackChannel.subscribe(scope, function () {
                        scope.eventReceived = true;
                    });

                }

            };

        }])
        .directive('showAnswer', ['feedbackService', function (feedbackService) {
            return {
                template: '<div ng-show="visible"> hallo</div>',
                link: function (scope, el, attrs) {

                    scope.$watch(scope.display.showAnswerByService, function (nv, ov) {
                    });
                }

            };
        }])

        .directive('ngEnter', ['keyEventHandler', 'KEYS', '$document', function (keyEventHandler, KEYS, $document) {
            return {
                link: function (scope, element, attrs) {
                    var safeApply = function (fn) {
                        var phase = scope.$root ? scope.$root.$$phase : null;
                        if (phase === '$apply' || phase === '$digest') {
                            fn();
                        } else {
                            scope.$apply(fn);
                        }
                    };

                    var onKeyDown = function (event) {
                        var target = event.target || event.srcElement;
                        var tag = target && target.tagName ? target.tagName.toLowerCase() : '';
                        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
                            return;
                        }

                        if (!scope.keyboard || scope.keyboard.isFocused === false) {
                            return;
                        }

                        var keyPressed = event.which || event.keyCode;
                        if (keyPressed === KEYS.ESC) {
                            safeApply(function () {
                                scope.stopFocusInput();
                            });
                        }
                        else {
                            if (keyPressed === KEYS.SPACE) {
                                if (scope.keyboard.isFocused) {
                                    scope.stopFocusInput();
                                }
                                else {
                                    scope.startFocusInput();
                                }
                            }
                            safeApply(function () {
                                keyEventHandler.handle(keyPressed);
                            });
                            event.preventDefault();
                        }
                    };

                    $document.on("keydown", onKeyDown);

                    scope.$on('$destroy', function () {
                        $document.off("keydown", onKeyDown);
                    });
                }
            };
        }]);
}());