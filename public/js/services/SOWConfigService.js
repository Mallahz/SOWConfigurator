angular.module('SOWLayoutSVC', []).factory('sowlayoutfactory', ['$http', function($http) {

	return {
		
	    test : function() {
	    	return "Okay, I'm testing.";
	    },

		// call to get all SOW layouts
		get : function() {
			return $http.get('/api/sowlayout');
		},

		// call to POST and create a new SOW layout
		create : function(data) {
			return $http.post('/api/sowlayout', data);
		},

		// get SOW Layout by layoutname
		getbyId : function(id) {
			return $http.get('/api/sowlayout/' + id);
		},

		// update SOW Layout
		update : function(id, data) {
			return $http.put('/api/sowlayout/' + id, data);
		},

		// call to DELETE a SOW Layout
		delete : function(id) {
			return $http.delete('/api/sowlayout/' + id);
		}
	}
	
}]);