	angular.module('appRoutes', ['SecCTRL', 'vbCTRL', 'pmCTRL']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})

		//Section Layouts page that will use the SectionSvc controller
		.when('/sectionlayouts', {
			templateUrl: 'views/sections/home_sectionlayout.html',
			controller: 'SectionCtrl'
		})

		// Verbiage Block layouts
		.when('/vblayouts', {
			templateUrl: 'views/vblayouts/home_vblayout.html',
			controller: 'vbCtrl'	
		})

		//PM layouts
		.when('/pmlayouts', {
			templateUrl: 'views/pmlayouts/home_pmlayout.html',
			controller: 'pmCtrl'
		})

	$locationProvider.html5Mode(true);

}]);