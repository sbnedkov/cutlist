var app = angular.module('cutlist', ['picardy.fontawesome', 'ui.bootstrap']);

app.controller('CutListCtrl', ['$scope', '$http', '$timeout', '$interpolate', '$sce', ($scope, $http, $timeout, $interpolate, $sce) => {
    // For new design, more work on that needed
    const VISUALIZATION_DIMENTION_FACTOR = 4;
    $scope.detailsOptions = [
        'Врата',
        'Страница',
        'Таван',
        'Дъно'
    ];
    $scope.toggleValues = [0, 1, 2];
    $scope.toggleValues2 = ['не', 'да'];

    $scope.testData = [{
        name: 'Врата',
        number: 2,
        width: 500,
        height: 900,
        edgefl: 2,
        edgefs: 0,
        edgesl: 1,
        edgess: 1,
        rotate: 'не'
    }, {
        name: 'Страница',
        number: 5,
        width: 500,
        height: 900,
        edgefl: 2,
        edgefs: 0,
        edgesl: 1,
        edgess: 1,
        rotate: 'не'
    }, {
        name: 'Дъно',
        number: 2,
        width: 500,
        height: 652,
        edgefl: 1,
        edgefs: 1,
        edgesl: 2,
        edgess: 2,
        rotate: 'не'
    }, {
        name: 'Таван',
        number: 1,
        width: 500,
        height: 652,
        edgefl: 1,
        edgefs: 1,
        edgesl: 2,
        edgess: 2,
        rotate: 'не'
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

    $scope.testStocks = [{
        width: 2800,
        height: 2070,
        number: 3
    }, {
        width: 2440,
        height: 1830,
        number: 2
    }];

    $scope.addRow = () => {
        $scope.testData.push({
            name: $scope.detailsOptions[0],
            number: 1,
            width: 0,
            height: 0,
            rotate: 0
        });
    };
    $scope.deleteRow = index => {
        $scope.testData.splice(index, 1);
        $scope.testData.forEach((ign, idx) => idx >= index && $scope.recompileTooltip(idx));
    };

    $scope.deactivateRow = index => {
        $scope.testData[index].disabled = !$scope.testData[index].disabled;
    };

    $scope.tooltipContents = [];

    $scope.recompileTooltip = idx => {
        var value = $scope.testData[idx];

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
                borderLeft: getBorder(value.edgess)
            }
        };
        $scope.tooltipContents[idx] = $sce.trustAsHtml($scope.tooltipTemplate(tooltip));
    };

    $http.get('/views/partials/visualization-tooltip.html')
        .success(tmpl => {
            $scope.tooltipTemplate = $interpolate(tmpl);
            $scope.testData.forEach((ign, idx) => $scope.recompileTooltip(idx));
        })
        .error(handleError);

    $scope.editableChanged = (idx) => {
        if ($scope.tooltipTemplate) {
            $timeout(() => {
                $scope.recompileTooltip(idx);
            });
        }
    };

    $scope.subtractStock = function (index) {
        if (!--$scope.testStocks[index].number) {
            $scope.testStocks.splice(index, 1);
        }
    };

    $scope.changeSelectedStock = function (stock) {
        $scope.selectedStock = stock;
    };

    $scope.addedStockNumber = 1;

    $scope.addSelectedStock = function () {
        var thisStock = $scope.testStocks.find(stock => {
            return stock.width === $scope.selectedStock.width && stock.height === $scope.selectedStock.height;
        });

        if (thisStock) {
            thisStock.number++;
        } else {
            $scope.testStocks.push({
                width: $scope.selectedStock.width,
                height: $scope.selectedStock.height,
                number: 1
            });
        }
    };

    function getBorder (val) {
        switch (val) {
            case 0:
                return 'none';
            case 1:
                return '1px solid #ebbe70';
            case 2:
                return '3px solid #9d4103';
            default:
                return 'none';
        }
    }
    // END new design

    $scope.changeLang = (lang) => {
        $http.post('/lang', {lang: lang}).success(() => {
            window.location.reload();
        }).error((err) => {
            alert(JSON.stringify(err));
        });
    };

    $scope.submit = () => {
        $http.post('/cutlist', {
            slates: $scope.slates,
            parts: $scope.parts,
            cutType: $scope.cutType
        }).success(key => {
            $scope.processing = true;

            checkFinished();

            function checkFinished () {
                $timeout(() => {
                    $http.post('/check-finished/' + key)
                        .success(res => {
                            if (res) {
                                $scope.cutlist = res;
                                $scope.processing = false;
                            } else {
                                checkFinished();
                            }
                        })
                        .error(err => {
                            alert(JSON.stringify(err));
                        });
                }, 1000);
            }
        }).error(err => {
            alert(JSON.stringify(err));
        });
    };

    $scope.addPart = () => {
        $scope.parts.push({});
    };

    $scope.addSlate = () => {
        $scope.slates.push({});
    };

    $scope.cutType = 'h';

    $http.get('/data/tests.json')
        .success(function (tests) {
            $scope.tests = tests;
            $scope.testsMap = {};
            tests.forEach(function (test) {
                $scope.testsMap[test.name] = test;
            });
            $scope.testsIdx = 'Test 1';
        })
        .error(function (err) {
            console.log(err);
            alert(JSON.stringify(err));
        });

    $scope.$watch('testsIdx', (idx) => {
        if (idx) {
            $scope.slates = $scope.testsMap[idx].slates;
            $scope.parts = $scope.testsMap[idx].parts;
        }
    });

    function handleError (err) {
        alert(JSON.stringify(err));
        console.log(err);
    }
}]).directive('cutlistCanvas', function () {
    return {
        restrict: 'E',
        replace: true,
        link: function ($scope, element, attributes) {
            $scope.idx = parseInt(attributes.idx);
            var canvas = element.find('canvas')[0];
            $scope.$watch('cutlist', function (cutlist) {
                var ctx = canvas.getContext('2d');

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

                ctx.strokeRect(0, 0, $scope.slateSolution.W, $scope.slateSolution.L);
                $scope.slateSolution.result.forEach(part => {
                    var w = part.item.w;
                    var h = part.item.h;
                    var x = part.x;
                    var y = part.y;

                    ctx.strokeRect(x, y, w, h);
                    ctx.fillText(part.ref, x + w / 2, y + h / 2);
                });
            });
        },
        templateUrl: '/views/partials/cutlist-canvas.html'
    };
}).directive('loadingOverlay', function () {
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
        template:
            '<div style="visibility: hidden;">' +
                '<div style="position: fixed; top: 0; bottom: 0; opacity: 0.25; background: black; width: 100%; z-index: 100;">' +
                '</div>' +
                '<div style="position: fixed; top: 0; width: 100%; height: 100%; z-index: 100;">' +
                    '<div style="top: 50%; height: 100%; width: 100%; text-align: center; position: absolute;">' +
                        '<i style="opacity: 1;" class="fa fa-cog fa-spin fa-3x" style="color: blue;"></i>' +
                    '</div>' +
                '</div>' +
            '</div>'
    };
});
