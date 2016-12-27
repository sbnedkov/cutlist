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
            };

            $scope.$watch('index', function (index) {
                if (!(index >= 0)) {
                    $scope.index = 0;
                }
                $scope.value = $scope.values[index];
            });
        },
        templateUrl: '/views/partials/editable-toggle.html'
    };
}]);
