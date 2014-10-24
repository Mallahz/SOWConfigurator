angular.module('SecCTRL', ['SectionSvc'])

.controller('SectionCtrl', function($scope, sectionsvc, $modal) {

	//section layout object
	function sectionLayout() {
		this.secId = '';
		this.secName = '';
		this.secXMLContent = '';
		this.secFileLoc = '';
	} 

	// ng-grid configuration ===========================
	// ng-Grid options
	$scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    
    $scope.pagingOptions = {
        pageSizes: [20, 50, 100],
        pageSize: 20,
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
                sectionsvc.get().success(function (largeLoad) {		
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                sectionsvc.get().success(function (largeLoad) {
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
        // width: 200,
        columnDefs: [
			{field: 'secId', displayName: 'Section Id', width: 100},
			{field: 'secName', displayName: 'Section Name', width: 350},
			{field: 'secFileLoc', displayName: 'File Location', width: 350},
			{displayName: 'Edit/Delete', cellTemplate: '<i title=Edit Layout" class="fa fa-pencil-square-o" ng-click="editlayout(row)" style="margin-right: 10px;"></i><i title=Delete Layout" ng-click="deleteRecord(row)" class="fa fa-trash-o" style="margin: 0 5 0 5;"</i>', width: 100}
		]
    };
    // End ng-grid config =====================================

    function refresh(){
    	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    // Edit modal
    $scope.editlayout = function(row) {
	    var modalInstance = $modal.open({
	    	templateUrl: 'views/sections/edit_sectionlayout.html',
	    	controller: 'EditSecLayout',
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
			templateUrl: 'views/sections/delete_sectionlayout.html',
			controller: 'DeleteSecLayout',
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
			templateUrl: 'views/sections/add_sectionlayout.html' ,
			controller: 'AddSecLayout',
			resolve: {
				items: function (){
					return new sectionLayout();
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
.controller('EditSecLayout', function EditSecController($scope, sectionsvc, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;
	$scope.data = {};

	$scope.ok = function () {
		$scope.data = angular.copy($scope.items);
		// console.log("scope.data.secId: " + scope.data.secId + ' $scope.data.secName: ' + $scope.data.secName + " $scope.data.secFileLoc: " + $scope.data.secFileLoc);
		sectionsvc.update($scope.id, $scope.data)
			.success(function(){
				$modalInstance.close();
				alert("Section Layout has been updated");	
			});
  	};

	$scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

// Controller for Deleting a SOW Layout
.controller('DeleteSecLayout', function DeleteSecController($scope, sectionsvc, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;
	$scope.Message = "Are you sure you want to remove layout " + $scope.items.secId + " ?"

	$scope.ok = function () {
		sectionsvc.delete($scope.id).success(function(){
			alert("Section Layout has been deleted");
			$modalInstance.close();
		});
	}

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
})

// Controller for Adding a Section Layout
.controller('AddSecLayout', function AddSecController($scope, sectionsvc, $modalInstance, items){
	$scope.items = items;
	$scope.data = {};

	$scope.ok = function () {
		$scope.data = angular.copy(items);
		sectionsvc.create($scope.data).success(function(){
			$modalInstance.close();
			alert("New Section Layout has been added");
		})
	};

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
});
