freevtsApp.directive("passwordVerify", function(){
  return {
    require: "ngModel",
    restrict: 'A',
    scope: {
      passwordVerify: '@'
    },
    link: function(scope, element, attrs, ctrl){
      function updateValidity(){
        var viewValue = ctrl.$viewValue;
        if (viewValue){
          var origin = scope.passwordVerify;
          if (origin !== viewValue){
            ctrl.$setValidity("passwordVerify", false);
            return undefined;
          } else {
            ctrl.$setValidity("passwordVerify", true);
            return viewValue;
          }
        } else {
          ctrl.$setValidity("passwordVerify", true);
          return viewValue;
        }
      }

      ctrl.$parsers.unshift(function(viewValue){
        return updateValidity(viewValue);
      });

      scope.$watch(function(){
        return ctrl.$viewValue;
      }, updateValidity);

      scope.$watch('passwordVerify', function(value){
        updateValidity();
      });
    }
  };
});
