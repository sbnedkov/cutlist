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
        w: 100,
        h: 100
    }, {
        w: 200,
        h: 200
    }, {
        w: 300,
        h: 300
    }, {
        w: 400,
        h: 400
    }, {
        w: 500,
        h: 500
    }, {
        w: 500,
        h: 500
    }];
}]).directive('cutlistCanvas', function () {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attributes) {
            scope.$watch('cutlist', function (cutlist) {
                if (!cutlist) {
                    return;
                }

                var ctx = element[0].getContext('2d');
                cutlist.forEach(function (part) {
                    ctx.strokeRect(part.x, part.y, part.w, part.h);
                });
            });
        },
        template: '<canvas width="1000px" height="1000px"></canvas>'
    };
});
