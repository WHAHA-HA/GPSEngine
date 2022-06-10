freevtsApp.directive('password', ['$parse', function($parse){
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, element, attrs, ctrl){
      if (!element.attr('name'))
        throw Error('Attribute "name" must be set');
      ctrl.$parsers.unshift(function(viewValue){
        var title = [];
        if (!scope.tooltips)
          scope.tooltips = {};

        if (viewValue){
          ctrl.$setValidity('pwEmpty', true);
          var pwLength = viewValue.length >= 8;
          ctrl.$setValidity('pwLength', pwLength);
          if (!pwLength){
            title.push('Password must be at least 8 characters long');
          }

          var pwUppercase = /[A-Z]/.test(viewValue);
          ctrl.$setValidity('pwUppercase', pwUppercase);
          if (!pwUppercase){
            title.push('Password must contain at least one uppercase letter');
          }

          var pwLowercase = /[a-z]/.test(viewValue);
          ctrl.$setValidity('pwLowercase', pwLowercase);
          if (!pwLowercase){
            title.push('Password must contain at least one lowercase letter');
          }

          var pwDigit = /\d/.test(viewValue);
          ctrl.$setValidity('pwDigit', pwDigit);
          if (!pwDigit){
            title.push('Password must contain at least one digit');
          }

          var pwSpecial = /[!@#\$%\^&\*\(\)\-_\+=\[\]\?]/.test(viewValue);
          ctrl.$setValidity('pwSpecial', pwSpecial);
          if (!pwSpecial){
            title.push('Password must contain at least one the following characters: !@#$%^&*()-_+=[]?');
          }

          var pwBad = !/[^a-zA-Z\d!@#\$%\^&\*\(\)\-_\+=\[\]\?]/.test(viewValue);
          ctrl.$setValidity('pwBad', pwBad);
          if (!pwBad){
            title.push('Password must contain only these characters: a-zA-Z!@#$%^&*()-_+=[]?');
          }
          scope.tooltips[element.attr('name')] = title.join('<br>');
        } else {
          ctrl.$setValidity('pwEmpty', false);
          ctrl.$setValidity('pwLength', false);
          ctrl.$setValidity('pwUppercase', false);
          ctrl.$setValidity('pwLowercase', false);
          ctrl.$setValidity('pwDigit', false);
          ctrl.$setValidity('pwSpecial', false);
          ctrl.$setValidity('pwBad', false);

          scope.tooltips[element.attr('name')] = 'Please fill this field';
        }
        return viewValue;
      });
    }
  };
}]);
