/**
 * Created by yingmeng on 2017/5/13 0013.
 */
let app = angular.module("myapp", ['ngTable']).controller("MyDairy",
    function ($scope, $timeout) {
        $scope.updateClock = function () {
            let date = new Date();
            $scope.clock = date.toLocaleDateString() + " " + date.toLocaleTimeString();
            $timeout(function () {
                $scope.updateClock();
            }, 999);
        };
        $scope.init = function () {
            $scope.hasAccount = false;
            $scope.hasUser = false;
            $scope.commonkey = "";
            $scope.queryName();
        };
        $scope.queryName = function () {
            $.ajax({
                type: 'post',
                url: '../../../rest/ajax/queryapps',
                data: {},
                dataType: "text",
                success: function (data) {
                    $scope.names = JSON.parse(data);
                    if ($scope.names.length === 0) {
                        $scope.selectedName = "add first";
                        return;
                    }
                    $scope.selectedName = $scope.names[0];
                    $scope.hasAccount = true;
                    $scope.queryAccountInfo();

                }
            });
        };
        $scope.queryAccountInfo = function () {
            if (!$scope.hasAccount) {
                return;
            }
            $.ajax({
                type: 'post',
                url: '../../../rest/ajax/queryusernames',
                data: {
                    "appname": $scope.selectedName,
                },
                dataType: "text",
                success: function (data) {
                    console.log(data);
                    $scope.usernames = JSON.parse(data);
                    if ($scope.usernames.length === 0) {
                        $scope.selectedUser = "add first";
                        return
                    }
                    $scope.selectedUser = $scope.usernames[0];
                    $scope.hasUser = true;
                    $scope.queryuserpass();
                }
            });
        };
        $scope.queryuserpass = function () {
            $.ajax({
                type: 'post',
                url: '../../../rest/ajax/queryaccountinfo',
                data: {
                    "appname": $scope.selectedName,
                    "username": $scope.selectedUser
                },
                dataType: "text",
                success: function (data) {
                    $scope.epassword = data;
                }
            });
        };
        $scope.cancel = function () {
            $scope.savename = "";
            $scope.saveaccountname = "";
            $scope.savepassword = "";
        };
        $scope.addAccount = function () {
            $.ajax({
                type: 'post',
                url: '../../../rest/ajax/add',
                data: {
                    "appname": $scope.savename,
                    "username": $scope.saveaccountname,
                    "userpass": $scope.encrypt($scope.savepassword,$scope.savekey)
                },
                dataType: "text",
                success: function (data) {
                    console.log(data);
                    $scope.cancel();
                    $scope.queryName();
                }
            });
        };
        $scope.decrypt = function () {
            $scope.password = $scope.decryptAlgor($scope.epassword, $scope.commonkey);
        };
        $scope.encrypt = function (originalpass, key) {
            let keyLength = key.length;
            let savepassword = "";


            //计算密文   0：密文为原始字符   1：密文为原始字符+密钥字符后的结果  2：密文为原始字符-密钥字符后的结果   3：密文为密钥字符-原始字符后的结果
            for (let i = 0; i < originalpass.length; i++) {
                if (originalpass.charAt(i).charCodeAt() + parseInt(key.charAt(i % keyLength)) > 31 &&
                    originalpass.charAt(i).charCodeAt() + parseInt(key.charAt(i % keyLength)) < 127) {
                    savepassword += '1';
                    savepassword += String.fromCharCode(originalpass.charAt(i).charCodeAt() + parseInt(key.charAt(i % keyLength)));
                } else if (originalpass.charAt(i).charCodeAt() - parseInt(key.charAt(i % keyLength)) > 31 &&
                    originalpass.charAt(i).charCodeAt() - parseInt(key.charAt(i % keyLength)) < 127) {
                    savepassword += '2';
                    savepassword += String.fromCharCode(originalpass.charAt(i).charCodeAt() - parseInt(key.charAt(i % keyLength)));
                } else if (parseInt(key.charAt(i % keyLength)) - originalpass.charAt(i).charCodeAt() > 31 &&
                    parseInt(key.charAt(i % keyLength)) - originalpass.charAt(i).charCodeAt() < 127) {
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
            let temppassword = "";

            let keyIndex = 0;
            let keyLength = key.length;
            for (let i = 0; i < encryptpass.length; i++) {
                let encryptType = encryptpass.charAt(i);
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

                i++;
                keyIndex++;
            }

            return temppassword;
        };
        $scope.updateClock();
        $scope.init();
    });