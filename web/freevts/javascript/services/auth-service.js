freevtsApp.factory('auth', ['$http', '$q', '$timeout', '$window', 'jwtHelper', 'session', 'api', 'user',
  function($http, $q, $timeout, $window, jwtHelper, session, api, userSvc){
    "use strict";
    /*
     Auth service initializes the session, keeps the session token fresh and handles user registration, login, logout.
     This is a more high-level service than the API service.
     */

    var service = {};

    var refreshPromise;

    var TOKEN_LEEWAY = 60;

    service.initSession = function(){
      return api.initSession().then(function(token){
        if (token){
          updateToken(token);
          return userSvc.loadCurrentUser().then(function(){
            return true;
          });
        }
        return false;
      });
    };

    service.register = function(user){
      return $http.post('/register', user).success(function(data){
        updateToken(data.token);
      });
    };

    service.login = function(credentials){
      return api.login(credentials).then(function(data){
        if (data.success){
          return service.initSession();
        }
        return data;
      });
    };

    service.logOut = function(){
      return api.logOut().then(function(){
        updateToken(null);
      });
    };

    service.redirectToLogin = function(){
      $window.location.href = 'http://www.freevehicletracking.com/login';
    };

    service.redirectToHomepage = function(){
      $window.location.href = 'http://www.freevehicletracking.com';
    };

    function updateToken(token){
      session.setToken(token);
      if (refreshPromise){
        $timeout.cancel(refreshPromise);
        refreshPromise = null;
      }

      if (token){
        var payload = jwtHelper.decodeToken(token);
        session.setUserId(payload.usr);

        var currentTime = Math.round(new Date().getTime() / 1000.0);
        var delay = (payload.exp - currentTime - TOKEN_LEEWAY) * 1000.0;
        $timeout(refreshToken, delay, false);
      }
    }

    function refreshToken(){
      api.refreshToken().then(function(token){
        updateToken(token);
      });
    }

    return service;
  }]);