freevtsApp.factory('user', ['session', 'api', '$rootScope',
  function(session, api, $rootScope){
    "use strict";

    var service = {
      loadCurrentUser: function(){
        return api.loadUser(session.getUserId()).then(function(data){
          $rootScope.user = data.user;
        });
      }
    };

    return service;
  }]);
