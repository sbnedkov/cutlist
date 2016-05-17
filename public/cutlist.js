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
                    // Ignore rotation for now
                    var w = part.item.w;
                    var h = part.item.h;
//                    var w = part.rotated ? part.item.h : part.item.w;
//                    var h = part.rotated ? part.item.w : part.item.h;
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
