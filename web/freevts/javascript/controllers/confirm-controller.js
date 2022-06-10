freevtsApp.controller('ConfirmCtrl', function($rootScope, $scope, $modal, $log, $window, $stateParams, $state, $location, $http) {
	$scope.user = {};
	var host = $location.protocol() + "://" + $location.host() + ":" + $location.port();
	var headers = {'Content-type': 'application/json', 'Accept': 'text/plain'};

	$scope.user.email = $stateParams.email;
	
	$scope.confirmAccount = function () {
		$http({
		    url: host + '/confirm',
		        method: "POST",
		        headers: headers,
		        data: $scope.user
		    }).success(function(data, status, headers, config) {
		        $scope.data = data;
		        console.log(data);
		        if($scope.data.success === true) {
		        	$rootScope.user = $scope.user;
		        	$rootScope.user.auth = true;
		        	$state.go('map');
		        }
		    }).error(function(data, status, headers, config) {
		        $scope.status = status;
		});	
	};
});