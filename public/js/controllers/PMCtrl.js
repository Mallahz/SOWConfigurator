angular.module('pmCTRL', ['PMsvc'])

.controller('pmCtrl', function($scope, pmsvc, $modal) {

	//section layout object
	function pmLayout() {
		this.name = '';
		this.pmxml = '';
		this.pmFileLoc = '';
	} 

	// ng-grid configuration ===========================
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
                pmsvc.get().success(function (largeLoad) {		
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                pmsvc.get().success(function (largeLoad) {
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
			{field: 'name', displayName: 'Verbiage Block Name'},
			{field: 'pmFileLoc', displayName: 'File Location'},
			{displayName: 'Edit/Delete', cellTemplate: '<i title=Edit Layout" class="fa fa-pencil-square-o" ng-click="editlayout(row)" style="margin-right: 10px;"></i><i title=Delete Layout" ng-click="deleteRecord(row)" class="fa fa-trash-o" style="margin: 0 5 0 5;"</i>'}
		]
    };
    // End ng-grid config =====================================

    // Edit modal
    $scope.editlayout = function(row) {
	    var modalInstance = $modal.open({
	    	templateUrl: 'views/pmlayouts/edit_pmlayout.html',
	    	controller: 'EditpmLayout',
	    	resolve: {
	    		items: function () {
	    			return row.entity;
	    		}
	    	}
	    });

	 	modalInstance.result.then(
	 		function (){
	 			$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
			}
	 	);
	};

	// Delete
	$scope.deleteRecord = function(row){
		var modalInstance = $modal.open({
			templateUrl: 'views/pmlayouts/delete_pmlayout.html',
			controller: 'DeletepmLayout',
			resolve: {
				items: function () {
					return row.entity;
				}
			}
		});

		modalInstance.result.then(
	 		function (){
				$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);	
			}
		);
	}

	//Add Layout
	$scope.addLayout = function(){
		var modalInstance = $modal.open({
			templateUrl: 'views/pmlayouts/add_pmlayout.html',
			controller: 'AddpmLayout',
			resolve: {
				items: function (){
					return new pmLayout();
				}
			}
		});

		modalInstance.result.then(
			function(){
				$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
			}
		);
	}
})

// Controller for Editing a pm Layout
.controller('EditpmLayout', function EditSecController($scope, pmsvc, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;
	$scope.data = {};

	$scope.ok = function () {
		$scope.data = angular.copy($scope.items);
		console.log("$scope.data.pmname: " + $scope.data.name + " $scope.data.pmFileLoc: " + $scope.data.pmFileLoc);
		pmsvc.update($scope.id, $scope.data)
			.success(function(){
				$modalInstance.close();
				alert("Project Management Layout has been updated");	
			});
  	};

	$scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

// Controller for Deleting a pm Layout
.controller('DeletepmLayout', function DeleteSecController($scope, pmsvc, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;
	$scope.Message = "Are you sure you want to remove layout " + $scope.items.pmId + " ?"

	$scope.ok = function () {
		pmsvc.delete($scope.id).success(function(){
			alert("Project Management Layout has been deleted");
			$modalInstance.close();
		});
	}

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
})

// Controller for Adding a pm Layout
.controller('AddpmLayout', function AddSecController($scope, pmsvc, $modalInstance, items){
	$scope.items = items;
	$scope.data = {};

	$scope.ok = function () {
		$scope.data = angular.copy(items);
		console.log("$scope.data.pmname: " + $scope.data.name + " $scope.data.pmFileLoc: " + $scope.data.pmFileLoc);
		pmsvc.create($scope.data).success(function(){
			$modalInstance.close();
			alert("New Project Management Layout has been added");
		})
	};

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
});