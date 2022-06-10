freevtsApp.controller('SignupCtrl', function($scope, $http, $modal, $log, $window, $location, $state, $locale) {
	$scope.showSuccess = false;
	$scope.showError = false;
	$scope.hideForm = false;
	$scope.newuser = {};
	$scope.locale = $locale.id;
	console.log($scope.locale);
	var BACKEND_URL = "https://fvt-dev.appspot.com/";
	var host = $location.protocol() + "://" + $location.host() + ":" + $location.port();
	$scope.countries = [];
	var headers = {'Content-type': 'application/json', 'Accept': 'text/plain'};

	$http.get(host + '/countries').
		success(function(data, status, headers, config) {
			$scope.countries = data;
		}).
		error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
	});

	$scope.retry = function () {
		$scope.showSuccess = false;
		$scope.showError = false;
		$scope.hideForm = false;
	};


	$scope.finish = function () {
		$state.go('login');
	};
	
	
	$scope.createAccount = function () {
		// email
		// first_name

		// last_name

		// country - 2-letter ISO code of the user's country

		// country_id - Google Place ID for user's country
		// country_name - Country name in the user's current locale.

		// locale - A locale value made of a 2-letter ISO language code and a 2-letter ISO country code. Example: en_AU, en_GB, ru_RU
		

		var selcountry = _.find($scope.countries, function(country) {
			     return  country.Sort == $scope.country_sort;
		});

		$scope.newuser.country = selcountry.Code;
		$scope.newuser.country_name = selcountry.Name;
		$scope.newuser.locale = $scope.locale;
		$scope.newuser.country_id = "";

		$http({
		    url: BACKEND_URL + 'signup',
		        method: "POST",
		        headers: headers,
		        data: $scope.newuser
		    }).success(function(data, status, headers, config) {
		        $scope.data = data;
		        $scope.showSuccess = false;
				$scope.showError = false;
		        if($scope.data.success === true) {
		        	$scope.showSuccess = true;
					$scope.showError = false;
					$scope.hideForm = true;
		        } else {
		        	$scope.showSuccess = false;
					$scope.showError = true;
					$scope.hideForm = true;
		        }
		        
		    }).error(function(data, status, headers, config) {
		        $scope.status = status;
		});
	};
});