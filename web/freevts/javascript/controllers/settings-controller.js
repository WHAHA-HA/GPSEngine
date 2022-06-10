freevtsApp.controller('SettingsCtrl', ['$rootScope', '$scope', 'api', 'toastr', function($rootScope, $scope, api, toastr){
  "use strict";

  $('#userSettingsBtn')
    .on('click', function(){
      //TODO: better handle this via popover events but it doesn't work for some reason.
      $scope.pending = angular.copy($rootScope.user);
      $scope.emailEditable = $rootScope.user.auth_type == 'password';
    });


  this.update = function(){
    $scope.errorText = null;

    var u = $rootScope.user;
    var p = $scope.pending;

    var update = {};

    if (p.first_name != u.first_name)
      update.first_name = p.first_name;

    if (p.last_name != u.last_name)
      update.last_name = p.last_name;

    if (p.country_id != u.country_id){
      update.country_id = p.country_id;
      update.country_name = p.country_name;
      update.country = p.country;
    }

    if (p.email != u.email){
      update.email = p.email;
      p.email = u.email;
    }

    api.updateUser(update).then(function(data){
      if (data.success){
        $rootScope.user = $scope.pending;
        if (update.email){
          toastr.warning('Please check your new email account ' + update.email + ' for a verification letter.', '', {
            closeButton: true,
            timeOut: 0
          });
        } else {
          toastr.success('Update', 'Settings updated');
        }
      } else {
        toastr.warning('Update', angular.toJson(data, true));
        $scope.errorText = angular.toJson(data, true);
      }
    });
    return false;
  };

}]);
