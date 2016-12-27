angular.module('cutlist')
.directive('rzEditableSelect', ['$timeout', ($timeout) => {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            value: '=',
            values: '='
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
            };
        },
        templateUrl: '/views/partials/editable-select.html'
    };
}]);
