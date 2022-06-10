freevtsApp.controller('MainCtrl',
  [
    '$rootScope',
    '$scope',
    '$modal',
    '$log',
    '$window',
    '$interval',
    '$q',
    'toastr',
    'auth',
    'api',
    'deviceService',
    function($rootScope,$scope,$modal,$log,$window,$interval,$q,toastr,auth,api, deviceService)
    {
      "use strict";

      var main = this;
      var map = null;
      var featureLayer = null;
      var layersByMode = null;
      var fillColor = "#33e117";



      // initialization function and it will be called at first time
      main.init = function() {
        main.isCollapsed = false;
        main.satelliteBase = false;
        main.plainBase = true;
        main.items = ['item1', 'item2', 'item3'];
        main.options = {
          types: '(regions)'
        };
        main.country_details = '';
        main.firstTime = false;
        main.inZoom = false;
        main.colors = ['red', 'blue', 'brown', 'pink', 'green'];
        main.refreshDeviceInterval = 20 * 1000; // in miliseconds
        main.countryCentroids = [];
        main.markers = [];
        main.mapMode = 'plain';
        main.devices = [];
        main.maxDeviceNumber = 5;
        main.defaultMarkerColor = 'yellow';
        main.vendors = [];

        api.getVendors().then(function(data){
          main.vendors = data;
        });
      };

      function removeDefaultLayers(map){
        var lrs = [];

        map.eachLayer(function(layer){
          lrs.push(layer);
        });

        angular.forEach(lrs, function(layer){
          map.removeLayer(layer);
        });
      }

      main.initMap = function(){
        L.mapbox.accessToken = 'pk.eyJ1IjoiZnJlZXZlaGljbGV0cmFja2luZyIsImEiOiJJenBhVGpBIn0.0isbJYJJfUZLTdMymHxMEg';
        layersByMode = {
          plain: L.mapbox.tileLayer('freevehicletracking.mp60n9mp'),
          streets: L.mapbox.tileLayer('freevehicletracking.lpb9cfic'),
          satellite: L.mapbox.tileLayer('freevehicletracking.m0f6a5pi')
        };

        map = L.mapbox.map('map', 'freevehicletracking.mp60n9mp', {
          zoomControl: false,
          attributionControl: false,
          minZoom: 3,
          maxBounds: [
            [-90, -18000],
            [90, 18000]
          ]
        });

        removeDefaultLayers(map);

        new L.Control.Zoom({ position: 'topright' }).addTo(map);


        //featureLayer = L.mapbox.featureLayer('../freevts/static/plots.geojson').addTo(map);

        //featureLayer.on('ready', function(){
        //  var i = featureLayer._geojson.features.length - 1;
        //  var start;
        //  var end;
        //  var polyline = L.polyline([]).addTo(map);
        //  // For each point in the map.featureLayer, grab its latitude and longitude
        //  // values and add them to the line
        //  var n = 0;
        //  featureLayer.eachLayer(function(l){
        //    if (n === 0){
        //      start = l.getLatLng();
        //    } else {
        //      if (n === i){
        //        end = l.getLatLng();
        //      }
        //    }
        //
        //    if (l.feature.properties['Speed'] > 99){
        //      fillColor = "#ee3a0d";
        //    }
        //
        //
        //    l.setIcon(L.mapbox.marker.icon({
        //      'marker-color': fillColor,
        //      'marker-symbol': "car",
        //      'marker-size': 'small'
        //    }));
        //
        //    polyline.addLatLng(l.getLatLng());
        //    n++;
        //  });
        //
        //
        //
        //  startMarker = L.marker(start, {
        //    icon: L.mapbox.marker.icon({
        //      'marker-size': 'small',
        //      'marker-symbol': 'car',
        //      'marker-color': '#33e117'`
        //    })
        //  }).addTo(map);
        //
        //  endMarker = L.marker(end, {
        //    icon: L.mapbox.marker.icon({
        //      'marker-size': 'small',
        //      'marker-symbol': 'car',
        //      'marker-color': '#ee3a0d'
        //    })
        //  }).addTo(map);
        //
        //  map.fitBounds(featureLayer.getBounds());
        //  featureLayer.setFilter(function(){ return false; });
        //  main.firstTime = true;
        //});
        map.on('zoomend', function(){
          if (main.firstTime){
            if (map.getZoom() < 15){
              featureLayer.setFilter(function(){ return false; });
              main.inZoom = false;
            } else {

              if (!main.inZoom){
                featureLayer.setFilter(function(){ return true; });
                featureLayer.eachLayer(function(l){
                  if (l.feature.properties['Speed'] > 99){
                    fillColor = "#ee3a0d";
                  } else {
                    fillColor = "#33e117";
                  }

                  l.setIcon(L.mapbox.marker.icon({
                    'marker-color': fillColor,
                    'marker-symbol': "car",
                    'marker-size': 'small'
                  }));

                  var popupMsg = "<p>" + l.feature.properties.Time + "</p><p>" + l.feature.properties.Speed + "km/h </p> </br>";
                  l.bindPopup(popupMsg);
                });
                main.inZoom = true;
                map.featureLayer.setFilter(function(){ return false; });
              }
            }
          }
        });
      };

      //Wait for the DOM to finish loading so it can find the Map div
      $scope.$on('$viewContentLoaded',
        function(event){
          main.initMap();
        });

      $scope.$on('device_added', function(event, res){
        if (res.success === true){
          toastr.success('Device Added', 'Successfully');
          main.listDevices();
        } else {
          if (res.code === 'token_invalid'){
            if (res.detail.indexOf('expired') > -1){
              api.refreshToken().then(function(){
                api.addDevice(main.device).then(function(res){
                  $rootScope.addDevice = main.device;
                  $rootScope.$broadcast('device_added', res);
                });
              });
            }
            else {
              toastr.error(res.detail, 'Error');
            }
          } else {
            if (typeof res.detail === 'object') {
              _.map(res.detail, function(value, key){
                toastr.error(key + ': '+value, 'Error');
              });
            }
            else {
              toastr.error('Device Add Failed', 'Error');
            }
          }
        }
      });

      $scope.$watch('main.mapMode', function(mapMode){
        //console.log('mapMode', mapMode);
        if (!mapMode) return;

        angular.forEach(layersByMode, function(layer){
          //console.log('layer: ', layer);
          if (map.hasLayer(layer)){
            map.removeLayer(layer);
          }
        });

        map.addLayer(layersByMode[mapMode]);
      });

      /**
       * get list of devices of users and update it on the left device section
       */
      main.listDevices = function(){

        return api.getDeviceList().then(function(devices){

          /**
           * to get sample data using api takes time, during that time UI blinks
           * to prevent that after copy devices with sample
           */
          var tmp = [];
          angular.copy(main.devices, tmp);
          angular.copy(devices, main.devices);

          //// if the length is not
          //for (var i=0; i < main.maxDeviceNumber - main.devices.length; i++ ) {
          //
          //}

          _.each(tmp, function(tmpDevice, key) {

            if (main.devices[key]) {
              main.devices[key]['sample'] = tmpDevice.sample;
              main.devices[key]['place'] = tmpDevice.place;
            }

          });


          // check the interval object and stop interval in case no device
          if (main.listDeviceIntervalObj && (!devices || devices.length === 0)){
            $interval.cancel(main.listDeviceIntervalObj);
            main.listDeviceIntervalObj = undefined;
          }

          //synchronize markers with devices
          deviceService.synchronizeMarkers(main.markers, main.devices, map);

          var funcs = [];

          angular.forEach(main.devices, function(device, key){
            if (device !==null) {
              funcs.push(main.loadPlaceDetailOfDevice(device, key));
            }
          });

          return $q.all(funcs);

        });
      };

      /**
       * async call to get place detail of device
       * index: used for background color selection
       */
      main.loadPlaceDetailOfDevice = function(device, index){

        var deferred = $q.defer();

        deviceService.getProvision(device)
          .then(function(provision){

            device.provisionState = provision.state;

            if (device.provisionState !== 'completed') {
              device.sample = null;
              device.place = 'Unknown';
              return $q.reject('Provisioning state of one device status:' + provision.state);
            }

            return deviceService.getDeviceSample(device);
          })
          .then(function(response){

            /**
             * prepare the device markup
             */

            var cssIcon = L.divIcon({
              className: 'marker',
              html: main.getMarkerHtml(device, device.name)
            });

            console.log(device.sample);
            if (!device.sample){

              // should be decide to destroy marker and then recreate below, or just leave as it is
              device.place = 'Unknown';
              return $q.reject('Sample data of one device receives empty: name:' + device.name);
            }
            else {

              var marker = _.findWhere(main.markers, {'deviceId': device.id});

              if (typeof marker === 'undefined') {
                marker = {};
                marker.obj = L.marker([device.sample.latitude, device.sample.longitude], { icon: cssIcon });
                marker.deviceId = device.id;
                main.markers.push(marker);
                marker.obj.addTo(map);

              }
              else {
                marker.obj.setLatLng([device.sample.latitude, device.sample.longitude]);
              }



              //call mapbox geocoding api to get location info
              return api.getPlaces(device.sample.latitude, device.sample.longitude);
            }

          })
          .then(function(response){

            if (response.features && response.features.length > 0){
              device.place = response.features[0].place_name;
            }
            else {
              device.place = 'Unknown';
            }

            deferred.resolve(device); // resolve

          })
          .catch(function(error){
            device.place = 'Unknown';
            deferred.reject(error);
          });

        return deferred.promise;
      };


      /**
       * returns marker html
       */
      main.getMarkerHtml = function(device, text){
        var color = main.defaultMarkerColor; //default color

        if (device.marker_color) {
          color = device.marker_color;
        }

        return '<div class="marker-header vehicle-' + color + '">' +
          text + //'<i class="fa fa-location-arrow pull-right" >' +
          //'</i>' +
          '</div>' +
          '<div class="marker-triangle vehicle-border-top-'+color +'"></div>';
      };

      main.addNewDevice = function(){
        api.addDevice($rootScope.addDevice).then(function(res){
          $rootScope.$broadcast('device_added', res);
        });
      };

      main.disableMap = function(){
        // Disable drag and zoom handlers.
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();

        // Disable tap handler, if present.
        if (map.tap) map.tap.disable();
      };

      main.enableMap = function(){
        // Disable drag and zoom handlers.
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();

        // enable tap handler, if present.
        if (map.tap) map.tap.enable();
      };

      main.logout = function(){
        auth.logOut().then(function(){
          auth.redirectToHomepage();
        });
      };

      /**
       * Select the device and show detail view
       */
      main.selectDevice = function(device){
        main.curOriginDevice = angular.copy(device); //save the original device in case update failiure
        main.curDevice = device;
      };

      /**
       * Update device info and make the editing status = false
       * @param device
       */
      main.updateDevice = function(device){

        var tmpDevice = {
          apn: device.apn,
          gprs_password: device.gprs_password,
          gprs_username: device.gprs_username,
          gprs_imei: device.gprs_imei,
          model: device.model,
          phone: device.phone,
          vendor: device.vendor
        };

        api.updateDevice(tmpDevice, device.id).then(function(res){

          if (res.success === true){
            toastr.success('Device Updated', 'Successfully');

            angular.copy(device, main.curOriginDevice);
            main.stopDeviceEditing(device); //stop device editing
            main.listDevices(); //refresh device panel
          } else {
            toastr.error('Device Update Failed', 'Error');
            angular.copy(main.curOriginDevice, device); //restore the origin device object
          }
        });
      };


      /**
       * Make it editing permitted so disable readonly property
       * @param device
       */
      main.startDeviceEditing = function(device){
        device.isEditing = true;
      };

      /**
       * Stop device editing
       * @param device
       */
      main.stopDeviceEditing = function(device){
        device.isEditing = false;
      };

      // show add device dialog
      main.showNewDeviceDlg = function(size){
        //console.log("New Device Modal");
        var modalInstance = $modal.open({
          templateUrl: 'templates/new-device.html',
          controller: 'NewDeviceCtrl',
          size: size,
          resolve: {
            vendors: function() {
              return main.vendors;
            }
          }
        });

        modalInstance.result.then(function(selectedItem){
          main.selected = selectedItem;
        }, function(){
          //$log.info('Modal dismissed at: ' + new Date());
        });
      };

      main.remoteUrlRequestFn = function(str){
        return { q: str };
      };


      // move the map to show the device at the center
      main.moveMapCenterToDevice = function(device) {
        if (device.sample && device.sample.latitude && device.sample.longitude) {
          map.setView([device.sample.latitude, device.sample.longitude]);
        }
      };

      /**
       * return vendor object based on vendorId
       * @param vendorId
       */
      main.getVendor = function(vendorId) {
        return _.findWhere(main.vendors, {id: vendorId});
      };

      main.getModel = function(vendorId, modelId) {
        var vendor = main.getVendor(vendorId);
        if (!vendor) {
          return null;
        }

        return _.findWhere(vendor.models, {id: modelId});
      };



      function initializeDeviceList(){

        /**
         * Load country centroid data from static csv file
         */

        api.getCountryCentroids()
          .then(function(res){
            main.countryCentroids = res.data;
            return main.listDevices();
          })
          .then(function(responses){


          })
          .finally(function(){ // it will be fired although an error in devices initial sample info

            /**
             * calculate the min, max of latitude and longitude
             * calculate device.sample.latitude, device.sample.longitude position
             */
            var region = deviceService.calculateDevicesRegion(main.devices);
            if (region === null){

              // show user's country central position
              var centroid = _.findWhere(main.countryCentroids, { 'code': $rootScope.user.country });

              if (!centroid){
                //if no data, show 0,0
                map.setView(L.latLng(0, 0));
                map.setZoom(2); // default zoom level

              }
              else {
                var latLng = centroid.loc.split(',');

                map.setView(L.latLng(latLng[0], latLng[1]));
                map.setZoom(2); // default zoom level
              }

            }
            else {

              var centerPlace = { lat: null, lng: null };
              centerPlace.lat = (region.min.lat + region.max.lat) / 2;
              centerPlace.lng = (region.min.lng + region.max.lng) / 2;

              if (map.devices && map.devices.length == 1){
                map.setView(L.latLng(centerPlace.lat, centerPlace.lng));
                map.setZoom(3); // default zoom level
              }
              else {
                map.fitBounds([
                  [region.min.lat, region.min.lng],
                  [region.max.lat, region.max.lng]
                ]);
              }

            }
          })
          .catch(function(error){
            toastr.error('Map initialization has failed', 'Error');
            console.error(error);
          });


        // create interval function and save the object in case to stop;
        main.listDeviceIntervalObj = $interval(main.listDevices, main.refreshDeviceInterval);


      }



      // Initialize Code area
      main.init();

      if ($rootScope.user)
        initializeDeviceList();
      else {
        $scope.$on('init', initializeDeviceList);
      }


    }]
);
