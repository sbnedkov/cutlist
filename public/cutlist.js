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

    $scope.testsIdx = 1;
    $scope.tests = [{
            slates: [{
                w: 1000,
                h: 1000
            }],
            parts: [{
                name: 'a',
                count: 1,
                w: 600,
                h: 200,
                canRotate: true
            }, {
                name: 'b',
                count: 1,
                w: 300,
                h: 200,
                canRotate: true
            }, {
                name: 'c',
                count: 1,
                w: 800,
                h: 200,
                canRotate: true
            }, {
                name: 'd',
                count: 1,
                w: 400,
                h: 300,
                canRotate: true
            }, {
                name: 'e',
                count: 1,
                w: 400,
                h: 500,
                canRotate: true
            }, {
                name: 'f',
                count: 1,
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
                name: 'a',
                count: 1,
                w: 300,
                h: 200,
                canRotate: true
            }, {
                name: 'b',
                count: 1,
                w: 300,
                h: 200,
                canRotate: true
            }, {
                name: 'c',
                count: 1,
                w: 100,
                h: 200,
                canRotate: true
            }, {
                name: 'd',
                count: 1,
                w: 400,
                h: 220,
                canRotate: true
            }, {
                name: 'e',
                count: 1,
                w: 200,
                h: 500,
                canRotate: true
            }, {
                name: 'f',
                count: 1,
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
                name: 'a',
                count: 1,
                w: 100,
                h: 325,
                canRotate: true
            }, {
                name: 'b',
                count: 1,
                w: 320,
                h: 100,
                canRotate: true
            }, {
                name: 'c',
                count: 1,
                w: 155,
                h: 280,
                canRotate: true
            }, {
                name: 'd',
                count: 1,
                w: 120,
                h: 800,
                canRotate: true
            }, {
                name: 'e',
                count: 1,
                w: 222,
                h: 325,
                canRotate: true
            }, {
                name: 'f',
                count: 1,
                w: 128,
                h: 250,
                canRotate: true
            }]
        }];

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
            var idx = parseInt(attributes.idx);
            var canvas = element.find('canvas')[0];
            scope.$watch('cutlist', function (cutlist) {
                var ctx = canvas.getContext('2d');

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.font = '25px Verdana';

                if (!cutlist) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    return;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = 'black';

                var ratio = canvas.width / scope.slates[idx].w;
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

                ctx.strokeRect(0, 0, scope.slates[idx].w, scope.slates[idx].h);
                cutlist.result.forEach(function (part) {
                    if (part.slateIdx === idx) {
                        ctx.strokeRect(part.x, part.y, part.w, part.h);
                        ctx.fillText(part.name, part.x + part.w / 2, part.y + part.h / 2);
                    }
                });
                cutlist.cuts.forEach(function (cut) {
                    if (cut.slateIdx === idx) {
                        ctx.beginPath();
                        ctx.moveTo(cut.x1, cut.y1);
                        ctx.lineTo(cut.x2, cut.y2);
                        ctx.strokeStyle = 'red';
                        ctx.stroke();
                    }
                });
            });
        },
        template: '<div><canvas width="1000px" height="1000px"></canvas></div>'
    };
});
