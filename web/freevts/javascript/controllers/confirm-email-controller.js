freevtsApp.controller('ConfirmEmail', ['$state', '$stateParams', '$rootScope', 'toastr', 'api', 'user',
  function($state, $stateParams, $rootScope, toastr, api, user){
    function notifySuccess(){
      toastr.success('Your email address has been updated successfully');
    }

    $state.on('init', function(){
      api.confirmNewEmail($stateParams.authcode).then(function(){
        if ($rootScope.user){
          user.loadCurrentUser().then(notifySuccess);
        }
        else notifySuccess();
      });
    });

    $state.go('map');
  }]);
