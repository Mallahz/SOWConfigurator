angular.module('SectionSvc', []).factory('sectionsvc', ['$http', function($http) {

	return {
		
		// call to get all Verbiage Block layouts
		get : function() {
			return $http.get('/api/sectionlayout');
		},

		// call to POST and create a new Verbiage Block layout
		create : function(data) {
			return $http.post('/api/sectionlayout', data);
		},

		// get Verbiage Block Layout by layoutname
		getbyId : function(id) {
			return $http.get('/api/sectionlayout/' + id);
		},

		// update Verbiage Block Layout
		update : function(id, data) {
			return $http.put('/api/sectionlayout/' + id, data);
		},

		// call to DELETE a Verbiage Block Layout
		delete : function(id) {
			return $http.delete('/api/sectionlayout/' + id);
		}
	}
	
}]);