angular.module('cutlist')
.directive('rzEditableToggle', [() => {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            value: '=',
            values: '=',
            visualValues: '=',
            callback: '=',
            rowidx: '='
        },
        controller: ['$scope', function ($scope) {

            $scope.$watch('value', function () {
                $scope.index = $scope.values.indexOf($scope.value);
                if (!($scope.index >= 0)) {
                    $scope.index = 0;
                }
            });

            $scope.click = function () {
                $scope.index = ($scope.index + 1) % $scope.values.length;
            };

            $scope.$watch('index', function (index) {
                $scope.value = $scope.values[index];
                $scope.callback($scope.rowidx);
            });

        }],
        link: ($scope, el) => {
            el.on('keypress', function (ev) {
                if (ev.keyCode === 13) {
                    $scope.$apply(function () {
                        $scope.click();
                    });
                }
            });
        },
        templateUrl: '/views/partials/editable-toggle.html'
    };
}]);
