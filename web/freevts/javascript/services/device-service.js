freevtsApp.factory('deviceService',
  [
    '$http',
    '$q',
    'session',
    'api',
    'toastr',
    function($http, $q, session, api, toastr){

      "use strict";

      var service = {};
      var restApiUrl = 'https://fvt-dev.appspot.com';

      /**
       * Synchronize markerss with devices and map
       */
      service.synchronizeMarkers = function (markers, devices, map) {

        // add to markers from devices if don't exist
        //_.each(devices, function(device) {
        //  var marker = _.findWhere(markers, { 'deviceId': device.id });
        //  if (typeof marker === 'undefined') {
        //    markers.push({
        //      deviceId: device.id
        //    });
        //  }
        //});

        // remove from markers if they don't exist in devices

        var markerDeviceIds= _.pluck(markers, 'deviceId');

        _.each(markerDeviceIds, function(deviceId, index) {
          var device = _.findWhere(devices, { 'id': deviceId});

          if (typeof device === 'undefined') {
            map.removeLayer(markers[index]);
            markers.splice(index, 1);

          }
        });
      };


      /**
       * Map Related APIs
       */
      service.getLatestSample = function(deviceId){
        return $http.get(restApiUrl + '/user/' + session.getUserId() + '/device/' + deviceId + '/samples/last',
          { headers: api.getAuthHeaders() }
        )
        .then(function(response){
          return response.data;
        });
      };

      service.getDeviceSample = function(device) {
        return this.getLatestSample(device.id)
          .then(function(result){

            if (result.success === false){
              toastr.error('Device Sample Data', 'Device Id:' + device.id + ' ' + result.msg);

              //for test use demo sample
              device.sample = null;

            }
            else {
              device.sample = result.sample;
            }


          }, function(error){
            toastr.error('Device Sample Data', 'Device Id:' + device.id + ' is failed to retrieve sample data');
          });
      };

      /**
       * calculate the min, max of latitude and longitude
       * calculate center position
       */
      service.calculateDevicesRegion = function(devices){

        //specific min & max lat,long
        var min = { lat: null, lng: null }, max = { lat: null, lng: null };

        if (devices && devices.length > 0){

          var first = _.find(devices, function(device){ return (device.sample !== null && typeof device.sample !== 'undefined'); });

          if (!first){
            return null;
          }

          max.lat = min.lat = first.sample.latitude;
          max.lng = min.lng = first.sample.longitude;
        }
        else {
          return null;
        }


        _.each(devices, function(device){

          if (!device.sample){
            return;
          }

          if (device.sample.latitude < min.lat){
            min.lat = device.sample.latitude;
          }
          if (device.sample.longitude < min.lng){
            min.lng = device.sample.longitude;
          }

          if (device.sample.latitude > max.lat){
            max.lat = device.sample.latitude;
          }
          if (device.sample.longitude > max.lng){
            max.lng = device.sample.longitude;
          }

        });

        // return object
        return {
          min: min,
          max: max
        };

      };

      // get device provisioning status
      service.getProvision = function(device) {
        return $http.get(restApiUrl + '/user/' + session.getUserId() + '/device/' + device.id+ '/provision',
          { headers: api.getAuthHeaders() }
        )
        .then(function(response){
          return response.data;
        });
      };

      return service;
    }


  ]
);


