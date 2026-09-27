(function () {
    "use strict";
    angular.module('services', ['tutorServices', 'wubiConstants', 'feedbackModule', 'RunnerModule']).

        factory('keyEventHandler', ['tutor', 'KEYS', 'feedbackService', 'runner', '$mdSidenav', 'dataService', 'Hanzi', function (tutor, KEYS, feedbackService, runner, $mdSidenav, dataService, Hanzi) {
            return {
                handle: function (keyNumber) {

                    // Check for number keys 1-9 (top row: 49-57, numpad: 97-105)
                    var digit = null;
                    if (keyNumber >= 49 && keyNumber <= 57) {
                        digit = keyNumber - 48;
                    } else if (keyNumber >= 97 && keyNumber <= 105) {
                        digit = keyNumber - 96;
                    }

                    if (digit !== null && tutor.currentCharacter && (tutor.currentCharacter instanceof Hanzi)) {
                        var candidates = dataService.getCandidates(tutor.currentCharacter);
                        if (candidates && candidates.length > 1 && digit <= candidates.length) {
                            var selectedChar = candidates[digit - 1];
                            var newChar = new Hanzi({
                                character: selectedChar,
                                wubiCode: tutor.currentCharacter.wubiCode
                            });
                            tutor.set(newChar);
                            return;
                        }
                    }

                    var notCheckedKeys = [KEYS.ENTER, KEYS.ESCAPE, KEYS.SPACE];

                    if ((notCheckedKeys.indexOf(keyNumber) === -1)) {

                        tutor.check(keyNumber);
                        if (tutor.promptNext) {
                            // tutor could check answer was correct

                            runner.prompt();
                        }


                    }
                    if (keyNumber === KEYS.SPACE) {
                        $mdSidenav('right').toggle();
                        tutor.markWrong();
                    }
                    if (keyNumber === KEYS.ENTER) {
                        feedbackService.toggleKeyboardVisibilty();
                    }

                }
            };
        }

        ]);
}());