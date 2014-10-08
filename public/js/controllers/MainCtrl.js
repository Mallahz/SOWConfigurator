angular.module('MainCtrl', [])

.controller('MainController', function($scope, sowlayoutfactory, $modal) {

	function SOWLayout(){
		this.layoutname = "";
		this.sections = "";
	}

	// ng-Grid options
	$scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    
    $scope.pagingOptions = {
        pageSizes: [20, 50, 100],
        pageSize: 100,
        totalServerItems: 0,
        currentPage: 1
    };  
    $scope.setPagingData = function(data, page, pageSize){	
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.pagingOptions.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                sowlayoutfactory.get().success(function (largeLoad) {		
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                sowlayoutfactory.get().success(function (largeLoad) {
                    $scope.setPagingData(largeLoad,page,pageSize);
                });
            }
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

       
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);
	
    $scope.gridOptions = {
        data: 'myData',
        enablePaging: true,
        enableSorting: true,
        showFooter: true,
        enableColumnResize: true,
        enableColumnReordering: true,
        enableRowSelection: true,
        resizable: true,
        multiSelect: false,
        totalServerItems:'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        width: 200,
        columnDefs: [
			{field: 'layoutname', displayName: 'Layout Name'},
			{field: 'sections', displayName: 'Sections'},
			{displayName: 'Edit/Delete', cellTemplate: '<i title=Edit Layout" class="fa fa-pencil-square-o" ng-click="editlayout(row)" style="margin-right: 10px;"></i><i title=Delete Layout" ng-click="deleteRecord(row)" class="fa fa-trash-o" style="margin: 0 5 0 5;"</i>'}
			//{displayName: 'Delete', cellTemplate}
		]
    };
// End ng-grid config =====================================

     function refresh(){
    	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    // Edit modal
    $scope.editlayout = function(row) {
	    var modalInstance = $modal.open({
	    	templateUrl: 'views/edit_sowlayout.html',
	    	controller: 'EditSOWLayout',
	    	resolve: {
	    		items: function () {
	    			return row.entity;
	    		}
	    	}
	    });

	 	//refresh ng-grid on success or cancellation of form
	 	modalInstance.result.then(
	 		function (){
	 			refresh();
			},
			function(){
				refresh();
			}
	 	);
	};

	// Delete
	$scope.deleteRecord = function(row){
		var modalInstance = $modal.open({
			templateUrl: 'views/delete_sowlayout.html',
			controller: 'DeleteSOWLayout',
			resolve: {
				items: function () {
					return row.entity;
				}
			}
		});

		//refresh ng-grid on success or cancellation of form
	 	modalInstance.result.then(
	 		function (){
	 			refresh();
			},
			function(){
				refresh();
			}
	 	);
	}

	//Add Layout
	$scope.addLayout = function(){
		var modalInstance = $modal.open({
			templateUrl: 'views/add_sowlayout.html' ,
			controller: 'AddSOWLayout',
			resolve: {
				items: function (){
					return new SOWLayout();
				}
			}
		});

		//refresh ng-grid on success or cancellation of form
	 	modalInstance.result.then(
	 		function (){
	 			refresh();
			},
			function(){
				refresh();
			}
	 	);
	}
})

// Controller for Editing a SOW Layout
.controller('EditSOWLayout', function EditSOWController($scope, sowlayoutfactory, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;

	$scope.ok = function () {
		$scope.data = {"sections": $scope.items.sections, "layoutname": $scope.items.layoutname}
		console.log("scope.data.sections: " + $scope.data.sections + " layoutname: " + $scope.data.layoutname);
		sowlayoutfactory.update($scope.id, $scope.data)
		//sowlayoutfactory.update('Z', {"sections": '1,2,3,4,5'})
			.success(function(){
				$modalInstance.close();
				alert("New SOW Layout has been updated");	
			});
  	};

	$scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

// Controller for Deleting a SOW Layout
.controller('DeleteSOWLayout', function DeleteSOWController($scope, sowlayoutfactory, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;
	$scope.Message = "Are you sure you want to remove layout " + $scope.items.layoutname + " ?"

	$scope.ok = function () {
		sowlayoutfactory.delete($scope.id).success(function(){
			alert("SOW Layout has been deleted");
			$modalInstance.close();
		});
	}

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
})

// Controller for Adding a SOW Layout
.controller('AddSOWLayout', function AddSOWController($scope, sowlayoutfactory, $modalInstance, items){
	$scope.items = items;
	$scope.master = {};

	$scope.ok = function () {
		$scope.master = angular.copy(items);
		sowlayoutfactory.create($scope.master).success(function(){
			$modalInstance.close();
			alert("New SOW Layout has been added");
		})
	};

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
});
