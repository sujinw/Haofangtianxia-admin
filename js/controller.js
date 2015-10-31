//登录
var login = angular.module('loginModule', []);
login.controller('loginCtrl', function($scope, $cookieStore, $http){
	$scope.login = function(){
		if($scope.username && $scope.psw){
			var data = {
				'name': $scope.username,
				'psw': $scope.psw
			}
			$http.post('/haofangtianxia-server/index.php/admin/login', $.param(data),{
				'headers': {
						'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(response){
				if(response.meta.code == '200'){
					$cookieStore.put('LOGINFLAG', 1);
					location.href = "index.html";
				} else {
					$.teninedialog({
		                title: '<h3 style="font-weight:bold">系统提示</h3>',
		                content: response.meta.description
		            });
				}
			})
		} else {
			$.teninedialog({
				title: '<h3 style="font-weight:bold">系统提示</h3>',
		        content: "请输入账号或密码"
			})
		}
	}
	
})

var head = angular.module('headModule', []);
head.controller('headCtrl', function($scope, $cookieStore){
	if($cookieStore.get('LOGINFLAG') != '1'){
		$.teninedialog({
			title: '<h3 style="font-weight:bold">系统提示</h3>',
			content: '请先登录！',
			dialogShown: function() {
				setTimeout(function() {
					location.href = 'login.html';
				}, 200)
			}
		});
	}
	$scope.logout = function(){
		$cookieStore.remove('LOGINFLAG');
		location.href = 'login.html';
		/*$.teninedialog({
	        title: '<h3 style="font-weight:bold">系统提示</h3>',
	        content: '退出 ?',
	        showCloseButton: true,
	        otherButtons: ["确定"],
	        otherButtonStyles: ['btn-primary'],
	        bootstrapModalOption: {
	            keyboard: true
	        },
	        //index是按钮组的下标，从0开始
	        //sender是选中按钮的对象
	        //modal 是当前对话框对象
	        clickButton: function(sender, modal, index) {
	            $cookieStore.remove("LOGINFLAG");
	            console.log($cookieStore.get('LOGINFLAG'));
	            $(this).closeDialog(modal);
	            location.href = 'login.html';
	        }
	    });*/
	}
})

var userlist = angular.module('userlistModule', []);
userlist.controller('userlistCtrl', function($scope, $http){
	$http.get('/haofangtianxia-server/index.php/admin/userlist?page_no=1&page_size=8&c=1')
		.success(function(response){
			if(response.meta.code == '200'){
				$scope.list = response.data.list;
				$('#page').bootstrapPaginator({
					currentPage: 1,    
			        size:"normal",    
			        totalPages: response.data.c,
			        bootstrapMajorVersion: 3,     
			        numberOfPages:response.data.count,
			        onPageClicked: function(e,originalEvent,type,page){
			        	$http.get('/haofangtianxia-server/index.php/admin/userlist?page_size=8&page_no='+page)     //'file:///C:/Users/z/Desktop/testcode/brand/data/test.json'
			        		.success(function(response){
			        			$scope.list = response.data.list;
			        		})
			        }
				})	
			} else {
				$.teninedialog({
					title: '<h3 style="font-weight:bold">系统提示</h3>',
			        content: "网络故障"
				})
			}
		})
	$scope.chkrec = function(phone){
		console.log(phone);
		var data = {
			'phone': phone
		}
		$http.post('/haofangtianxia-server/index.php/admin/reclist', $.param(data), {
			'headers':{
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}).success(function(response){
			if(response.meta.code == '200'){
				$scope.rec_list = response.data.list;
				$('#myModal').modal('toggle');
			} else {
				$.teninedialog({
					title: '<h3 style="font-weight:bold">系统提示</h3>',
			        content: "网络故障"
				})
			}
		})
	}
	$scope.chgrectype = {
		'1': '微信',
		'2': 'PC'
	}
})

var carousel = angular.module('carouselModule', []);
carousel.factory('fileReader', ["$q", "$log", function($q, $log){
    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };

    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };

    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        return reader;
    };

    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);         
        reader.readAsDataURL(file);
        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL  
    };
}]);

