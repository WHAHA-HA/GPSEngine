freevtsApp.controller('PasswordCtrl', ['$scope', 'api', 'toastr', function($scope, api, toastr){
  "use strict";
  var me = this;
  $('#updatePasswordBtn')
    .on('click', function(){
      me.current = '';
      me.new1 = '';
      me.new2 = '';
    });

  this.update = function(){
    $scope.errorText = null;

    var upd = {
      password: me.new1,
      old_password: me.current
    };
    api.updateUser(upd).then(function(data){
      if (data.success){
        toastr.success('Password has been updated', 'Update');
      } else {
        if (data.code == 'wrong_password')
          toastr.error('You entered a wrong current password','Error');
        else {
          toastr.error(angular.toJson(data, true), 'Error');
          console.error(data);
        }
      }
    });
    return false;
  };

}]);
