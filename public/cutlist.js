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
}]);
