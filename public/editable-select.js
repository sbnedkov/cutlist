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

            el.on('keypress', function (ev) {
                if (ev.keyCode === 13) {
                    $scope.$apply(function () {
                        $scope.click();
                    });
                }
            });
        },
        templateUrl: '/views/partials/editable-select.html'
    };
}]);