carousel.directive('upImage', ['$http', function ($http) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.bind('change', function(event){
				var id = $attrs.id;
                var fileobj = (event.srcElement || event.target).files[0];
                var ext = fileobj.name.split('.').pop();
                if(ext.toLowerCase() == 'jpg'){
                	console.log(event.srcElement);
	                console.log(event.target);
	                console.log(ext);
	                console.log(fileobj.name);
	                var form = new FormData();
	                form.append('img', fileobj);
	                $http.post('/haofangtianxia-server/index.php/admin/carouselimg?&s=s'+id, form, {
	                	headers:{
	                		"Content-Type": undefined
	                	},
	                	transformRequest: angular.identity
	                }).success(function(response){
	                	if(response.meta.code == '200'){
		                	$scope.getImg(id, fileobj);		     
		                	$.teninedialog({
								title: '<h3 style="font-weight:bold">系统提示</h3>',
						        content: "上传成功"
							})
		                }
	                })
                } else {
                	$.teninedialog({
						title: '<h3 style="font-weight:bold">系统提示</h3>',
				        content: "请上传jpg文件"
					})
                }
                
            });
        }
    };
}]);
carousel.controller('carouselCtrl', function($scope, $http, fileReader){
	$scope.imgpre = [];
	$scope.getImg = function (id, fileobj) {
	    fileReader.readAsDataUrl(fileobj, $scope)
	                  .then(function(result) {
	                  	$scope.imgpre[id] = result;
	                  });
	};
})

var houselist = angular.module('houselistModule', []);

houselist.directive('swRec',['$http', function($http){
	return {
		restrict: 'A',
		link: function($scope, $element, $attrs){
			var id = $attrs.id;
			$element.bootstrapSwitch({
				state: $attrs.check=='true',
				onText: "是",
				offText: "否",
				labelText: "推荐",
				onSwitchChange: function(event, state){
					if(state){
						var id = {
							'id': $attrs.id
						}
						$http.post('/haofangtianxia-server/index.php/admin/addrechouse', $.param(id),{
							'headers':{
								'Content-Type': 'application/x-www-form-urlencoded'
							}
						}).success(function(response){
							if(response.meta.code == '401'){
								console.log('teninedialog');
								$.teninedialog({
									title: '<h3 style="font-weight:bold">系统提示</h3>',
									content: '推荐信息已达到最大限制',
									dialogShown: function() {
										setTimeout(function() {
											location.reload();
										}, 200)
									}
								});
							}
						})
					} else {
						var id = {
							'id': $attrs.id
						}
						$http.post('/haofangtianxia-server/index.php/admin/delrechouse', $.param(id),{
							'headers':{
								'Content-Type': 'application/x-www-form-urlencoded'
							}
						}).success(function(response){
							if(response.meta.code != '200'){
								console.log('teninedialog');
								$.teninedialog({
									title: '<h3 style="font-weight:bold">系统提示</h3>',
									content: '网络故障',
									dialogShown: function() {
										setTimeout(function() {
											location.reload();
										}, 200)
									}
								});
							}
						})
					}
				}
			});
		}
	}
}])

houselist.controller('houselistCtrl', function($scope, $http, $state, $stateParams){
	$http.get('/haofangtianxia-server/index.php/admin/houselist?page_no=1&page_size=8&c=1')
		.success(function(response){
			if(response.meta.code == '200'){
				$scope.recnum = response.data.recnum;
				$scope.list = response.data.list;
				$('#page').bootstrapPaginator({
					currentPage: 1,    
			        size:"normal",    
			        totalPages: response.data.c,
			        bootstrapMajorVersion: 3,     
			        numberOfPages:response.data.count,
			        onPageClicked: function(e,originalEvent,type,page){
			        	$http.get('/haofangtianxia-server/index.php/admin/houselist?page_size=8&page_no='+page)     //'file:///C:/Users/z/Desktop/testcode/brand/data/test.json'
			        		.success(function(response){
			        			$scope.list = response.data.list;
			        		})
			        }
				})	
			} else {
				$.teninedialog({
					title: '<h3 style="font-weight:bold">系统提示</h3>',
			        content: "网络故障"
				})
			}
		})
	$scope.chkinfo = function(id){
		$state.go('houseinfo', {"id": id});
	}
})

var houseinfo = angular.module('houseinfoModule',[]);

houseinfo.factory('fileReader', ["$q", "$log", function($q, $log){
    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };

    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };

    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        return reader;
    };

    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);         
        reader.readAsDataURL(file);
        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL  
    };
}]);

