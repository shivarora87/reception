/**
 * customerRequest
 */

"use strict";

/* Third-party modules */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VisitorStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");
var fileName = '../config.json';
var file = require(fileName);

var base64 = require('node-base64-image');

var VisitorStore = exports.VisitorStore = function () {
    function VisitorStore(resource, logger) {
        _classCallCheck(this, VisitorStore);

        this._resource = resource;
        this._logger = logger;
    }

    _createClass(VisitorStore, [{
        key: "saveCustomer",
        value: function saveCustomer(customer) {
            var _this = this;

            // if(customer.paramImagePath != ''){
            var unix = Math.round(+new Date() / 1000);
            var imageName = customer.paramAccountName + '_' + unix;
            var options = { filename: './public/images/' + imageName };
            //var options = {filename: './src/reception_handler/images/' + imageName};
            var imageData = new Buffer(customer.paramImagePath, 'base64');

            base64.base64decoder(imageData, options, function (err, saved) {
                if (err) {
                    console.log(err);
                }
                console.log(saved);
            });
            //}

            var insertQuery = "\n                    INSERT INTO\n                    reception_handler.cromwell_recp (\n                        type,\n                        accountid,\n                        accountname,\n                        contactid,\n                        contactname,\n                        employeeid,\n                        employeename,\n                        vehiclereg,\n                        settime,\n                        reclogid,\n                        logid,\n                        pendingid,\n                        imagepath\n                    )\n                    VALUES (\n                        $1,\n                        $2,\n                        $3,\n                        $4,\n                        $5,\n                        $6,\n                        $7,\n                        $8,\n                        $9,\n                        $10,\n                        $11,\n                        $12,\n                        $13\n                    )\n                    RETURNING id\n                ";

            var args = [customer.paramType, customer.paramAccountId, customer.paramAccountName, customer.paramContactId, customer.paramContactName, customer.paramEmployeeId, customer.paramEmployeeName, customer.paramvehicleReg, customer.paramTime, customer.paramRecLogId, customer.paramLogId, customer.paramPendingId, imageName + '.jpg'];
            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            }).then(function (res) {

                var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE id = $1 LIMIT 1";
                var args = [res.rows[0]["id"]];

                return _this._resource.query(selectQuery, args).then(function (data) {
                    return data.rows[0];
                });
            });
        }
    }, {
        key: "getCustomer",
        value: function getCustomer(id) {

            var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE id = $1 LIMIT 1";
            var args = [id];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "updateCustomer",
        value: function updateCustomer(id, customer) {

            console.log(id);
            console.log(customer.signout);

            var updateQuery = "\n                    UPDATE\n                    reception_handler.cromwell_recp SET \n                        signout = $1\n                       WHERE logid = $2 \n                ";

            var args = [customer.signout, id];
            return this._resource.query(updateQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "checkIfUpdateRequired",
        value: function checkIfUpdateRequired(merlinCustomerData, customerData, fieldsToCheck) {

            var updateRequired = false;
            _lodash._.forEach(fieldsToCheck, function (value, key) {

                if (!customerData[key]) {
                    customerData[key] = "";
                }

                if (customerData[key] !== merlinCustomerData[value]) {
                    updateRequired = true;
                }
            });

            return updateRequired;
        }
    }, {
        key: "allSignOut",
        value: function allSignOut() {
            var chk = new Date();
            var month = chk.getMonth() + 1;
            var myDate = [chk.getFullYear(), month < 10 ? '0' + month : month, chk.getDate()].join('-');
            var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

            var updateQuery = " UPDATE reception_handler.cromwell_recp SET signout= $1 WHERE signout IS NULL";
            var args = [myDate + ' ' + myTime];

            return this._resource.query(updateQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "allSignOutToday",
        value: function allSignOutToday() {

            var chk = new Date();
            var month = chk.getMonth() + 1;
            var myDate = [chk.getFullYear(), month < 10 ? '0' + month : month, chk.getDate()].join('-');
            //var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

            var selectQuery = " SELECT * FROM  reception_handler.cromwell_recp  WHERE signout > $1 ORDER BY id DESC";
            var args = [myDate + ' 00:00:00'];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "getAllSignIns",
        value: function getAllSignIns() {
            var chk = new Date();
            var month = chk.getMonth() + 1;

            var myDate = [chk.getDate(), month < 10 ? '0' + month : month, chk.getFullYear()].join('-');
            //var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

            var selectQuery = "SELECT * FROM reception_handler.cromwell_recp WHERE   settime > $1 and signout IS NULL ";
            var args = [myDate + " 00:00:00"];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "getTermsRequest",
        value: function getTermsRequest(id) {
            var selectQuery = "";
            var args = "";

            if (id != null) {
                selectQuery = "SELECT * FROM reception_handler.terms WHERE status = $1 and id = $2";
                args = [1, id];
            } else {
                selectQuery = "SELECT * FROM reception_handler.terms WHERE status = $1";
                args = [1];
            }

            return this._resource.query(selectQuery, args).then(function (response) {

                //console.log(response);
                //process.exit();
                return response;
            });
        }
    }, {
        key: "postTermsRequest",
        value: function postTermsRequest(data) {

            var insertQuery = 'INSERT INTO reception_handler.terms (terms_file) VALUES ( $1 ) RETURNING id';
            var args = [data.terms_data];

            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "allTermsRequest",
        value: function allTermsRequest() {
            var selectQuery = 'SELECT * FROM reception_handler.terms';
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "updateTermsRequest",
        value: function updateTermsRequest(id) {

            var updateQuery = 'UPDATE reception_handler.terms SET status = CASE WHEN (id = $1) THEN $2 ELSE $3 END';

            var args = [id, 1, 0];

            return this._resource.query(updateQuery, args).then(function (response) {

                file.terms.version = id;

                fs.writeFile('./src/config.json', JSON.stringify(file, null, 2), function (err) {
                    if (err) return console.log(err);
                    console.log(JSON.stringify(file));
                    console.log('writing to ' + fileName);
                });

                return response;
            });
        }
    }, {
        key: "saveStatus",
        value: function saveStatus(data) {

            var chk = new Date();
            var month = chk.getMonth() + 1;
            var myDate = [chk.getDate(), month < 10 ? '0' + month : month, chk.getFullYear()].join('-');
            var myTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

            var insertQuery = "\n                    INSERT INTO\n                    reception_handler.app_status (\n                        location\n                    )\n                    VALUES (\n                        $1\n                    )\n                    RETURNING id\n                ";

            var args = ['brc'];
            return this._resource.query(insertQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "processGraphData",
        value: function processGraphData() {
            var selectQuery = 'SELECT EXTRACT(EPOCH FROM settime) FROM reception_handler.app_status ORDER BY id DESC LIMIT 15;';
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }, {
        key: "currentStatus",
        value: function currentStatus() {
            var selectQuery = 'SELECT EXTRACT(EPOCH FROM settime) FROM reception_handler.app_status ORDER BY id DESC LIMIT 15;';
            var args = [];

            return this._resource.query(selectQuery, args).then(function (response) {
                return response;
            });
        }
    }]);

    return VisitorStore;
}();