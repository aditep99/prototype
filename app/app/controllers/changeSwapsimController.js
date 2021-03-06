﻿smartApp.controller('ChangeSwapSimController', function($routeParams, $scope, AuthenService, ChangeSwapSimService, DeviceService, sharedServices, SystemService, $filter) {

    // Templates
    var runTime = new Date().getTime();
    $scope.template = {
        header: 'app/views/header.html?' + runTime,
        customerprofile: 'app/views/customerprofile.html?' + runTime
    };

    //!isCustomerProfile || (shopType=='1' && getAuthen['isSecondAuthen'] == true && !$scope.deviceType) || (shopType=='1' && dealerCode.length != 8)
    // Prepare page states
    $scope.SubNo = $routeParams.subno ? $routeParams.subno : 'null';



    // Initialize variables
    $scope.divID = 'changeSwapSimContent';
    $scope.subNoLength = 10;
    $scope.dealerCodeLength = 8;
    $scope.simSerialLength = 18;

    $scope.isCardValueData = false;
    $scope.isReadCardSuccess = false;
    $scope.approver = "";

    $scope.checkURL_shop_code = false;

    var idFocus = "";

    $scope.hideReadCardForMobile = function() {
        SystemService.hideReadCardForMobile();
    };

    // Initalize states of the UI controls in the CustomerProfile template to display properly in the SwapSIM page
    $scope.onCustomerProfileTemplateLoaded = function() {
        $('#unMatch2').hide();
        $scope.isAuthorize = false;
        $scope.isCustomerProfile = false;

        //$('#btnSSO').hide();
        //$('#CitizenID').show();
    };


    // Submit form
    var isDataComplete = function() {
        //return !$('#simSerial').prop('disabled');
        return true;
    };

    var generateOrderRequest = function() {
        //change AUTH_1 to POA :: 02-06-2016 //waramun
        var customerAgent = {
            "POA": {
                "id-number": $('#CitizenID2').val(),
                "firstname": $('#authorizeFullName').val(),
                "lastname": $('#authorizeFullName').val()
            }
        };
        return {
            orderData: orderData,
            customerProfile: $scope.data.customerProfile,
            simData: $scope.data.simData,
            newSIMData: {
                productCodes: $scope.data.simDetails['product-code'],
                simSerial: $scope.simSerial
            },
            saleAgent: $scope.getAuthen,
            shopcode: $scope.dealerCode,
            simDetail: $scope.data.simDetails,
            customerAgent: customerAgent
        };
    };

    $scope.submit = function() {
        $scope.hasSubmitted = true;
        orderData.approver = $scope.approver;

        var data = generateOrderRequest();

        SystemService.showLoading();
        console.log(data);
        ChangeSwapSimService.submitSwapSIMOrder(data, function(result) {
            SystemService.hideLoading();

            setTimeout(function() {
                var displayMsg = utils.getObject(result.data, 'display-messages.0');

                if (!displayMsg || !displayMsg['message-type']) {
                    SystemService.showBeforeClose({
                        "message": "DEMO > " + result.data["display-messages"][0]["th-message"],
                        "message2": ""
                    });
                } else {
                    SystemService.showBeforeClose({
                        "message": result.data["display-messages"][0]["th-message"],
                        "message2": ""
                    });
                }
            }, 1000);
        });
    };

    $scope.printAndSaveOrder = function() {
        //case for PDF Android ::18-05-2016 //xsam32
        SystemService.checkPDFAndroid_printNoneShop();
        $scope.submit();
    };

    $scope.openPDFDialog = function() {
        if (!isDataComplete()) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อน');
            return;
        }

        SystemService.showLoading();



        var customerType = 'N';
        if ($scope.data.simData['account-category'] === 'B' || $scope.data.simData['account-category'] === 'C') {
            customerType = 'Y';
        }
        var cardValueData = {
            //NEW---
            "photoIdCard": "",

            //SC=Scan
            //SN=Snap
            "photoType": "SN",
            "titleEn": "",
            "firstnameEn": "",
            "lastnameEn": "",

            "titleTh": "",
            "firstnameTh": "",
            "lastnameTh": "",

            "expireDay": "",
            "birthDay": "",
            "issueDay": "",

            //HomeNumber : '91',Moo : '10',Trok : '',Soi : '',Road : '',District : 'กังแอน',Amphur : 'ปราสาท',Province : 'สุรินทร์'"
            "homeNumber": "",
            "moo": "",
            "trok": "",
            "soi": "",
            "road": "",
            "district": "",
            "amphur": "",
            "province": ""
                //NEW---
        };
        if ($scope.isCardValueData) {
            cardValueData.photoType = "SC";
            cardValueData.photoIdCard = $scope.cardInfo.CitizenID;
            cardValueData = {
                //NEW---
                "photoIdCard": $scope.cardInfo.Photo,

                //SC=Scan
                //SN=Snap
                "photoType": "SC",
                "titleEn": $scope.cardInfo.PrefixEN,
                "firstnameEn": $scope.cardInfo.FirstNameEN,
                "lastnameEn": $scope.cardInfo.LastNameEN,

                "titleTh": $scope.cardInfo.PrefixTH,
                "firstnameTh": $scope.cardInfo.FirstNameTH,
                "lastnameTh": $scope.cardInfo.LastNameTH,


                "expireDay": $scope.cardInfo.ExpireDay,
                "birthDay": $scope.cardInfo.BirthDay,
                "issueDay": $scope.cardInfo.IssueDay,



                //HomeNumber : '91',Moo : '10',Trok : '',Soi : '',Road : '',District : 'กังแอน',Amphur : 'ปราสาท',Province : 'สุรินทร์'"
                "homeNumber": $scope.cardInfo.HomeNumber,
                "moo": $scope.cardInfo.Moo,
                "trok": $scope.cardInfo.Trok,
                "soi": $scope.cardInfo.Soi,
                "road": $scope.cardInfo.Road,
                "district": $scope.cardInfo.District,
                "amphur": $scope.cardInfo.Amphur,
                "province": $scope.cardInfo.Province
                    //NEW---
            };

        }
        var data = {
            'func': 'SWS',
            'header': {
                'title-code': customerType == 'Y' ? "" : $scope.data.customerProfile['title-code'],
                'title': $scope.data.customerProfile['title'],
                'firstname': $scope.data.customerProfile['firstname'],
                'lastname': $scope.data.customerProfile['lastname'],
                'customerType': customerType,
                'authorizeFullName': $('#authorizeFullName').val(),
                'id-number': $scope.data.customerProfile['id-number'],
                'product-id-number': $scope.SubNo,
                'ouId': $scope.data.simData['ouId'],
                'orderId': orderData.orderId,
                "photo": $scope.varPhoto,

                //NEW---
                "photoIdCard": cardValueData["photoIdCard"],

                //SC=Scan
                //SN=Snap
                "photoType": cardValueData["photoType"],
                "titleEn": cardValueData["titleEn"],
                "firstnameEn": cardValueData["firstnameEn"],
                "lastnameEn": cardValueData["lastnameEn"],

                "titleTh": cardValueData["titleTh"],
                "firstnameTh": cardValueData["firstnameTh"],
                "lastnameTh": cardValueData["lastnameTh"],

                "expireDay": cardValueData["expireDay"],
                "birthDay": cardValueData["birthDay"],
                "issueDay": cardValueData["issueDay"],

                //HomeNumber : '91',Moo : '10',Trok : '',Soi : '',Road : '',District : 'กังแอน',Amphur : 'ปราสาท',Province : 'สุรินทร์'"
                "homeNumber": cardValueData["homeNumber"],
                "moo": cardValueData["moo"],
                "trok": cardValueData["trok"],
                "soi": cardValueData["soi"],
                "road": cardValueData["road"],
                "district": cardValueData["district"],
                "amphur": cardValueData["amphur"],
                "province": cardValueData["province"]
                    //NEW---
            },
            'body': generateOrderRequest()
        };
        console.log(data);

        var pdfShopCode = $scope.dealerCode;
        localStorage.setItem('pdfShopCode', pdfShopCode);

        SystemService.generatePDF(data, function(url) {
            SystemService.hideLoading();

            SystemService.printPDF(url);
            //printObjectPdf();
            setTimeout(function() {
                //case for PDF Android ::18-05-2016 //xsam32
                SystemService.checkPDFAndroid_show(url);
            }, 500);
            if ($scope.shopType == "1" && $scope.getAuthen['isSecondAuthen'] == true) {
                //case for PDF Android ::18-05-2016 //xsam32
                setTimeout(function() {
                    SystemService.checkPDFAndroid_print(url);
                }, 2000);
            }
            setTimeout(function() {
                $('#modalPDFOpener').click();

                // setTimeout(function() {
                //     var srcPDF = url;
                //     document.getElementById('iframePDF').src = url + '?clearData=N';
                //     if ($scope.shopType == "1" && $scope.getAuthen['isSecondAuthen'] == true) {
                //         setTimeout(function() {
                //             //document.getElementById('iframePDF').src = 'javascript:window.print();'
                //             printObjectPdf();
                //         }, 2000);
                //         setTimeout(function() {
                //             document.getElementById('iframePDF').src = srcPDF
                //         }, 2500);
                //     }
                // }, 500);




            }, 1000);
        });
    };


    // Get device list
    var deviceByCode = {};
    $scope.deviceType = "";
    var onGetDeviceTypeList = function(result) {
        $scope.deviceTypeList = result.data['response-data'];

        if ($scope.deviceTypeList && $scope.deviceTypeList.length) {
            deviceByCode = _.indexBy($scope.deviceTypeList, 'device-code');

            // Non-shop users always have only one device type, just auto-select it
            if ($scope.getAuthen['userGroup'] == 'ADMIN' || $scope.deviceTypeList.length === 1) {
                setTimeout(function() {
                    $scope.deviceType = $scope.deviceTypeList[0]['device-code'];
                    $scope.$digest();
                }, 0);
            }
            //CR :: 21-04-2016 :: shop 
            if (($scope.shopType === '1' || $scope.getAuthen['userGroup'] == 'TELESALES') && $scope.deviceTypeList.length) {
                var checkDefault = function(code) {
                    setTimeout(function() {
                        $scope.deviceType = code;
                    }, 0);
                    setTimeout(function() {
                        $('#idBindDataAgain').click();
                    }, 1000);
                }
                for (var i = 0; i < $scope.deviceTypeList.length; i++) {
                    console.log(i, $scope.deviceTypeList[i]['device-code'], $scope.deviceTypeList.length);
                    if ($scope.deviceTypeList[i]['device-code'] == '005') {
                        checkDefault('005');
                        break;
                    } else if ($scope.deviceTypeList[i]['device-code'] == '006') {
                        checkDefault('006');
                        break;
                    } else {
                        //
                    }
                }
                // var checkArr005 = $filter('filter')($scope.deviceTypeList, { 'device-code': '005' });
                // var checkArr006 = $filter('filter')($scope.deviceTypeList, { 'device-code': '006' });
                // if (checkArr005.length != 0) {
                //     checkDefault('005');
                // } else if (checkArr006.length != 0) {
                //     checkDefault('006');
                // }else {
                //     //
                // }
            }
        }
    };

    $scope.$watch('deviceType', function(val) {
        if (deviceByCode[val]) {
            var device = deviceByCode[val];

            $scope.productCodes = device['product-codes'].join('/');
            $scope.simType = device['sim-type'];
        } else {
            $scope.productCodes = '';
            $scope.simType = ''
        }
    });


    // Get current SIM data
    var onGetSIMData = function(result) {
        $scope.checkURL_shop_code = true;
        if (result == false) {
            console.log(result);
            $scope.SubNo = 'null';
            $('#dataSubNo').val("");
            idFocus = "dataSubNo";
            return;
        } else {

            //check enable input
            if ($scope.shopType == '1') {} else {
                $scope.isCustomerProfile = true;
            }

            $scope.data = result.data;
            $scope.SubNo = result.data.header.subscriberno;

            if (!$scope.data) return;

            // authenticate();

            var companyCode = utils.getObject(result.data, 'simData.company-code');
            if (!utils.isEmpty(companyCode)) {
                DeviceService.getDeviceTypeList(companyCode, onGetDeviceTypeList);
            }

            if ($scope.shopType === '1') {
                // Auto-open the CardReader dialog
                setTimeout(function() {
                    var fancyboxOptions = {
                        helpers: {
                            overlay: {
                                //closeClick: false
                            }
                        },

                        beforeShow: function() {

                            if ($scope.getAuthen['shopType'] == '1' && $scope.getAuthen['isSecondAuthen'] == false) {
                                $('#btnSSO').hide();
                                //hidden button and disabled=false
                                $('#CitizenID').prop('disabled', false);
                            } else {
                                if ($scope.getAuthen["isByPassSecondAuthen"] == true) {
                                    $('#CitizenID').prop('disabled', false);
                                    setTimeout(function() {
                                        $('#CitizenID').focus();
                                    }, 500);


                                } else {
                                    $('#CitizenID').prop('disabled', true);
                                }
                            }
                            $('#loadingReadCard').hide();
                            $('#unMatch').hide();
                        },

                        afterClose: function() {
                            if (!$scope.onInputId()) {
                                //window.close();
                            }
                        }
                    };

                    $('#btn-fancy-ReadCard').fancybox(fancyboxOptions).trigger('click');
                }, 1000);
            } else {
                //
            }
        }



    };

    $scope.onload = function() {
        //alert($scope.SubNo);
        if ($scope.SubNo !== 'null') {
            SystemService.showLoading();
            authenticate();
            // ChangeSwapSimService.getSIMData($scope.SubNo, onGetSIMData);
        }
    }

    setTimeout(function() {
        if ($scope.SubNo == 'null') {
            $('#dataSubNo').focus();
        }
    }, 1000);

    setTimeout(function() {
        SystemService.validateNummeric();
    }, 1000);
    $scope.isNumberSubNo = false;
    $scope.onKeyUpSubNo = function(charCode) {
        var bool = SystemService.checkInputTel(charCode);
        $scope.isNumberSubNo = !bool;
        $scope.autoHideNumberSubNo = false;
        return bool;
    }
    $scope.onInputSubNo = function() {

        console.log($('#dataSubNo').val().length);
        var dataSubNo = $('#dataSubNo').val();
        if (dataSubNo.length == 10) {
            $scope.SubNo = $('#dataSubNo').val();
            $('#swapSubNo').prop('disabled', true);

            // SystemService.showLoading();

            // ChangeSwapSimService.getSIMData(dataSubNo, function(result) {

            //     $('#swapSubNo').prop('disabled', false);

            //     onGetSIMData(result);
            // });
            $scope.onload();
        }

    };
    $scope.onInputSubNo_reset = function() {
        $scope.isInputSubNo = false;
        $scope.onInputSubNo();
    };


    // Validate new SIM
    var validateSIMType = function(simType) {
        return jQuery.inArray(simType, ['1', '3', '5', 'S']) === -1 ? false : true;
    };

    var validateResourceStatus = function(resourceStatus) {
        return resourceStatus === 'AVAILABLE' ? true : false;
    };

    $scope.onInputSIMSerial = function() {
        $scope.printAble = false;
        if ($scope.simSerial.length === $scope.simSerialLength) {



            var data = {
                'sim-serial': $scope.simSerial,
                'dealer-code': $scope.dealerCode,
                'company-code': $scope.data.simData['company-code'],
                'mobile-servicetype': $scope.data.simData['mobile-servicetype'] == 'PREPAID' ? 'PREPAID' : 'POSTPAID'
                    //,'product-code': $scope.productCodes,
                    //'pair-msisdn': $scope.SubNo
            };

            if (($scope.getAuthen['shopType'] == '1' && $scope.getAuthen['isSecondAuthen'] == true) || $scope.getAuthen['userGroup'] == 'TELESALES') {
                data['product-code'] = $scope.productCodes;
            }
            console.log(data);
            ChangeSwapSimService.validateSIM(data, function(result) {
                var displayMsg = utils.getObject(result.data, 'display-messages.0');

                if (displayMsg && displayMsg['message-type']) {
                    $('#simSerial').prop('disabled', false);
                    $scope.simSerial = "";
                    idFocus = "simSerial";

                    SystemService.showAlert({
                        "message": result.data["display-messages"][0]["message"],
                        "message-code": result.data["display-messages"][0]["message-code"],
                        "message-type": "WARNING",
                        "en-message": result.data["display-messages"][0]["en-message"],
                        "th-message": result.data["display-messages"][0]["th-message"],
                        "technical-message": result.data["display-messages"][0]["technical-message"]
                    });
                    return;
                    //SystemService.showAlert(displayMsg);
                } else {
                    //$('#simSerial').prop('disabled', true);
                }

                $scope.printAble = false;

                if (result.data) {
                    var simDetails = utils.getObject(result.data, 'response-data.sim-detail');
                    $scope.data.simDetails = simDetails;

                    if (
                        // TODO: Validate (See Page 10 - NO 6)
                        // TODO: Validate (See Page 10 - NO 7)
                        //validateSIMType(simDetails['sim-type']) &&
                        //validateResourceStatus(simDetails['resource-status'])
                        1 == 1
                        // TODO: Validate (See Page 10 - NO 10)
                        // TODO: Validate (See Page 10 - NO 11)
                        // TODO: Validate (See Page 10 - NO 12)
                    ) {
                        $scope.printAble = true;

                        if ($scope.shopType === '1' && $scope.deviceType) {
                            $scope.openPDFDialog();
                        }
                    } else {
                        alert('หมายเลขซิมการ์ดใหม่ ไม่ถูกต้อง'); // ปรับ alert message

                    }
                }
            });
        } else {
            $scope.printAble = false;
        }
    };
    $scope.onClearSim = function() {
        //
        $scope.printAble = false;
        $scope.simSerial = "";
    };
    $scope.onInputDealerCode = function() {
        //check validate 07-04-2016
        $scope.printAble = false;
        $scope.simSerial = "";
        if ($scope.dealerCode.length === $scope.dealerCodeLength) {

            $('#dealerCodeInput').prop('disabled', true);

            var data = {
                'partner-code': $scope.dealerCode,
                'function-type': 'SWAPSIM'
            };

            sharedServices.validateDealerCode(data, function(result) {
                $scope.alreadyValidatedDealerCode = true;
                $scope.dealerCodeValid = false;

                $('#dealerCodeInput').prop('disabled', false);

                if (result.status === true && result.data) {
                    var dealerCode = utils.getObject(result.data, 'response-data.partnerInfo.dealer-code');

                    if ($scope.dealerCode === dealerCode) {
                        $scope.dealerCodeValid = true;
                    }
                }
            });
        } else {
            $scope.dealerCodeValid = false;
        }
    };


    // Authentication
    var orderData = {};
    $scope.showDataDealer = false;
    var authenticate = function() {
        AuthenService.getAuthen(function(authResult) {
            $scope.multiSimValue = $scope.multiSim["master-sim"][0]['sim-serial'];
            $scope.getAuthen = authResult;
            $scope.shopType = authResult.shopType;
            //console.log(authResult);
            ChangeSwapSimService.getSIMData($scope.SubNo, onGetSIMData);

            $scope.shopType = $scope.getAuthen['shopType'];

            if ($scope.shopType == '1' && $scope.getAuthen['isSecondAuthen'] == false) {
                $scope.showDataDealer = true;
            }

            // Prepare dealer code list
            $scope.dealerCodeList = $scope.getAuthen.shopcodes;
            if ($scope.dealerCodeList && $scope.dealerCodeList.length === 1) {
                $scope.dealerCode = $scope.dealerCodeList[0];
                $scope.dealerCodeValid = true;
            } else if ($scope.dealerCodeList && $scope.dealerCodeList.length > 1) {
                $scope.dealerCodeValid = true;
                //$('#dealerCodeList').attr('size', $scope.dealerCodeList.length + 1);
            }

            var dealerCode = utils.getObject($scope.getAuthen, 'shopcodes.0');

            SystemService.getOrderId($scope.getAuthen.channel, dealerCode, function(order) {
                //SystemService.hideLoading();

                orderData = order;
                localStorage.setItem('orderId', order.orderId);


            });
        });
    };

    $scope.openSSO = function() {
        var getReadyCitizenInput = function() {
            $('#CitizenID').prop('disabled', false);
            $('#CitizenID').focus();
        };

        if ($scope.getAuthen.isSecondAuthen) {
            var openDialog = function(uri, name, options, closeCallback) {
                var win = window.open(uri, name, options);

                var interval = window.setInterval(function() {
                    try {
                        if (!win || win.closed) {
                            window.clearInterval(interval);
                            closeCallback(win);
                        }
                    } catch (ex) {}
                }, 1000);

                return win;
            };

            var url = SystemService.secondAuthenURL + 'SecondAuthen.jsp?App=WEBUI&TrxID=' + orderData.TrxID + '&Retry=yes&Goto=';

            openDialog(url, 'MsgWindow', 'width=800, height=600', function(w) {
                SystemService.showLoading();

                SystemService.second_authen(orderData.TrxID, function(result) {
                    SystemService.hideLoading();


                    var displayMsg = utils.getObject(result, 'display-messages.0');
                    if (result["display-messages"] === undefined) {
                        var res = result["response-data"][0]['authRes'];
                        if (res['responseCode'] == "200") {
                            $scope.approver = result['response-data'][0]['loginName'];
                            setTimeout(function() {
                                getReadyCitizenInput();
                            }, 1000);
                        } else {
                            //$.fancybox.close();
                            //unsuccessul

                            setTimeout(function() {
                                SystemService.showAlert({
                                    "message": "",
                                    "message-code": "",
                                    "message-type": "WARNING",
                                    "en-message": res['responseCode'] + ": " + res['responseDesc'],
                                    "th-message": "",
                                    "technical-message": "changeResumeConroller"
                                });
                            }, 1000);
                        }

                    } else {
                        setTimeout(function() {
                            SystemService.showAlert({
                                "message": displayMsg["display-messages"][0]["message"],
                                "message-code": displayMsg["display-messages"][0]["message-code"],
                                "message-type": "WARNING",
                                "en-message": displayMsg["display-messages"][0]["en-message"],
                                "th-message": displayMsg["display-messages"][0]["th-message"],
                                "technical-message": displayMsg["display-messages"][0]["technical-message"]
                            });
                        }, 1200);
                    }
                });
            });
        } else {
            getReadyCitizenInput();
        }
    };

    $scope.onInputId = function() {
        var value = $('#CitizenID').val();

        if (value.length >= 3) {
            if (value === $scope.data.customerProfile['id-number']) {
                $scope.isCustomerProfile = true;
                $scope.showDataDealer = false;
                $('#unMatch').hide();
                $('.fancybox-close').click();

                return true;
            } else {
                $('#unMatch').show();
            }
        }
    };
    $scope.onInputIdReadCard = function() {
        var value = $('#CitizenID').val();

        if (value.length === 13) {
            if (value === $scope.data.customerProfile['id-number']) {
                $scope.isCustomerProfile = true;
                $('#unMatch').hide();
                $('.fancybox-close').click();

                return true;
            } else {
                $('#unMatch').show();
            }
        }
    };

    $scope.readCardError = function(msg) {
        SystemService.showAlert({
            'message': msg,
            'message-code': '',
            'message-type': 'WARNING',
            'en-message': msg,
            'th-message': msg,
            'technical-message': ''
        });
    };
    $scope.SetCardValue2 = function(result) {
        $('#loadingReadCard2').hide();

        $scope.cardInfo2 = eval(result);
        console.log($scope.cardInfo2);

        $('#CitizenID2').val($scope.cardInfo2.CitizenID);
        $('#authorizeFullName').val($scope.cardInfo2.PrefixTH + "" + $scope.cardInfo2.FirstNameTH + " " + $scope.cardInfo2.LastNameTH);

        $scope.varCardInfo2.firstName = $scope.cardInfo2.FirstNameTH;
        $scope.varCardInfo2.lastName = $scope.cardInfo2.LastNameTH;

        //$scope.CitizenID2 = $scope.cardInfo2.CitizenID;
        //$scope.authorizeFullName = $scope.cardInfo2.PrefixTH + "" + $scope.cardInfo2.FirstNameTH + "  " + $scope.cardInfo2.LastNameTH;
    }
    $scope.SetCardValue = function(result) {
        $('#loadingReadCard').hide();
        $('#loadingReadCard2').hide();
        $('#unMatch2').hide();
        $scope.isReadCardSuccess = false;

        $scope.cardInfo = eval(result);
        if ($scope.data.customerProfile["id-number"] == $scope.cardInfo.CitizenID) {
            $scope.isCardValueData = true;
            $('#CitizenID').val($scope.cardInfo.CitizenID);

            $scope.isReadCardSuccess = true;

            $scope.onInputIdReadCard();
        } else {
            $scope.isCardValueData = false;
            $('#unMatch').show();
        }




        setTimeout(function() {
            $('#idBindDataAgain').click();
        }, 1000);
    };

    //start----------- camera ----------------
    $scope.varPhoto = "";
    $scope.initWebCam = function() {

        setTimeout(function() {
            $('#btnSavePhoto').hide();
            $('#btnSavePhoto_Mobile').hide();
            var html = webcam.get_html(320, 240);
            $("#dataCamera").html(html);

            webcam.set_api_url(getURL('services/file/upload.service'));
            webcam.set_quality(90); // JPEG quality (1 - 100)
            webcam.set_shutter_sound(true); // play shutter click sound
            webcam.set_hook('onComplete', onCompleteSnap);

        }, 500);

    }

    function onCompleteSnap(msg) {
        $scope.varPhoto = msg;
        var ie_preview_image = $("#ie_preview_image")[0];
        ie_preview_image.src = "data:image/png;base64," + msg;

        webcam.reset();
        $('#btnSavePhoto').show();
    }

    $scope.webcamSnap = function() {
        webcam.snap();
    }
    $scope.mobileCamSnap = function() {
        var msg = $('#varMobileCam').val();
        msg = msg.replace('data:image/png;base64,', '');
        msg = msg.replace('data:image/jpeg;base64,', '');
        //console.log(msg);
        // $('#btnSavePhoto_Mobile').hide();
        $scope.varPhoto = msg;
    };
    //end----------- camera ----------------

    //// new requirement readBarcode :: 09-06-2016 :: xsam32
    $scope.readBarcode = function(text) {
        $scope.simSerial = text;
        $('#simSerial').val(text);
        $scope.onInputSIMSerial();
    };


    $scope.afterCloseWarning = function() {
        if ($scope.data || $routeParams.subno) {} else {
            $scope.SubNo = "null";
        }
        // if ($scope.SubNo === 'null') {
        //     // $('#dataSubNo').val('');
        //     setTimeout(function() {
        //         $('#dataSubNo').focus();
        //     }, 500);
        // }
        if (idFocus) {
            $('#' + idFocus).focus();
            idFocus = "";
        } else {
            //$scope.validateUI();
        }
        $scope.isClickPrint = false;

        //isFocus = true;
        //$scope.initModalReadCard();

        //Fix loading hide in shop_code=%20
        if ($scope.checkURL_shop_code == false) {
            $scope.checkURL_shop_code = true;
            SystemService.showLoading();
        }


    };

// Multi Sim

$scope.multiSim = {
    "master-sim" : [
        {
            "product-name" : "iPhone 6 Nan",
            "sim-serial" : "896600401500009000"
        },
         {
            "product-name" : "iPhone 6 Plus",
            "sim-serial" : "896600401500009001"
        }

    ],

    "minor-sim" : [
       {
            "product-name" : "iPad for kid1",
            "sim-serial" : "896600401500004545"
        },
        {
            "product-name" : "มิเตอร์ไฟบ้าน",
            "sim-serial" : "896600401500008991"
        },
        {
            "product-name" : "iPad for kid2",
            "sim-serial" : "896600401500008999"
        },
        {
            "product-name" :  "มิเตอร์ไฟคอนโด",
            "sim-serial" : "896600401500007000"
        },
        {
            "product-name" : "นาฬิกาพ่อ",
            "sim-serial" : "896600401500008990"
        },
        {
            "product-name" : "ประตูบ้านใหญ่",
            "sim-serial" : "896600401500007888"
        },
        {
            "product-name" : "นาฬิกาแม่",
            "sim-serial" : "896600401500008991"
        },
        {
            "product-name" : "ประตูบ้านเล็ก",
            "sim-serial" : "896600401500002345"
        }

    ],
};



});

