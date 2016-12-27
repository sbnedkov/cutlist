angular.module('cutlist')
.directive('rzEditableToggle', [() => {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            value: '=',
            values: '='
        },
        link: ($scope) => {
            $scope.index = $scope.values.indexOf($scope.value);
            $scope.click = function () {
                $scope.index = ($scope.index + 1) % $scope.values.length;
                $scope.value = $scope.values[$scope.index];
            };
        },
        templateUrl: '/views/partials/editable-toggle.html'
    };
}]);
