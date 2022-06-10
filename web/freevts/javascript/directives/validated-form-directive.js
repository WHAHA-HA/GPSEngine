freevtsApp.directive('validatedForm', [function(){
  "use strict";

  function link(scope, element, attrs){
    //TODO: walk input elements and set form-group validity class on change of input validity
    var formName = attrs['name'];
    if (!formName) throw Error("Define name for your form");

    element.attr('novalidate', '');

    scope.$watch(formName + '.$valid', function(valid){

    });
  }

  return {
    restrict: 'A',
    link: link
  };
}]);