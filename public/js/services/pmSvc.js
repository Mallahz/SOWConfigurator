angular.module('PMsvc', []).factory('pmsvc', ['$http', function($http) {

	return {
		
		// call to get all SOW layouts
		get : function() {
			return $http.get('/api/pmlayout');
		},

		// call to POST and create a new SOW layout
		create : function(data) {
			return $http.post('/api/pmlayout', data);
		},

		// get SOW Layout by layoutname
		getbyId : function(id) {
			return $http.get('/api/pmlayout/' + id);
		},

		// update SOW Layout
		update : function(id, data) {
			return $http.put('/api/pmlayout/' + id, data);
		},

		// call to DELETE a SOW Layout
		delete : function(id) {
			return $http.delete('/api/pmlayout/' + id);
		}
	}
	
}]);