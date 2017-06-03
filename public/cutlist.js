var app = angular.module('cutlist', ['picardy.fontawesome', 'ui.bootstrap']);

app.controller('CutListCtrl', ['$scope', '$http', '$timeout', '$interpolate', '$sce','$uibModal', ($scope, $http, $timeout, $interpolate, $sce, $uibModal) => {
    // For new design, more work on that needed
    const VISUALIZATION_DIMENTION_FACTOR = 3;
    $scope.detailsOptions = [
        'Врата',
        'Страница',
        'Таван',
        'Дъно',
        'Рафт'
    ];
    $scope.toggleValues = [0, 1, 2];
    $scope.toggleValues2 = [false, true];
    $scope.toggleVisualValues2 = ['не', 'да'];

    $scope.details = [{
        name: 'Врата',
        number: 2,
        width: 500,
        height: 900,
        edgefl: 2,
        edgefs: 0,
        edgesl: 1,
        edgess: 1,
        rotate: false
    }, {
        name: 'Страница',
        number: 5,
        width: 500,
        height: 900,
        edgefl: 2,
        edgefs: 0,
        edgesl: 1,
        edgess: 1,
        rotate: false
    }, {
        name: 'Дъно',
        number: 2,
        width: 500,
        height: 652,
        edgefl: 1,
        edgefs: 1,
        edgesl: 2,
        edgess: 2,
        rotate: false
    }, {
        name: 'Таван',
        number: 1,
        width: 500,
        height: 652,
        edgefl: 1,
        edgefs: 1,
        edgesl: 2,
        edgess: 2,
        rotate: false
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }, {
        name: 'Врата'
    }];

    $scope.stocks = [{
        width: 2800,
        height: 2070,
        number: 3
    }, {
        width: 2440,
        height: 1830,
        number: 2
    }];

    $scope.addRow = () => {
        $scope.details.push({
            name: $scope.detailsOptions[0],
            number: 1,
            width: 0,
            height: 0,
            rotate: false
        });
    };
    $scope.deleteRow = index => {
        $scope.details.splice(index, 1);
        $scope.details.forEach((ign, idx) => idx >= index && $scope.recompileTooltip(idx));
    };

    $scope.deactivateRow = index => {
        $scope.details[index].disabled = !$scope.details[index].disabled;
    };

    $scope.tooltipContents = [];

    $scope.recompileTooltip = idx => {
        var value = $scope.details[idx];

        var pixelWidth = Math.round(value.width / VISUALIZATION_DIMENTION_FACTOR);
        var pixelHeight = Math.round(value.height / VISUALIZATION_DIMENTION_FACTOR);
        var tooltip = {
            tooltip: {
                width: value.width,
                height: value.height,
                label: value.name.toLowerCase().substring(0, 3) + '.',
                pxWidth: pixelWidth + 'px',
                pxHeight: pixelHeight + 'px',
                innerPxWidth: pixelWidth - 9 + 'px',
                innerPxHeight: pixelHeight - 9 + 'px',
                borderTop: getBorder(value.edgefl),
                borderRight: getBorder(value.edgefs),
                borderBottom: getBorder(value.edgesl),
                borderLeft: getBorder(value.edgess),
                halfWidth: pixelWidth / 2 - 9 + 'px'
            }
        };
        $scope.tooltipContents[idx] = $sce.trustAsHtml($scope.tooltipTemplate(tooltip));
    };

    $http.get('/views/partials/visualization-tooltip.html')
        .then(({data}) => {
            $scope.tooltipTemplate = $interpolate(data);
            $scope.details.forEach((ign, idx) => $scope.recompileTooltip(idx));
        }, handleError);

    $scope.editableChanged = (idx) => {
        if ($scope.tooltipTemplate) {
            $timeout(() => {
                $scope.recompileTooltip(idx);
            });
        }

        $scope.cutlist = null;
    };

    $scope.subtractStock = function (index) {
        if (!--$scope.stocks[index].number) {
            $scope.stocks.splice(index, 1);
        }
    };

    $scope.changeSelectedStock = function (stock) {
        $scope.selectedStock = stock;
        $scope.selectedStockToAdd = {
            width: stock.width,
            height: stock.height
        };
    };

    $scope.changeSelectedStock($scope.stocks[0]);

    $scope.addedStockNumber = 1;

    $scope.addSelectedStock = function () {
        var thisStock = $scope.stocks.find(stock => {
            return stock.width === $scope.selectedStockToAdd.width && stock.height === $scope.selectedStockToAdd.height;
        });

        if (thisStock) {
            thisStock.number += $scope.addedStockNumber;
        } else {
            $scope.stocks.push({
                width: $scope.selectedStockToAdd.width,
                height: $scope.selectedStockToAdd.height,
                number: $scope.addedStockNumber
            });
        }
    };

    function getBorder (val) {
        switch (val) {
            case 0:
                return 'none';
            case 1:
                return '2px solid #9d4103';
            case 2:
                return '4px solid #9d4103';
            default:
                return 'none';
        }
    }
    // END new design

    $scope.submit = () => {
        $scope.processing = true;

        $http.post('/cutlist', {
            stocks: $scope.stocks,
            parts: $scope.details.filter(i => !i.disabled).map(item => {
                return {
                    w: item.width,
                    h: item.height,
                    q: item.number,
                    ref: item.name,
                    canRotate: item.rotate
                };
            }),
            cutType: $scope.cutType
        }).then(({data: key}) => {

            checkFinished();

            function checkFinished () {
                $timeout(() => {
                    $http.post('/check-finished/' + key)
                        .then(({data: res}) => {
                            if (res) {
                                $scope.processing = false;
                                if (res.err) {
                                    return alert(JSON.stringify(res.err));
                                }

                                $scope.cutlist = res;
                            } else {
                                checkFinished();
                            }
                        }, handleError);
                }, 1000);
            }
        }, handleError);
    };

    var pdfListener;
    $scope.registerPdfListener = function (listener) {
        pdfListener = listener;
    };

    $scope.createPdf = function () {
        pdfListener();
    };

    $scope.login = function (username, password) {
        $http.post('/login', {
            username,
            password
        }).then(function () {
            logInAndLoadProjects();
        }, handleError);
    };

    function logInAndLoadProjects () {
        $scope.loggedIn = true;
        $http.get('/projects')
            .then(function ({data: projects}) {
                $scope.projects = projects;
            }, handleError);
    }

    $scope.newProject = function () {
        $scope.processing = true;

        var modalInstance = $uibModal.open({
            templateUrl: '/views/dialogs/create-project.html',
            controller: 'CreateProjectCtrl'
        });

        modalInstance.result.then(function (name) {
            var planId;
            window.async.waterfall([
                (cb) => {
                    $http.post('/plans', {
                        stocks: $scope.stocks,
                        details: $scope.details
                    }).then(({data: plan}) => {
                        $scope.plan = plan;
                        $scope.details = plan.details;
                        $scope.stocks = plan.stocks;
                        $scope.savedPlan = cloneDeep(plan);
                        cb(null, plan);
                    }, cb);
                },
                ({_id}, cb) => {
                    planId = _id;
                    if ($scope.cutlist) {
                        $http.post('/results', $scope.cutlist)
                            .then(({data: result}) => {
                                $scope.result = result;
                                $scope.savedResult = cloneDeep(result);
                                cb(null, result);
                            }, cb);
                    } else {
                        cb(null, {_id: void 0});
                    }
                },
                ({_id}, cb) => {
                    $http.post('/projects', {
                        name: name,
                        planId: planId,
                        resultId: _id
                    }).then(({data: project}) => cb(null, project), cb);
                }
            ], (err, project) => {
                $scope.processing = false;
                if (err) {
                    return handleError(err);
                }

                $scope.projects.push(project);
                $scope.project = project;
                $scope.savedProject = cloneDeep(project);
            });
        });
    };

    $scope.loadProject = function (project) {
        if (hasChanges()) {
            if (askToContinue()) {
                cont();
            }
        } else {
            cont();
        }

        function cont () {
            $scope.processing = true;

            window.async.waterfall([
                cb => {
                    $http.get('/plans/' + project.planId)
                        .then(({data: plan}) => {
                            $scope.plan = plan;
                            $scope.savedPlan = cloneDeep(plan);
                            $scope.details = plan.details;
                            $scope.stocks = plan.stocks;
                            cb();
                        }, cb);
                },
                cb => {
                    if (project.resultId) {
                        $http.get('/results/' + project.resultId)
                            .then(({data: result}) => {
                                $scope.cutlist = result;
                                $scope.savedResult = cloneDeep(result);
                                cb();
                            }, cb);
                    } else {
                        cb();
                    }
                }
            ], err => {
                $scope.processing = false;

                if (err) {
                    return handleError(err);
                }

                $scope.project = project;
                $scope.savedProject = cloneDeep(project);
                $scope.detailsOptions = $scope.plan.details.map(detail => detail.name);

            });
        }
    };

    $scope.saveProject = function () {
        if (!$scope.project) {
            return alert('Първо създайте или заредете проект');
        }

        $scope.processing = true;
        window.async.waterfall([
            cb => {
                var patch = createPatch($scope.savedPlan, $scope.plan);
                $http.patch('/plans/' + $scope.project.planId, patch)
                    .then(({data: plan}) => {
                        $scope.savedPlan = cloneDeep(plan);
                        cb();
                    }, cb);
            },
            cb => {
                if ($scope.project.resultId) {
                    var patch = createPatch($scope.savedResult, $scope.cutlist);
                    $http.patch('/results/' + $scope.project.resultId, patch)
                        .then(({data: result}) => {
                            $scope.savedResult = cloneDeep(result);
                            cb();
                        }, cb);
                } else {
                    if ($scope.cutlist) {
                        $http.post('/results', $scope.cutlist)
                            .then(({data: result}) => {
                                $scope.result = result;
                                $scope.savedResult = cloneDeep(result);

                                $scope.project.resultId = result._id;
                                var patch = createPatch($scope.savedProject, $scope.project);
                                $http.patch('/projects/' + $scope.project._id, patch)
                                    .then(({data: project}) => {
                                        $scope.savedProject = cloneDeep(project);
                                        cb();
                                    }, cb);
                            }, cb);
                    } else {
                        cb();
                    }
                }
            }
        ], err => {
            $scope.processing = false;

            if (err) {
                return handleError(err);
            }
        });
    };

    $scope.deleteProject = function () {
        if (confirm('Моля потвърдете')) {
            $scope.processing = true;
            window.async.waterfall([
                cb => {
                    $http.delete('/plans/' + $scope.project.planId)
                        .then(() => cb(), cb);
                },
                cb => {
                    if ($scope.project.resultId) {
                        $http.delete('/results/' + $scope.project.resultId)
                            .then(() => cb(), cb);
                    } else {
                        cb();
                    }
                },
                cb => {
                    $http.delete('/projects/' + $scope.project._id)
                        .then(() => cb(), cb);
                }
            ], err => {
                $scope.processing = false;

                if (err) {
                    return handleError(err);
                }

                $scope.projects.splice($scope.projects.find(p => p === $scope.project), 1);

                delete $scope.project;
                delete $scope.plan;
                delete $scope.savedPlan;
                $scope.details.splice(0, $scope.details.length);
                $scope.stocks.splice(0, $scope.stocks.length);
                delete $scope.cutlist;
                delete $scope.savedResult;

                logInAndLoadProjects();
            });
        }
    };

    $scope.maybeLogin = function (ev, username, password) {
        if (ev.originalEvent.keyCode === 13) {
            $scope.login(username, password);
        }
    };

    $scope.openCuttingPlanDialog = function () {
        var modalInstance = $uibModal.open({
            templateUrl: '/views/dialogs/cutting-plan-config.html',
            controller: 'CuttingPlanConfigCtrl',
            resolve: {
                cutType: function () {
                    return $scope.cutType;
                }
            }
        });

        modalInstance.result.then(function (config) {
            $scope.cutType = config.cutType;
        });
    };

    function cloneDeep (obj) {
        return window._.cloneDeep(obj);
    }

    function createPatch (savedObj, obj) {
        obj._id = savedObj._id;
        obj.creation_date = savedObj.creation_date;
        return window.JSON8Patch.diff(savedObj, obj);
    }

    function handleError (err) {
        $scope.processing = false;
        alert(JSON.stringify(err));
        console.log(err);
    }

    $scope.cutType = 'h';

    if (window.USER_ID) {
        logInAndLoadProjects();
    }

    window.document.body.style.visibility = 'visible';

    window.addEventListener('beforeunload', function (event) {
        if (hasChanges() && askToContinue()) {
            event.preventDefault();
        }
    });

    function hasChanged (savedObj, obj) {
//        console.log(window.JSON8Patch.diff(savedObj, obj), window.JSON8Patch.diff(savedObj, obj).length);
        var diff = savedObj && window.JSON8Patch.diff(savedObj, obj);
        if (!diff || !diff.length) {
            return false;
        }

        return diff.length !== 1 || diff[0].path === ''; // XXX: investigate why this patches appear: op:"add", path:"", value:null
    }

    function hasChanges () {
        var planChanged = hasChanged($scope.savedPlan, $scope.plan);
        var resultChanged = hasChanged($scope.savedResult, $scope.cutlist);
//        console.log('Plan changed: ', planChanged, 'result changed: ', resultChanged);

        return planChanged || resultChanged;
    }

    function askToContinue() {
        return confirm('Имате направени промени, наистина ли искате да продължите без да запазите проекта?');
    }
}]).directive('rzResultContainer', [function () {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        link: function ($scope) {
            var canvasListeners = [];
            $scope.registerPdfListener(() => {
                var doc = new window.jsPDF();
                canvasListeners.forEach((listener, idx) => {
                    var image = listener();
                    doc.addImage(image, 'png', 0, 20, 192, 0);
                    if (idx < canvasListeners.length - 1) {
                        doc.addPage();
                    }
                });
                doc.save('Разкрой-' + new Date().toDateString() + '.pdf');
            });

            $scope.registerCanvasListener = (listener) => {
                canvasListeners.push(listener);
            };
        },
        templateUrl: '/views/partials/result-container.html'
    };
}]).directive('rzResultStocks', [function () {
    const MAX_WIDTH = 120;

    return {
        restrict: 'E',
        replace: true,
        scope: {
            cutlist: '='
        },
        link: function ($scope) {
            $scope.$watch('cutlist', function (cutlist) {
                if (!cutlist) {
                    return;
                }

                var maxWidth = cutlist.arr.reduce((acc, stock) => {
                    return Math.max(acc, stock.W);
                }, 0);

                var factor = maxWidth / MAX_WIDTH;
                $scope.stockSizes = cutlist.arr.map(stock => {
                    return {
                        W: stock.W,
                        L: stock.L,
                        displayW: Math.floor(stock.W / factor) + 'px',
                        displayL: Math.floor(stock.L / factor) + 'px'
                    };
                });

            });
        },
        templateUrl: '/views/partials/result-stocks.html'
    };
}]).directive('rzResult', [function () {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        link: function ($scope, element, attributes) {
            $scope.idx = parseInt(attributes.idx);
            $scope.waste = JSON.parse(attributes.waste);

            var canvas = element.find('canvas')[0];
            $scope.$watch('cutlist', function (cutlist) {
                var ctx = canvas.getContext('2d');

                var slateW = $scope.slateSolution.W;
                var slateL =  $scope.slateSolution.L;

                var textWidth = 500;
                var textHeight = 50;
                var textYOffset = textHeight + 30;

                canvas.width = window.innerWidth * 0.66666667;
                canvas.height = (canvas.width / slateW) * (slateL + textYOffset) + 1;

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.textAlign = 'center';
                ctx.font = '45px Verdana';

                if (!cutlist) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    return;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = 'black';

                var ratio = canvas.width / Math.max(...$scope.cutlist.arr.map(slate => slate.W));
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

                ctx.fillText(`повърхност: ${$scope.waste.area}, употреба: ${$scope.waste.usage}`, textWidth, textHeight);

                var imageObj = new Image();
                imageObj.onload = function() {
                    var imageScaledHeight = imageObj.height / ratio;
                    var imageScaledWidth = imageObj.width / ratio;
                    for (var i = 0; i < $scope.slateSolution.L / imageScaledHeight; i++) {
                        for (var j = 0; j < $scope.slateSolution.W / imageScaledWidth; j++) {
                            ctx.drawImage(imageObj, j * imageScaledWidth, textYOffset + i * imageScaledHeight, imageScaledWidth, imageScaledHeight);
                        }
                    }

                    // Cover the possible overflow with white
                    ctx.fillStyle = 'white';
                    ctx.fillRect($scope.slateSolution.W, textYOffset, canvas.width / ratio - $scope.slateSolution.W, canvas.height / ratio);
                    ctx.fillRect(0, textYOffset + $scope.slateSolution.L, canvas.width / ratio, canvas.height / ratio - $scope.slateSolution.L);
                    ctx.fillStyle = 'black';

                    ctx.strokeRect(0, textYOffset, $scope.slateSolution.W, $scope.slateSolution.L);

                    $scope.slateSolution.result.forEach(part => {
                        var w = part.item.w;
                        var h = part.item.h;
                        var x = part.x;
                        var y = part.y + textYOffset;

                        ctx.strokeRect(x, y, w, h);
                        ctx.fillText(part.ref, x + w / 2, y + h / 2);
                    });

                    $scope.registerCanvasListener(() => {
                        var image = new Image();
                        image.src = canvas.toDataURL('image/png');
                        return image;
                    });
                };
                imageObj.src = '/img/fladder-small.png';
            });
        },
        templateUrl: '/views/partials/cutlist-canvas.html'
    };
}]).directive('loadingOverlay', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            processing: '='
        },
        link: function ($scope, el) {
            $scope.$watch('processing', processing => {
                if (processing === false) {
                    el.css('visibility', 'hidden');
                }

                if (processing === true) {
                    el.css('visibility', 'visible');
                }
            });
        },
        templateUrl: '/views/partials/loading-overlay.html'
    };
}).controller('CreateProjectCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
    $scope.submit = function (ev) {
        ev.preventDefault();

        $uibModalInstance.close($scope.name);
    };
}]).controller('CuttingPlanConfigCtrl', ['$scope', '$uibModalInstance', 'cutType', function ($scope, $uibModalInstance, cutType) {
    $scope.config = {
        cutType: cutType
    };

    $scope.submit = function (ev) {
        ev.preventDefault();

        $uibModalInstance.close($scope.config);
    };
}]);
