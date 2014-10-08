angular.module('VBsvc', []).factory('vbsvc', ['$http', function($http) {

	return {
		
		// call to get all SOW layouts
		get : function() {
			return $http.get('/api/vblayout');
		},

		// call to POST and create a new SOW layout
		create : function(data) {
			return $http.post('/api/vblayout', data);
		},

		// get SOW Layout by layoutname
		getbyId : function(id) {
			return $http.get('/api/vblayout/' + id);
		},

		// update SOW Layout
		update : function(id, data) {
			return $http.put('/api/vblayout/' + id, data);
		},

		// call to DELETE a SOW Layout
		delete : function(id) {
			return $http.delete('/api/vblayout/' + id);
		}
	}
	
}]);