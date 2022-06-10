var autoComplete = angular.module('elsap-autoComplete',[]);

autoComplete.directive('autoComplete', function() {
    return {
        restrict: 'AE',
        require: '?ngModel',
        template: '<input type="text" name="{{inputname}}" class="{{inputclass}}" ng-model="inputField" style="float: left;" ng-required="{{isrequired}}" placeholder="{{placeholder}}" ng-blur="onBlur()"/> ' +
                  '<div style="{{(divstyle) ? divstyle : \'position: relative; float: left; width: 400px;\'}}" ng-click="divClicked = true"></div>',
        scope: {
            inputname: '@',
            source: '=',
            isrequired: '@',
            inputclass: '@',
            divstyle: '@',
            placeholder: '@',
            onselect: '=',
            ngModel: '=',
            reset: '=',
            anyvalue: '@',
            initialValue: '@'
        },
        controller: function($scope) {
        },
        link: function(scope, elem, attr, ngModel) {
            if(typeof scope.source == 'function') {
                scope.lookup = scope.source;
            }

            if(typeof scope.source == 'object') {
                scope.lookup = scope.source;
            }

            scope.divClicked = false;

            scope.onBlur = function() {
                if(!scope.anyvalue && !scope.divClicked) {
                    scope.inputField = '';
                    if(attr.ngModel) {
                        ngModel.$setViewValue('');
                    }
                }
                scope.divClicked = false;
            }

            scope.reset = function() {
                if(attr.ngModel) {
                    ngModel.$setViewValue('');
                }
                elem.find('input').val('');
            }

            jQuery(elem).find('input').autocomplete({
                minChars: 3,
                lookup: scope.lookup,
                appendTo: elem.find('div'),
                onSelect: function (suggestion) {
                    if(attr.ngModel) {
                        ngModel.$setViewValue(suggestion.data);
                    }

                    scope.inputField = suggestion.value;
                    scope.divClicked = false;

                    if(typeof scope.onselect == 'function') {
                        scope.onselect(suggestion);
                    }
                }
            });
            scope.inputField = scope.initialValue;
        }
    };
});