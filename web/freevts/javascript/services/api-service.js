freevtsApp.factory('api', ['$http', '$q', 'session', function($http, $q, session){
  "use strict";

  var service = {};

  var restApiUrl = 'https://fvt-dev.appspot.com';
  var mapboxKey = 'pk.eyJ1IjoiZnJlZXZlaGljbGV0cmFja2luZyIsImEiOiIwYTRkZDA0MDdmN2JjZThhYjEwZWFjNjMwM2ZjNTA0MCJ9.vuz2hbRkEYCKmauxAdMkzg';
  var mapboxApiUrl = 'https://api.mapbox.com/v4';


  service.initSession = function(){
    var deferred = $q.defer();
    $http.post(restApiUrl + '/init', undefined, {
      withCredentials: true
    }).then(function(response){
      if (response.data.success){
        if (response.data.token){
          deferred.resolve(response.data.token);
        } else {
          deferred.resolve(null);
        }
      } else {
        console.error('Error response from /init', response.data);
        deferred.reject(response.data);
      }
    }, function(response){
      console.error('Error while initializing session', response);
      deferred.reject();
    });

    return deferred.promise;
  };

  service.refreshToken = function(token){
    return $http({
      url: restApiUrl + '/token/refresh',
      method: "POST",
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).then(function(response){
      if (response.data.success){
        return response.data.token;
      } else {
        //TODO: logout the user
        console.warn('Token not refreshed', response.data);
        return null;
      }
    });
  };

  service.login = function(credentials){
    return $http({
      url: restApiUrl + '/login',
      method: "POST",
      headers: { 'Content-type': 'application/json', 'Accept': 'text/plain' },
      withCredentials: true,
      data: credentials
    }).then(function(response){
      return response.data;
    });
  };


  service.logOut = function(){
    return $http({
      url: restApiUrl + '/logout',
      method: "POST",
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  };


  service.getVendors = function(){
    return $http.get(restApiUrl + '/static/vendors.json').
      then(function(response){
        return response.data;
      });
  };

  service.getDeviceList = function(){
    var url = restApiUrl + '/user/' + session.getUserId() + '/device';
    var req = {
      method: 'GET',
      url: url,
      headers: this.getAuthHeaders()
    };

    return $http(req).then(function(response){
      if (response.data.success)
        return response.data.devices;
      return null;
    });
  };

  /**
   * call add device api to register new api
   */
  service.addDevice = function(device){
    var req = {
      method: 'POST',
      url: restApiUrl + '/user/' + session.getUserId() + '/device',
      headers: this.getAuthHeaders(),
      data: device
    };

    return $http(req).then(function(response){
      return response.data;
    });
  };

  /**
   * update device info
   * /user/<user_id>/device/<device_id>
   */
  service.updateDevice = function(device, deviceId){
    var req = {
      method: 'PUT',
      url: restApiUrl + '/user/' + session.getUserId() + '/device/' + deviceId,
      headers: this.getAuthHeaders(),
      data: device
    };

    return $http(req).then(function(response){
      return response.data;
    });
  };

  /**
   * Update User Password
   */
  service.updateUserPassword = function(password, oldPassword){
    return $http.put(
      restApiUrl + '/user/' + session.getUserId(), {
        password: password,
        old_password: oldPassword
      }, { headers: this.getAuthHeaders() }
    ).then(function(response){
        return response.data;
      });
  };


  service.loadUser = function(userId){
    return $http({
      url: restApiUrl + '/user/' + userId,
      method: "GET",
      headers: this.getAuthHeaders()
    }).then(function(response){
      return response.data;
    });
  };


  service.updateUser = function(update){
    return $http.put(
      restApiUrl + '/user/' + session.getUserId(), update, { headers: this.getAuthHeaders() }
    ).then(function(response){
        return response.data;
      });
  };


  /**
   * Call mapbox reverse geocode api: it returns featurescollection type
   * :https://www.mapbox.com/developers/api/geocoding/
   */
  service.getPlaces = function(lat, lon){

    return $http({
      url: mapboxApiUrl + '/geocode/mapbox.places/' + lon + ',' + lat + '.json?access_token=' + mapboxKey,
      method: "GET"
    }).then(function(response){
      return response.data;
    });

  };

  service.confirmNewEmail = function(authcode){
    return $http.post(
      restApiUrl + '/email/confirm', { authcode: authcode }, { headers: this.getAuthHeaders() }
    ).then(function(response){
        return response.data;
      });
  };

  // load json file of country_id & centroids
  service.getCountryCentroids = function() {
    return $http.get('static/country_centroid.json');
  };

  service.getAuthHeaders = function(){
    return {
      'Content-type': 'application/json',
      'Accept': 'text/plain',
      'Authorization': 'JWT ' + session.getToken()
    };
  };

  return service;
}]);