// TODO: Each function in sharedServices should be moved to another file
smartApp.service('sharedServices', function($timeout, SystemService) {

    this.validateDealerCode = function(payload, fnCallback) {
        var params = utils.createParamGet(payload, [
            'partner-code',
            'function-type'
        ]);

        var cb = function(result) {
            var displayMsg = utils.getObject(result.data, 'display-messages.0');

            if (displayMsg && displayMsg['message-type']) {
                SystemService.showAlert(displayMsg);
            }

            fnCallback(result);
        };

        if (!SystemService.demo) {
            var target = '/profiles/partner/validatepartner?' + params;

            SystemService.callServiceGet(target, null, function(result) {
                cb(result);
            });
        } else {
            var data = {
                'status': 'SUCCESSFUL',
                'display-messages': [],
                'trx-id': '7K1EFF8LA2BTF',
                'process-instance': 'psaapdv1 (instance: SFF_node1)',
                'response-data': {
                    'partnerInfo': {
                        'status-id': '1',
                        'register_date': '2003-06-23 00:00:00.0',
                        'status_name': 'Active',
                        'biz-reg-type-name': 'นิติบุคคล',
                        'dealer-code': payload['partner-code'],
                        'emp-code': '',
                        'tvs-code': '',
                        'tmx-emp-code': '',
                        'channel-alias': 'OTHER',
                        'channel-name': 'Other',
                        'partner-type-name': 'Sub-Partner',
                        'partner-sub-type-name': '',
                        'partner-type-group-name': 'OUTLET',
                        'parent-code': '79000001',
                        'partner-name-th': 'TA Orange Co.'
                    }
                }
            };

            $timeout(function() {
                cb({
                    status: true,
                    data: data,
                    error: '',
                    msgErr: ''
                });
            }, 1000);
        }
    };

});
