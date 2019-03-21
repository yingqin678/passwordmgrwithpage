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
        $scope.commonkey = "";
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
        $scope.saveaccountname = $scope.accountname;
        $scope.savepassword = "";
        $scope.savepassword = $scope.encrypt($scope.password, $scope.key);
    };
    $scope.decrypt = function (user)  {
        var keyDecrypt = user.passkey;
        if ($scope.commonkey != undefined && $scope.commonkey != "")
        {
            keyDecrypt = $scope.commonkey;
        }

        user.password = $scope.decryptAlgor(user.password, keyDecrypt);
        user.hasDecrypt = true;
    };
    $scope.editPassword = function (user) {
        user.editPasskey = user.password;
        user.edit = true;
    };
    $scope.update = function (user) {
        var password = "";
        var key = $scope.commonkey;
        if (user.passkey != undefined && user.passkey != "")
        {
            key = user.passkey;
        }
        var keyLength = key.length;

        password = $scope.encrypt(user.editPasskey, key);
        $.ajax({
            type: 'post',
            url: '../ajax/updateAccountInfo',
            data: {
                "id":user.id,
                "name": user.name,
                "accountName": user.accountName,
                "password": password,
            },
            dataType: "text",
            success: function (data) {
                console.log(data)
                $scope.tableParams.reload();
            }
        });
    };
    $scope.encrypt = function (originalpass, key) {
        var keyLength = key.length;
        var savepassword = "";


        //计算密文   0：密文为原始字符   1：密文为原始字符+密钥字符后的结果  2：密文为原始字符-密钥字符后的结果   3：密文为密钥字符-原始字符后的结果
        for (var i = 0; i < originalpass.length; i++) {
            if (originalpass.charAt(i).charCodeAt() + parseInt(key.charAt(i % keyLength)) > 31 &&
            originalpass.charAt(i).charCodeAt() + parseInt(key.charAt(i % keyLength)) < 127)
            {
                savepassword += '1';
                savepassword += String.fromCharCode(originalpass.charAt(i).charCodeAt() + parseInt(key.charAt(i % keyLength)));
            } else if (originalpass.charAt(i).charCodeAt() - parseInt(key.charAt(i % keyLength)) > 31&&
                   originalpass.charAt(i).charCodeAt() - parseInt(key.charAt(i % keyLength)) < 127){
                savepassword += '2';
                savepassword += String.fromCharCode(originalpass.charAt(i).charCodeAt() - parseInt(key.charAt(i % keyLength)));
            } else if (parseInt(key.charAt(i % keyLength)) - originalpass.charAt(i).charCodeAt() > 31&&
                   parseInt(key.charAt(i % keyLength)) - originalpass.charAt(i).charCodeAt() < 127){
                savepassword += '3';
                savepassword += parseInt(key.charAt(i % keyLength)) - String.fromCharCode(originalpass.charAt(i).charCodeAt());
            } else {
                savepassword += '0';
                savepassword += String.fromCharCode(originalpass.charAt(i).charCodeAt());
            }
        }

        return savepassword;
    };
    $scope.decryptAlgor = function (encryptpass, key) {
        var temppassword = "";

        var keyIndex = 0;
        var keyLength = key.length;
        for (var i = 0; i < encryptpass.length; i++) {
            var encryptType = encryptpass.charAt(i);
            switch (encryptType) {
                //0：密文为原始字符   1：密文为原始字符+密钥字符后的结果  2：密文为原始字符-密钥字符后的结果   3：密文为密钥字符-原始字符后的结果
                case '0' : {
                    temppassword += encryptpass.charAt(i + 1);
                    break;
                }
                case '1' : {
                    temppassword += String.fromCharCode(encryptpass.charAt(i + 1).charCodeAt() - parseInt(key.charAt(keyIndex % keyLength)));
                    break;
                }
                case '2' : {
                    temppassword += String.fromCharCode(encryptpass.charAt(i + 1).charCodeAt() + parseInt(key.charAt(keyIndex % keyLength)));
                    break;
                }
                case '3' : {
                    temppassword += String.fromCharCode(parseInt(key.charAt(keyIndex % keyLength)) - encryptpass.charAt(i + 1).charCodeAt());
                    break;
                }
                default : {
                    temppassword = "failed to decrypt";
                    return temppassword;
                }
            }

            i ++;
            keyIndex ++;
        }

        return temppassword;
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
    $scope.deleteAccount = function(id) {
        $.ajax({
            type: 'post',
            url: '../ajax/deleteAccount',
            data: {
                "id": id,
            },
            dataType: "text",
            success: function (data) {
                console.log(data)
                $scope.tableParams.reload();
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
    $scope.updateAccount = function () {};
    $scope.updateClock();
    $scope.init();
});