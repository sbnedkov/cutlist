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
            slate: $scope.slate,
            parts: $scope.parts
        }).success((res) => {
            $scope.cutlist = res;
        }).error((err) => {
            alert(JSON.stringify(err));
        });
    };

    $scope.slate = {
        w: 1000,
        h: 1000
    };

    $scope.parts = [{
        name: 'a',
        w: 600,
        h: 100,
        canRotate: true
    }, {
        name: 'b',
        w: 300,
        h: 200
    }, {
        w: 300,
        name: 'c',
        h: 200
    }, {
        name: 'd',
        w: 400,
        h: 300
    }, {
        name: 'e',
        w: 500,
        h: 500
    }, {
        name: 'f',
        w: 500,
        h: 500
    }];
}]).directive('cutlistCanvas', function () {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attributes) {
            scope.$watch('cutlist', function (cutlist) {
                var ctx = element[0].getContext('2d');

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.font = '20px Verdana';

                if (!cutlist) {
                    ctx.clearRect(0, 0, element[0].width, element[0].height);
                    return;
                }

                ctx.clearRect(0, 0, element[0].width, element[0].height);

                var ratio = element[0].width / scope.slate.w;
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

                ctx.strokeRect(0, 0, scope.slate.w, scope.slate.h);
                cutlist.forEach(function (part) {
                    ctx.strokeRect(part.x, part.y, part.w, part.h);
                    ctx.fillText(part.name, part.x + part.w / 2, part.y + part.h / 2);
                });
            });
        },
        template: '<canvas width="1000px" height="1000px"></canvas>'
    };
});
