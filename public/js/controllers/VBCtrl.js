angular.module('vbCTRL', ['VBsvc'])

.controller('vbCtrl', function($scope, vbsvc, $modal) {

	//section layout object
	function vbLayout() {
		this.vbId = '';
		this.name = '';
		this.vbxml = '';
		this.vbFileLoc = '';
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
                vbsvc.get().success(function (largeLoad) {		
                    data = largeLoad.filter(function(item) {
                        return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                    });
                    $scope.setPagingData(data,page,pageSize);
                });            
            } else {
                vbsvc.get().success(function (largeLoad) {
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
			{field: 'vbId', displayName: 'Verbiage Block Id', width: 150},
			{field: 'name', displayName: 'Verbiage Block Name', width: 300},
			{field: 'bindingname', displayname: 'Binding Name', width: 300},
			{field: 'vbFileLoc', displayName: 'File Location'},
			{displayName: 'Edit/Delete', cellTemplate: '<i title=Edit Layout" class="fa fa-pencil-square-o" ng-click="editlayout(row)" style="margin-right: 10px;"></i><i title=Delete Layout" ng-click="deleteRecord(row)" class="fa fa-trash-o" style="margin: 0 5 0 5;"</i>'}
		]
    };
    // End ng-grid config =====================================

    function refresh(){
    	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    // Edit modal
    $scope.editlayout = function(row) {
	    var modalInstance = $modal.open({
	    	templateUrl: 'views/vblayouts/edit_vblayout.html',
	    	controller: 'EditvbLayout',
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
			templateUrl: 'views/vblayouts/delete_vblayout.html',
			controller: 'DeletevbLayout',
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
			templateUrl: 'views/vblayouts/add_vblayout.html',
			controller: 'AddvbLayout',
			resolve: {
				items: function (){
					return new vbLayout();
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

// Controller for Editing a VB Layout
.controller('EditvbLayout', function EditSecController($scope, vbsvc, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;
	$scope.data = {};

	$scope.ok = function () {
		event.preventDefault();
		$scope.data = angular.copy($scope.items);
		console.log("scope.data.vbId: " + $scope.data.vbId + ' $scope.data.vbname: ' + $scope.data.name + " $scope.data.vbFileLoc: " + $scope.data.vbFileLoc + " bindingname: " + $scope.data.bindingname);
		vbsvc.update($scope.id, $scope.data)
			.success(function(){
				$modalInstance.close();
				alert("Verbiage Block Layout has been updated");	
			});
  	};

	$scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

// Controller for Deleting a VB Layout
.controller('DeletevbLayout', function DeleteSecController($scope, vbsvc, $modalInstance, items){
	$scope.items = items;
	$scope.id = $scope.items._id;
	$scope.Message = "Are you sure you want to remove layout " + $scope.items.vbId + " ?"

	$scope.ok = function () {
		vbsvc.delete($scope.id).success(function(){
			alert("Verbiage Block Layout has been deleted");
			$modalInstance.close();
		});
	}

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
})

// Controller for Adding a VB Layout
.controller('AddvbLayout', function AddSecController($scope, vbsvc, $modalInstance, items){
	$scope.items = items;
	$scope.data = {};

	$scope.ok = function () {
		$scope.data = angular.copy(items);
		//console.log("id: " + $scope.data.secId + " name: " + $scope.data.secName + " fileloc: " + $scope.data.secFileLoc);
		vbsvc.create($scope.data).success(function(){
			$modalInstance.close();
			alert("New Verbiage Block Layout has been added");
		})
	};

	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
	};
});