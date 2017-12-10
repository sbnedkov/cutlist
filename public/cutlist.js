var app = angular.module('cutlist', ['picardy.fontawesome', 'ui.bootstrap']);

app.config(['$uibTooltipProvider', function ($uibTooltipProvider) {
    $uibTooltipProvider.options({
        appendToBody: false
    });
}]);

app.controller('CutListCtrl', [
    '$scope',
    '$http',
    '$timeout',
    '$interpolate',
    '$sce',
    '$uibModal',
    'Projects',
        (
            $scope,
            $http,
            $timeout,
            $interpolate,
            $sce,
            $uibModal,
            Projects
        ) => {
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

    $scope.labelTo = function (label) {
        $scope.leftColLabel = label;
    };

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

    $scope.recompileAllTooltips = () => {
        ($scope.details || []).forEach((ign, idx) => $scope.recompileTooltip(idx));
    };

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
                halfWidth: pixelWidth / 2 - 9 + 'px',
                halfHeight: pixelHeight / 2 - 9 + 'px'
            }
        };
        $scope.tooltipContents[idx] = $sce.trustAsHtml($scope.tooltipTemplate(tooltip));
    };

    $http.get('/views/partials/visualization-tooltip.html')
        .then(({data}) => {
            $scope.tooltipTemplate = $interpolate(data);
            $scope.details.forEach((ign, idx) => $scope.recompileTooltip(idx));
        }, handleError);

    $scope.emptyResult = function () {
        return {
            arr: [],
            waste: []
        };
    };

    $scope.editableChanged = function (idx) {
        if ($scope.tooltipTemplate) {
            $timeout(() => {
                $scope.recompileTooltip(idx);
            });
        }
    };

    $scope.askPreventEdit = function () {
        if (hasResult()) {
            if (askToResetCuttingPlan()) {
                delete $scope.project.result;
                $scope.result = $scope.emptyResult();

                return false;
            } else {
                return true;
            }
        }

        return false;
    };

    function hasResult () {
        return $scope.result && !!$scope.result.arr.length;
    }

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

                                $scope.result = res;
                                if ($scope.project) {
                                    $scope.project.setResult(res);
                                }
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
            logInAndLoadProjects(username);
        }, handleError);
    };

    function logInAndLoadProjects (username) {
        $scope.loggedIn = true;
        $scope.processing = true;
        $scope.username = username;
        Projects.loadAll((err, projects) => {
            $scope.processing = false;
            if (err) {
                return handleError(err);
            }

            $scope.projects = projects;
        });
    }

    $scope.logout = function () {
        $http.post('/logout').then(function () {
            logoutUserAndResetProjects();
        }, handleError);
    };

    function logoutUserAndResetProjects () {
        $scope.loggedIn = false;
        delete $scope.username;
        delete $scope.password;
        $scope.projects = [];
    }

    $scope.newProject = function () {
        var modalInstance = $uibModal.open({
            templateUrl: '/views/dialogs/create-project.html',
            controller: 'CreateProjectCtrl'
        });

        modalInstance.result.then(function (name) {
            $scope.processing = true;

            var obj = {name};

            Projects.createNew(obj, $scope.stocks, $scope.details, $scope.result, (err, project) => {
                $scope.processing = false;

                if (err) {
                    return handleError(err);
                }

                $scope.project = project;
                $scope.stocks = project.plan.stocks;
                $scope.details = project.plan.details;
                $scope.result = project.result || $scope.emptyResult();

                $scope.projects.push(project);
            });
        });
    };

    $scope.loadProject = function (project) {
        if ($scope.project && $scope.project.hasChanged()) {
            if (askToContinue()) {
                $scope.project.resetChanges();
                cont();
            }
        } else {
            cont();
        }

        function cont () {
            $scope.project = project;
            $scope.detailsOptions = project.plan.details.map(detail => detail.name);
            $scope.stocks = project.plan.stocks;
            $scope.details = project.plan.details;
            $scope.result = project.plan.result || $scope.emptyResult();
            $scope.recompileAllTooltips();
        }
    };

    $scope.saveProject = function () {
        if (!$scope.project) {
            return alert('Първо създайте или заредете проект');
        }

        $scope.processing = true;
        $scope.project.save(err => {
            $scope.processing = false;
            if (err) {
                return handleError(err);
            }
        });
    };

    $scope.deleteProject = function () {
        if (confirm('Моля потвърдете')) {
            $scope.processing = true;

            $scope.project.delete(err => {
                $scope.processing = false;

                if (err) {
                    return handleError(err);
                }

                $scope.projects.splice($scope.projects.find(p => p === $scope.project), 1);

                delete $scope.stocks;
                delete $scope.details;
                delete $scope.result;

                logInAndLoadProjects(window.USERNAME);
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

    function handleError (err) {
        $scope.processing = false;
        alert(JSON.stringify(err));
        console.log(err);
    }

    $scope.cutType = 'h';

    if (window.USER_ID) {
        logInAndLoadProjects(window.USERNAME);
    }

    window.document.body.style.visibility = 'visible';

    window.addEventListener('beforeunload', function (event) {
        if (hasChanges() && askToContinue()) {
            event.preventDefault();
        }
    });

    function hasChanges () {
        return $scope.project && $scope.project.hasChanged();
    }

    function askToContinue () {
        return confirm('Имате направени промени, наистина ли искате да продължите без да запазите проекта?');
    }

    function askToResetCuttingPlan () {
        return confirm('Това действие ще изтрие съществуващия разкрой, да се продължи?');
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

            $scope.resetCanvasListeners = () => {
                canvasListeners = [];
            };

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
            $scope.$watch('result', function (cutlist) {
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

                var ratio = canvas.width / Math.max(...cutlist.arr.map(slate => slate.W));
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

                ctx.fillText(`повърхност: ${$scope.waste.area}, употреба: ${$scope.waste.usage}`, textWidth, textHeight);

                $scope.resetCanvasListeners();

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
