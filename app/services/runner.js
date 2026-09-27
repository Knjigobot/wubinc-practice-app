(function () {
    "use strict";
    angular.module('RunnerModule', ['DataServicesModule', 'ListMakerModule', 'HanziModule'])
        .factory('runner', ['dataService', 'listMaker', '$log', 'tutor', '$location', 'Hanzi', function (dataService, listMaker, $log, tutor, $location, Hanzi) {
            //var SETUP_VIEW_PATH = 'setup';

            var service = {
                learningQueue: [],
                nextQueueIndex: 0,
                currentIndex: 0,
                currentCharIndex: 0,
                percent: 0,
                initialQueueLength: 0,
                isHanziMode: false,
                selectedKeystroke: 4,
                fullHanziList: [],

                removeCurrent: function () {
                    this.learningQueue.splice(this.currentIndex, 1);
                },

                initHanziQueue: function (list, keystrokeNumber) {
                    this.isHanziMode = true;
                    this.selectedKeystroke = keystrokeNumber || 4;
                    this.fullHanziList = list.slice();
                    var savedIdx = dataService.loadCurrentCharIndex();
                    if (savedIdx >= 0 && savedIdx < this.fullHanziList.length) {
                        this.currentCharIndex = savedIdx;
                    } else {
                        this.currentCharIndex = 0;
                    }
                    this.currentIndex = this.currentCharIndex;
                    this.nextQueueIndex = (this.currentCharIndex + 1) % this.fullHanziList.length;
                    this.learningQueue = this.fullHanziList;
                    this.initialQueueLength = this.fullHanziList.length;
                    this.updatePercent();
                    tutor.set(this.fullHanziList[this.currentCharIndex]);
                },

                refillList: function () {
                    if (this.isHanziMode && this.fullHanziList && this.fullHanziList.length > 0) {
                        for (var j = 0; j < this.fullHanziList.length; j++) {
                            this.learningQueue.push(this.fullHanziList[j]);
                        }
                        this.updatePercent();
                        if (listMaker.selection && listMaker.selection.random) {
                            this.randomize();
                        }
                        return;
                    }

                    var list = listMaker.makeListFromSelectionObject();
                    if (list.length === 0) {
                        throw "RUNNER_HAS_EMPTY_REFILL_LIST";
                    }
                    for (var i = 0; i < list.length; i++) {
                        this.learningQueue.push(list[i]);
                    }
                    this.updatePercent();
                    if (listMaker.selection && listMaker.selection.random) {

                        this.randomize();
                    }

                },

                updatePercent: function () {
                    if (this.isHanziMode && this.fullHanziList && this.fullHanziList.length > 0) {
                        this.percent = ((this.currentCharIndex + 1) / this.fullHanziList.length) * 100;
                    } else if (this.initialQueueLength > 0) {
                        this.percent = (this.initialQueueLength - this.learningQueue.length) / this.initialQueueLength * 100;
                    } else {
                        this.percent = 0;
                    }
                },

                setLearningQueue: function (list) {
                    if (list && list.length > 0 && list[0] instanceof Hanzi) {
                        this.isHanziMode = true;
                        this.fullHanziList = list.slice();
                        var savedIdx = dataService.loadCurrentCharIndex();
                        if (savedIdx >= 0 && savedIdx < this.fullHanziList.length) {
                            this.currentCharIndex = savedIdx;
                        } else {
                            this.currentCharIndex = 0;
                        }
                        this.currentIndex = this.currentCharIndex;
                        this.nextQueueIndex = (this.currentCharIndex + 1) % this.fullHanziList.length;
                    } else if (list && list.length > 0 && !(list[0] instanceof Hanzi)) {
                        this.isHanziMode = false;
                        this.currentIndex = 0;
                        this.nextQueueIndex = 1;
                    }
                    this.learningQueue = list.slice();
                    this.initialQueueLength = list.length;
                    this.updatePercent();
                },

                getProgressPercent: function () {
                    this.updatePercent();
                    return this.percent;
                },

                getCurrent: function () {
                    if (this.isHanziMode && this.fullHanziList && this.fullHanziList.length > 0) {
                        return this.fullHanziList[this.currentCharIndex || 0];
                    }
                    return this.learningQueue[this.currentIndex];
                },

                setCharIndex: function (idx) {
                    if (!this.fullHanziList || this.fullHanziList.length === 0) return null;
                    if (idx < 0) idx = 0;
                    if (idx >= this.fullHanziList.length) idx = this.fullHanziList.length - 1;
                    this.currentCharIndex = idx;
                    this.currentIndex = idx;
                    this.nextQueueIndex = (idx + 1) % this.fullHanziList.length;
                    dataService.saveCurrentCharIndex(idx);
                    this.updatePercent();
                    var char = this.fullHanziList[idx];
                    tutor.set(char);
                    return char;
                },

                getCurrentIndex: function () {
                    return this.currentCharIndex || 0;
                },

                getTotalCount: function () {
                    return this.fullHanziList ? this.fullHanziList.length : 0;
                },

                getNext: function () {
                    //$log.log('runner next called');
                    if (this.isHanziMode && this.fullHanziList && this.fullHanziList.length > 0) {
                        this.currentCharIndex = (this.currentCharIndex + 1) % this.fullHanziList.length;
                        this.currentIndex = this.currentCharIndex;
                        this.nextQueueIndex = (this.currentCharIndex + 1) % this.fullHanziList.length;
                        dataService.saveCurrentCharIndex(this.currentCharIndex);
                        this.updatePercent();
                        var nextChar = this.fullHanziList[this.currentCharIndex];
                        return nextChar;
                    }

                    // loop through the learning queue
                    if (this.learningQueue.length === 0) {
                        try {
                            this.refillList();
                        }
                        catch (e) {
                            $location.path('setup');
                        }
                        this.nextQueueIndex = 0;
                        this.currentIndex = 0;
                    }
                    if (this.nextQueueIndex >= this.learningQueue.length) {
                        this.nextQueueIndex = 0;
                    }
                    var currentElement = this.learningQueue[this.nextQueueIndex];
                    this.currentIndex = this.nextQueueIndex;
                    this.nextQueueIndex += 1;

                    this.updatePercent();
                    return currentElement;
                },

                start: function () {
                    if (this.isHanziMode && this.fullHanziList && this.fullHanziList.length > 0) {
                        if (this.currentCharIndex === undefined || this.currentCharIndex === null) {
                            this.currentCharIndex = dataService.loadCurrentCharIndex() || 0;
                        }
                        this.currentIndex = this.currentCharIndex;
                        tutor.set(this.fullHanziList[this.currentCharIndex]);
                        return;
                    }
                    if (listMaker.selection && listMaker.selection.random) {
                        this.randomize();
                    }
                    tutor.set(this.getCurrent());
                },

                prompt: function () {
                    if (this.isHanziMode && this.fullHanziList && this.fullHanziList.length > 0) {
                        var next = this.getNext();
                        tutor.set(next);
                        return next;
                    }

                    // save before removing!
                    dataService.saveCharacterToCash(this.getCurrent());
                    dataService.saveCache();
                    if (!tutor.wrongAnswerGiven) {
                        if (this.getCurrent().readyToRemove === true) {
                            this.removeCurrent(); // answered correct this time remove it from queue
                        }
                    }
                    // in any case show next character in the queue

                    var next = this.getNext();       // next in the queue
                    tutor.set(next);
                    return next;
                },

                randomize: function () {
                    var array = this.learningQueue;
                    for (var i = array.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = array[i];
                        array[i] = array[j];
                        array[j] = temp;
                    }
                    return array;
                }
            };

            return service;

        }]);


}());