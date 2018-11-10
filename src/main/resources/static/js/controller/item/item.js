/**
 * Created by yingmeng on 2017/5/13 0013.
 */
var app = angular.module("myapp", ['ngTable']).controller("MyDairy",
    function($scope, $timeout, NgTableParams) {
    $scope.updateClock = function () {
        var date = new Date();
        $scope.clock = date.toLocaleDateString() + " " + date.toLocaleTimeString();
        $timeout(function () {
            $scope.updateClock();
        },999);
    };
    $scope.init = function () {
        $scope.hasAccount = false;
        $scope.editValue = {};
        $scope.queryName();
    }
    $scope.queryName = function () {
        $.ajax({
            type: 'post',
            url: '../ajax/querynames',
            data: {},
            dataType: "text",
            success: function (data) {
                $scope.names = JSON.parse(data).names;
                if ($scope.names.length == 0)
                {
                    $scope.selectedName = "add first";
                    return;
                }
                $scope.selectedName=$scope.names[0]
                $scope.hasAccount = true;
                $scope.queryAccountInfo();

            }
        });
    };
    $scope.preview = function () {
        $scope.savename = $scope.name;
        $scope.saveaccountname = "";
        $scope.savepassword = "";
        var keyLength = $scope.key.length;


        for (var i = 0; i < $scope.accountname.length; i++) {
            $scope.saveaccountname += String.fromCharCode($scope.accountname.charAt(i).charCodeAt() + parseInt($scope.key.charAt(i%keyLength)))
        }


        for (var i = 0; i < $scope.password.length; i++) {
            $scope.savepassword += String.fromCharCode($scope.password.charAt(i).charCodeAt() + parseInt($scope.key.charAt(i % keyLength)))
        }
    };
    $scope.decrypt = function (user)  {
        var tempAccountName = "";
        var temppassword = "";
        var keyLength = user.passkey.length;

        for (var i = 0; i < user.accountName.length; i++) {
            tempAccountName += String.fromCharCode(user.accountName.charAt(i).charCodeAt() - parseInt(user.passkey.charAt(i%keyLength)))
        }


        for (var i = 0; i < user.password.length; i++) {
            temppassword += String.fromCharCode(user.password.charAt(i).charCodeAt() - parseInt(user.passkey.charAt(i % keyLength)))
        }
        user.accountName = tempAccountName;
        user.password = temppassword;
        user.hasDecrypt = true;
    };
    $scope.cancel = function () {
        $scope.savename = "";
        $scope.saveaccountname = "";
        $scope.savepassword = "";
        $scope.name = "";
        $scope.accountname = "";
        $scope.password = "";
    };
    $scope.addAccount = function () {
        $.ajax({
            type: 'post',
            url: '../ajax/add',
            data: {
                "name": $scope.savename,
                "accountname": $scope.saveaccountname,
                "password": $scope.savepassword,
            },
            dataType: "text",
            success: function (data) {
                console.log(data)
                $scope.cancel();
                $scope.queryName();
            }
        });
    };
    $scope.queryAccountInfo = function () {
        if (!$scope.hasAccount)
        {
            return;
        }
        $scope.tableParams = new NgTableParams(
        {
            page: 1,      // show first page
            count: 10,      // count per page
        },
        {
            total: 0, // length of data
            getData: function($defer, params) {
                console.log("123");
                $.ajax({
                    type: 'post',
                    url: '../ajax/queryAccountInfo',
                    data: {
                        "name": $scope.selectedName,
                    },
                    dataType: "text",
                    success: function (data) {
                        console.log(data)
                        $scope.accountInfos = JSON.parse(data).names;
                    }
                });
            }
        });
    };
    $scope.updateAccount = function () {}
    $scope.updateClock();
    $scope.init();
});