freevtsApp.directive('country', [function(){
  "use strict";


  var autocompleteService = new google.maps.places.AutocompleteService();

  var placesService = null;
  var waitingPlaceDetails = false;
  var expectingPlaceDetails = true;
  var pendingCountryPlaceId = null;
  var pendingCountryName = null;

  var ResultCallback = function(doneCallback){
    this.callback = function(predictions, status){
      if (status == google.maps.places.PlacesServiceStatus.OK){
        predictions = predictions.filter(function(element, index, array){
          return element.types.indexOf('country') != -1;
        });
        var suggestions = predictions.map(function(prediction){
          return { value: prediction.description, data: prediction.place_id };
        });

        doneCallback({
          suggestions: suggestions
        });
      } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
        doneCallback({
          suggestions: []
        });
      } else {
        console.error(arguments);
        doneCallback({
          suggestions: []
        });
      }
    };
  };

  function link(scope, element, attrs, ngModelCtr){
    scope.name = scope.name || 'country';

    ngModelCtr.$render = function(){
      element.find('input').val(ngModelCtr.$viewValue);
    };

    placesService = new google.maps.places.PlacesService(element.children('.country-attr-container')[0]);

    function loadPlaceDetails(placeId){
      waitingPlaceDetails = true;
      expectingPlaceDetails = true;

      placesService.getDetails({ placeId: placeId }, function(result, status){
        waitingPlaceDetails = false;
        if (status == google.maps.places.PlacesServiceStatus.OK){
          if (expectingPlaceDetails){
            scope.country = result.address_components[0].short_name;
            scope.countryId = pendingCountryPlaceId;

            ngModelCtr.$setViewValue(pendingCountryName);

            pendingCountryName = null;
            pendingCountryPlaceId = null;
          }
        } else {
          console.error(arguments);
          //showMessage('Unable to process request. Please try again.');
        }
      });
    }

    var $input = $(element).children(':first');

    $input.on('blur', function(){
      if (scope.incomplete){
        ngModelCtr.$rollbackViewValue();
        //Stop wating for place details to cancel the pending update.
        expectingPlaceDetails = false;
      }
    });

    $input.autocomplete({
      minChars: 3,
      autoSelectFirst: true,
      lookup: function(query, done){
        var request = { input: query, types: ['(regions)'] };
        autocompleteService.getPlacePredictions(request, new ResultCallback(done).callback);
      },
      onSelect: function(suggestion){
        pendingCountryName = suggestion.value;
        pendingCountryPlaceId = suggestion.data;

        scope.incomplete = false;

        loadPlaceDetails(pendingCountryPlaceId);
      },
      onInvalidateSelection: function(){
        scope.incomplete = true;
      }
    });
  }

  return {
    restrict: 'E',
    require: 'ngModel',
    link: link,
    scope: {
      name: '=',
      country: '=',
      countryId: '='
    },
    templateUrl: 'templates/directives/country.html'
  };
}]);