houseinfo.directive('houseImage', ['$http', function ($http) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.bind('change', function(event){
				var id = $attrs.id;
                var fileobj = (event.srcElement || event.target).files[0];
                var ext = fileobj.name.split('.').pop();
                var tmp = id.split('.');
                var albumid = tmp[0];
                var houseid = tmp[1];
                var albumtype = tmp[2];
                var albid = parseInt(albumtype) - 1;
                if((ext.toLowerCase() == 'jpg') || (ext.toLowerCase() == 'png')){
	                var form = new FormData();
	                form.append('img', fileobj);
	                if(albumid == '-1'){      //增加的图片
	                	$http.post('/haofangtianxia-server/index.php/admin/houseimg?&houseid='+houseid+'&type='+albumtype, form, {
		                	headers:{
		                		"Content-Type": undefined
		                	},
		                	transformRequest: angular.identity
		                }).success(function(response){
		                	if(response.meta.code == '200'){
		                		var len = $scope.album[albid].length;
		                		$scope.album[albid][len-1].HouseAlbumID = response.data;
			                	$scope.getImg(response.data, fileobj);		     
			                	$.teninedialog({
									title: '<h3 style="font-weight:bold">系统提示</h3>',
							        content: "上传成功"
								})
			                }
		                })
	                } else {   //进行修改的图片
	                	$http.post('/haofangtianxia-server/index.php/admin/houseimg?&albumid='+albumid, form, {
		                	headers:{
		                		"Content-Type": undefined
		                	},
		                	transformRequest: angular.identity
		                }).success(function(response){
		                	if(response.meta.code == '200'){
			                	$scope.getImg(albumid, fileobj);		     
			                	$.teninedialog({
									title: '<h3 style="font-weight:bold">系统提示</h3>',
							        content: "上传成功"
								})
			                }
		                })
	                }	                
                } else {
                	$.teninedialog({
						title: '<h3 style="font-weight:bold">系统提示</h3>',
				        content: "请上传jpg或png文件"
					})
                }
            });
        }
    };
}]);

houseinfo.controller('houseinfoCtrl', function($scope, $state, $http, $stateParams, fileReader){
	var data = {
		'house_id': $stateParams.id
	}
	$scope.imgpre = [];
	$scope.houseid = $stateParams.id;
	$scope.act = 1;
	$http.post('/haofangtianxia-server/index.php/admin/detailinfo', $.param(data),{
		'headers':{
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	}).success(function(response){
		if(response.meta.code == '200'){
			var tmp = JSON.stringify(response.data.houseinfo);
			$scope.info = $.parseJSON(tmp);
			tmp = JSON.stringify(response.data.album);
			$scope.album = $.parseJSON(tmp);
			if($scope.info.activity.Deadline == null){
				$scope.act = 0;
			}
		}
	})
	$scope.getImg = function (id, fileobj) {
	    fileReader.readAsDataUrl(fileobj, $scope)
	                  .then(function(result) {
	                  	$scope.imgpre[id] = result;
	                  });
	};
	//   ***subinfo***
	$scope.subinfo = function(){

		if($scope.info.activity.PreferentialRemark && $scope.info.activity.Deadline){
			if($scope.act == 0){
				$scope.info.activity.status = '2';   //活动新增
				$http.post('/haofangtianxia-server/index.php/admin/modifyinfo', $scope.info)
					.success(function(response){
						if(response.meta.code == '200'){
							$.teninedialog({
								title: '<h3 style="font-weight:bold">系统提示</h3>',
								content: '修改成功',
								dialogShown: function() {
									setTimeout(function() {
										location.reload();
									}, 200)
								}
							});
						}
					})
			} else {
				$scope.info.activity.status = '1';   //在原有活动信息进行更改
				$http.post('/haofangtianxia-server/index.php/admin/modifyinfo', $scope.info)
					.success(function(response){
						if(response.meta.code == '200'){
							$.teninedialog({
								title: '<h3 style="font-weight:bold">系统提示</h3>',
								content: '修改成功',
								dialogShown: function() {
									setTimeout(function() {
										location.reload();
									}, 200)
								}
							});
						}
					})
			}
		} else if(!$scope.info.activity.PreferentialRemark && !$scope.info.activity.Deadline){
			if($scope.act == 1){
				$scope.info.activity.status = '-1';  //删除一个活动信息
				$http.post('/haofangtianxia-server/index.php/admin/modifyinfo', $scope.info)
					.success(function(response){
						if(response.meta.code == '200'){
							$.teninedialog({
								title: '<h3 style="font-weight:bold">系统提示</h3>',
								content: '修改成功',
								dialogShown: function() {
									setTimeout(function() {
										location.reload();
									}, 200)
								}
							});
						}
					})
			} else {
				$scope.info.activity.status = '0';   //原来就没有 不操作
				$http.post('/haofangtianxia-server/index.php/admin/modifyinfo', $scope.info)
					.success(function(response){
						if(response.meta.code == '200'){
							$.teninedialog({
								title: '<h3 style="font-weight:bold">系统提示</h3>',
								content: '修改成功',
								dialogShown: function() {
									setTimeout(function() {
										location.reload();
									}, 200)
								}
							});
						}
					})
			}
		} else {
			$.teninedialog({
				title: '<h3 style="font-weight:bold">系统提示</h3>',
		        content: "活动填写请同时添加截止日期和活动信息"
			})

		}
	}
	//   ***/subinfo***

	$scope.addimg = function(type){
		var len = $scope.album[type].length;
		var tmp = {
			'HouseAlbumID': '-1',
			'PictureAddr': ''
		}
		if (len == 0){
			$scope.album[type].push(tmp);
		} else {
			if($scope.album[type][len-1]['HouseAlbumID'] == '-1'){
				$.teninedialog({
		            title: '<h3 style="font-weight:bold">系统提示</h3>',
		            content: '上一张请上传图片'
		        });
			} else {
				$scope.album[type].push(tmp);
			}
		}
	}
})

var houseadd = angular.module('houseaddModule',[]);

houseadd.factory('fileReader', ["$q", "$log", function($q, $log){
    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };

    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };

    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        return reader;
    };

    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);         
        reader.readAsDataURL(file);
        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL  
    };
}]);

