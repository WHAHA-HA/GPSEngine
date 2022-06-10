freevtsApp.controller('NewDeviceCtrl', function($rootScope, $state, $scope, $modalInstance, api, vendors){
  $scope.device = { name: '', vendor: '', model: '', apn: '', imei: '', phone: '', marker_color: '#f1c40f'};
  $scope.models = [];
  $scope.availableColors = [
    {
      value: '#f1c40f',
      display: ''
    },
    {
      value: '#27ae60',
      display: ''
    },
    {
      value: '#e74c3c',
      display: ''
    },
    {
      value: '#ecf0f1',
      display: ''
    },
    {
      value: '#95a5a6',
      display: ''
    }
  ];

  $scope.vendors = vendors;

  /**
   * Call add device id
   */
  $scope.ok = function(){
    if ($scope.confirmTerms !== true) {
      return;
    }
    api.addDevice($scope.device).then(function(res){
      $rootScope.addDevice = $scope.device;
      $rootScope.$broadcast('device_added', res); // should be replaced with service at some point.

    });
    $modalInstance.close();
  };

  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };

  $scope.setMake = function(make){
    $scope.makeName = make.name;
    $scope.device.vendor = make.id;
    $scope.modelName = '';
    $scope.device.model = '';
    $scope.models = make.models;
  };

  $scope.setModel = function(model){
    $scope.modelName = model.name;
    $scope.device.model = model.id;
  };
});