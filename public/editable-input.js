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

            el.on('keypress', function (ev) {
                if (ev.keyCode === 13) {
                    $scope.$apply(function () {
                        $scope.hasFocus = false;
                    });
                }
            });
        },
        templateUrl: '/views/partials/editable-input.html'
    };
}]);