houseadd.directive('addImage', ['$http', function ($http) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            $element.bind('change', function(event){
				var id = $attrs.id;
                var fileobj = (event.srcElement || event.target).files[0];
                var ext = fileobj.name.split('.').pop();
                var tmp = id.split('.');
                var albumid = tmp[0];
                var houseid = tmp[1];
                var albumtype = tmp[2];
                var albid = parseInt(albumtype) - 1;
                if((ext.toLowerCase() == 'jpg') || (ext.toLowerCase() == 'png')){
	                var form = new FormData();
	                form.append('img', fileobj);
	                if(albumid == '-1'){      //增加的图片
	                	$http.post('/haofangtianxia-server/index.php/admin/houseimg?&houseid='+houseid+'&type='+albumtype, form, {
		                	headers:{
		                		"Content-Type": undefined
		                	},
		                	transformRequest: angular.identity
		                }).success(function(response){
		                	if(response.meta.code == '200'){
		                		var len = $scope.album[albid].length;
		                		$scope.album[albid][len-1].HouseAlbumID = response.data;
			                	$scope.getImg(response.data, fileobj);		     
			                	$.teninedialog({
									title: '<h3 style="font-weight:bold">系统提示</h3>',
							        content: "上传成功"
								})
			                }
		                })
	                } else {   //进行修改的图片
	                	$http.post('/haofangtianxia-server/index.php/admin/houseimg?&albumid='+albumid, form, {
		                	headers:{
		                		"Content-Type": undefined
		                	},
		                	transformRequest: angular.identity
		                }).success(function(response){
		                	if(response.meta.code == '200'){
			                	$scope.getImg(albumid, fileobj);		     
			                	$.teninedialog({
									title: '<h3 style="font-weight:bold">系统提示</h3>',
							        content: "上传成功"
								})
			                }
		                })
	                }	                
                } else {
                	$.teninedialog({
						title: '<h3 style="font-weight:bold">系统提示</h3>',
				        content: "请上传jpg或png文件"
					})
                }
            });
        }
    };
}]);

