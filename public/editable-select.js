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
                $timeout(() => $scope.isOpen = true);

                el.find('input')[0].focus(true);
            };

            $scope.change = (ev, option) => {
                ev.preventDefault();
                ev.stopPropagation();

                $scope.hasFocus = false;
                $scope.isOpen = false;

                if (option && !~$scope.values.indexOf(option)) {
                    $scope.values.push(option);
                }
                $scope.callback($scope.rowidx);
            };

            $scope.changeValue = (ev, option) => {
                $scope.value = option;
                $scope.change(ev, option);
            };

            $scope.keypress = ev => {
                if (ev.originalEvent.keyCode === 13) {
                    $scope.change(ev, $scope.value);
                } else if (ev.originalEvent.keyCode === 27) {
                    $scope.hasFocus = false;
                    $scope.isOpen = false;
                }
            };

            el.find('input').on('blur', () => {
                $scope.hasFocus = false;
            });
        },
        templateUrl: '/views/partials/editable-select.html'
    };
}]);
