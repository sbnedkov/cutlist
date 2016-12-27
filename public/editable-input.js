angular.module('cutlist')
.directive('rzEditableInput', ['$timeout', ($timeout) => {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            value: '='
        },
        link: ($scope, el) => {
            $scope.click = () => {
                $scope.hasFocus = true;
                $timeout(() => {
                    el.find('input')[0].focus(true);
                });
            };

            $scope.blur = () => {
                $scope.hasFocus = false;
            };

            $scope.change = () => {
                $scope.hasFocus = false;
            };
        },
        templateUrl: '/views/partials/editable-input.html'
    };
}]);
