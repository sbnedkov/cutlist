var angular = require('angular');

var app = angular.module('cutlist', []);

app.controller('CutListCtrl', ['$scope', '$http', ($scope, $http) => {
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
        }).success((res) => {
            $scope.cutlist = res;
        }).error((err) => {
            alert(JSON.stringify(err));
        });
    };

    $scope.addPart = () => {
        $scope.parts.push({});
    };

    $scope.addSlate = () => {
        $scope.slates.push({});
    };

    $scope.cutType = 'v';

    $scope.tests = [{
            slates: [{
                w: 1000,
                h: 1000
            }],
            parts: [{
                ref: 'a',
                q: 1,
                w: 600,
                h: 200,
                canRotate: true
            }, {
                ref: 'b',
                q: 1,
                w: 300,
                h: 200,
                canRotate: true
            }, {
                ref: 'c',
                q: 1,
                w: 800,
                h: 200,
                canRotate: true
            }, {
                ref: 'd',
                q: 1,
                w: 400,
                h: 300,
                canRotate: true
            }, {
                ref: 'e',
                q: 1,
                w: 400,
                h: 500,
                canRotate: true
            }, {
                ref: 'f',
                q: 1,
                w: 400,
                h: 500,
                canRotate: true
            }]
        }, {
            slates: [{
                w: 1500,
                h: 1000
            }],
            parts: [{
                ref: 'a',
                q: 1,
                w: 300,
                h: 200,
                canRotate: true
            }, {
                ref: 'b',
                q: 1,
                w: 300,
                h: 200,
                canRotate: true
            }, {
                ref: 'c',
                q: 1,
                w: 100,
                h: 200,
                canRotate: true
            }, {
                ref: 'd',
                q: 1,
                w: 400,
                h: 220,
                canRotate: true
            }, {
                ref: 'e',
                q: 1,
                w: 200,
                h: 500,
                canRotate: true
            }, {
                ref: 'f',
                q: 1,
                w: 400,
                h: 250,
                canRotate: true
            }]
        }, {
            slates: [{
                w: 1500,
                h: 1000
            }],
            parts: [{
                ref: 'a',
                q: 1,
                w: 100,
                h: 325,
                canRotate: true
            }, {
                ref: 'b',
                q: 1,
                w: 320,
                h: 100,
                canRotate: true
            }, {
                ref: 'c',
                q: 1,
                w: 155,
                h: 280,
                canRotate: true
            }, {
                ref: 'd',
                q: 1,
                w: 120,
                h: 800,
                canRotate: true
            }, {
                ref: 'e',
                q: 1,
                w: 222,
                h: 325,
                canRotate: true
            }, {
                ref: 'f',
                q: 1,
                w: 128,
                h: 250,
                canRotate: true
            }]
        }, {
            slates: [{
                w: 2800,
                h: 2070
            }],
            parts: [{
                ref: 'Det. 1',
                q: 2,
                w: 562,
                h: 353,
                canRotate: true
            }, {
                ref: 'Det. 3',
                q: 5,
                w: 420,
                h: 232,
                canRotate: true
            }, {
                ref: 'Det. 2',
                q: 5,
                w: 500,
                h: 652,
                canRotate: true
            }, {
                ref: 'd',
                q: 0,
                w: 400,
                h: 220,
                canRotate: true
            }, {
                ref: 'e',
                q: 0,
                w: 200,
                h: 500,
                canRotate: true
            }, {
                ref: 'f',
                q: 0,
                w: 400,
                h: 250,
                canRotate: true
            }]
        }, {
            slates: [{
                w: 2800,
                h: 2070
            }],
            parts: [{
                ref: 'Det. 1',
                q: 10,
                w: 1562,
                h: 353,
                canRotate: true
            }, {
                ref: 'Det. 2',
                q: 12,
                w: 500,
                h: 652,
                canRotate: true
            }, {
                ref: 'Det. 3',
                q: 5,
                w: 420,
                h: 232,
                canRotate: true
            }, {
                ref: 'Det. 4',
                q: 5,
                w: 1800,
                h: 500,
                canRotate: true
            }, {
                ref: 'Det. 5',
                q: 3,
                w: 2000,
                h: 650,
                canRotate: true
            }, {
                ref: 'Det. 6',
                q: 15,
                w: 800,
                h: 900,
                canRotate: true
            }]
        }];

    $scope.testsIdx = '3';
    $scope.$watch('testsIdx', (idx) => {
        if (idx >= 0) {
            $scope.slates = $scope.tests[idx].slates;
            $scope.parts = $scope.tests[idx].parts;
        }
    });
}]).directive('cutlistCanvas', function () {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attributes) {
            scope.idx = parseInt(attributes.idx);
            var canvas = element.find('canvas')[0];
            scope.$watch('cutlist', function (cutlist) {
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

                var ratio = canvas.width / scope.slates[0].w; // TODO: more than a single slate
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

                ctx.strokeRect(0, 0, scope.slates[0].w, scope.slates[0].h); // TODO: more than a single slate
                scope.slateSolution.forEach(part => {
                    var w = part.rotated ? part.item.h : part.item.w;
                    var h = part.rotated ? part.item.w : part.item.h;
                    var x = part.x;
                    var y = part.y;

                    ctx.strokeRect(x, y, w, h);
                    ctx.fillText(part.ref, x + w / 2, y + h / 2);
                });
            });
        },
        templateUrl: '/views/partials/cutlist-canvas.html'
    };
});