houseadd.controller('houseaddCtrl', function($scope, $state, $http, fileReader){
	$scope.imgpre = [];
	$scope.album = [[], [], [], [],[]];
	$scope.info = {};
	$scope.info.activity = {};
	$scope.getImg = function (id, fileobj) {
	    fileReader.readAsDataUrl(fileobj, $scope)
	                  .then(function(result) {
	                  	$scope.imgpre[id] = result;
	                  });
	};
	//   ***subinfo***
	$scope.subinfo = function(){
		if($scope.houseid){
			$.teninedialog({
	            title: '<h3 style="font-weight:bold">系统提示</h3>',
	            content: '已经添加过信息，请在楼盘列表进行修改'
	        });
		} else {
			if($scope.info.activity.PreferentialRemark && $scope.info.activity.Deadline){
				$scope.info.activity.status = '2';  											 //新建楼盘有优惠活动
				$http.post('/haofangtianxia-server/index.php/admin/addhouse', $scope.info)
					.success(function(response){
						if(response.meta.code == '200'){
							$scope.houseid = response.data;
							$.teninedialog({
								title: '<h3 style="font-weight:bold">系统提示</h3>',
								content: '修改成功'
							});
						}
					})
				 
			} else if(!$scope.info.activity.PreferentialRemark && !$scope.info.activity.Deadline){
				$scope.info.activity.status = '0';  											 //新建楼盘没有优惠活动
				$http.post('/haofangtianxia-server/index.php/admin/addhouse', $scope.info)
					.success(function(response){
						if(response.meta.code == '200'){
							$scope.houseid = response.data;
							$.teninedialog({
								title: '<h3 style="font-weight:bold">系统提示</h3>',
								content: '修改成功'
							});
						}
					})
				
			} else {
				$.teninedialog({
					title: '<h3 style="font-weight:bold">系统提示</h3>',
			        content: "活动填写请同时添加截止日期和活动信息"
				})

			}
		}
		
	}
	//   ***/subinfo***

	$scope.addimg = function(type){
		if($scope.houseid){
			var len = $scope.album[type].length;
			var tmp = {
				'HouseAlbumID': '-1',
				'PictureAddr': ''
			}
			if (len == 0){
				$scope.album[type].push(tmp);
			} else {
				if($scope.album[type][len-1]['HouseAlbumID'] == '-1'){
					$.teninedialog({
			            title: '<h3 style="font-weight:bold">系统提示</h3>',
			            content: '上一张请上传图片'
			        });
				} else {
					$scope.album[type].push(tmp);
				}
			}
		} else {
			$.teninedialog({
	            title: '<h3 style="font-weight:bold">系统提示</h3>',
	            content: '请先保存基本信息'
	        });
		}
		
	}
})

var orderlist = angular.module('orderlistModule', []);

orderlist.directive('optSub', ['$http', function($http){
	return{
		restrict: 'A',
		link: function($scope, $element, $attrs){
			var buyerid = $attrs.id.split('_')[1];
			var status = $attrs.value;
			var id = $attrs.id.split('_')[2];
			$element.bind('click', function(event){
				$scope.$apply(function(){
					var data = {
						'id': buyerid,
						'status': status
					}
					$scope.list[id].Status = status;
					$http.post('/haofangtianxia-server/index.php/admin/orderstatus', $.param(data), {
						'headers':{
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					}).success(function(response){
						if(response.meta.code != '200'){
							$.teninedialog({
					            title: '<h3 style="font-weight:bold">系统提示</h3>',
					            content: '网络故障'
					        });
						}
					})
				})
			})
		}
	}
}])

orderlist.controller('orderlistCtrl', function($http, $scope){
	$http.get('/haofangtianxia-server/index.php/admin/orderlist?page_no=1&page_size=8&c=1')
		.success(function(response){
			if(response.meta.code == '200'){
				$scope.list = response.data.list;
				$('#page').bootstrapPaginator({
					currentPage: 1,    
			        size:"normal",    
			        totalPages: response.data.c,
			        bootstrapMajorVersion: 3,     
			        numberOfPages:response.data.count,
			        onPageClicked: function(e,originalEvent,type,page){
			        	$http.get('/haofangtianxia-server/index.php/admin/orderlist?page_size=8&page_no='+page)     //'file:///C:/Users/z/Desktop/testcode/brand/data/test.json'
			        		.success(function(response){
			        			$scope.list = response.data.list;
			        		})
			        }
				})	
			} else {
				$.teninedialog({
					title: '<h3 style="font-weight:bold">系统提示</h3>',
			        content: "网络故障"
				})
			}
		})
})