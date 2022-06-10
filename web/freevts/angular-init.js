var freevtsApp = angular.module('freevts',
  ['ui.router', 'ui.bootstrap', 'nsPopover', 'pascalprecht.translate', 'ngAnimate', 'toastr', 'angular-jwt']);

freevtsApp.config(
  function($stateProvider, $urlRouterProvider, $translateProvider, $rootScopeProvider){

    $urlRouterProvider.otherwise(function($injector, $location){
      //console.log('otherwise');
      return '/map';
    });

    $stateProvider
      .state('base', {
        url: '',
        template: '<div ui-view></div>',
        onEnter: ['$state', '$rootScope', 'auth', 'session',
          function($state, $rootScope, auth, session){
            //console.log('base');
            if (!session.getToken()){
              auth.initSession().then(function(loggedIn){
                if (loggedIn){
                  $rootScope.$broadcast('init');
                  $state.go('map');
                } else {
                  auth.redirectToLogin();
                }
              });
            }
          }]
      })
      .state('map', {
        url: '/map',
        parent: 'base',
        //onEnter: function(){
        //  console.log('map');
        //},
        templateUrl: 'templates/map.html',
        controller: 'MainCtrl as main'
      })
      .state('signup', {
        url: '/signup',
        parent: 'base',
        templateUrl: 'templates/signup.html',
        controller: 'SignupCtrl'
      })
      .state('confirm', {
        url: '/confirm/{email}',
        parent: 'base',
        templateUrl: 'templates/confirm.html',
        controller: 'ConfirmCtrl'
      })
      .state('confirmemail', {
        url: "/confirmemail/:authcode",
        parent: 'base',
        controller: 'ConfirmEmail'
      });

    $translateProvider.useStaticFilesLoader({
      prefix: 'languages/',
      suffix: '.json'
    });

// Use English as default language
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');
  }
);
freevtsApp.run(['$state', '$rootScope', 'auth', 'session',
  function($state, $rootScope, auth, session){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      //console.log('$stateChangeStart', toState.name);
      if (toState.name == 'base')
        return;

      if (!session.getToken()){
        event.preventDefault();
        $state.go('base');
      }
    });
  }]);