freevtsApp.factory('session', [function(){
  "use strict";

  var token = null;
  var userId = null;

  var service = {
    setToken: function(t){
      token = t;
    },
    getToken: function(){
      return token;
    },
    setUserId: function(id){
      userId = id;
    },
    getUserId: function(){
      return userId;
    }
  };

  return service;
}]);
