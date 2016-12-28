angular.module('cutlist')
.directive('rzEditableSelect', ['$timeout', ($timeout) => {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            value: '=',
            values: '=',
            callback: '=',
            rowidx: '='
        },
        link: ($scope, el) => {
            $scope.click = () => {
                $scope.hasFocus = true;
                $timeout(() => {
                    el.find('select')[0].focus(true);
                });
            };

            $scope.blur = () => {
                $scope.hasFocus = false;
            };

            $scope.change = () => {
                $scope.hasFocus = false;
                $scope.callback($scope.rowidx);
            };
        },
        templateUrl: '/views/partials/editable-select.html'
    };
}]);
