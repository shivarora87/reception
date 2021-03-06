
"use strict";
var fs = require("fs");
var pdf = require("html-pdf");
var exec = require("child_process").exec;
import config from "../config.json";
import {_} from "lodash";
var dateFormat = require("dateformat");

export class VisitorService {

    constructor (visitorStore, templateManager, logger, tabletCache) {
        this._visitorStore = visitorStore;
        this._templateManager  = templateManager;
        this._logger = logger;
        this._tabletCache = tabletCache;
    }

    postVisitor(tabId, data) {
        this._logger.info("Saving Data");

                return this._visitorStore.postVisitor(tabId, data)
                    .then((res) => {
                        return res;
                    })
                    .then(result => {
                        //render the template
                        let visitorId = result.id;
                        var html = this._templateManager.render("crom_visitor", result);

                        var options = {
                            format: "A5",
                            orientation: "landscape"
                        };

                        pdf.create(html, options).toFile( config.pdfPath + visitorId + ".pdf", function(err, pdfRes) {
                            if (err){
                                return console.log(err);
                            }

                            var cmd = '"lp -d brc-reception ' + config.pdfPath +  visitorId + '.pdf"';
                            exec(cmd, function(error, stdout, stderr) {
                                // command output is in stdout
                                console.log(stdout);

                                if (error !== null) {
                                    console.log("exec error: " + error);
                                }
                            });
                        });
                        return visitorId;
                    });
    }

    getVisitors(id) {
        return this._visitorStore.getVisitors(id)
            .then((data) => {
                return data;
            });
    }

    allVisitorsSignIn (tabId) {
        this._logger.info("Getting All Visitors!");
        this._logger.info("Getting Data");
        return this._visitorStore.allVisitorsSignIn(tabId)
            .then((data) => {
                return data;
            });
    }

    updateVisitor (id, data) {

        this._logger.info("Existing Customer!");
        this._logger.info("Signing out");

        return this._visitorStore.updateVisitor(id, data)
            .then((data) => {
                return data;
            });
    }

    allSignOut(){

        this._logger.info("Signing Out All Visitors!");

        return this._visitorStore.allSignOut()
            .then(() => {
                return true;
            });
    }

    allVisitorsSignOut(){

        this._logger.info("All Signed Out Today!");

        return this._visitorStore.allVisitorsSignOut()
            .then((result) => {
                _.each(result.rows , function (value, key) {
                     value.signout = dateFormat(value.signout, "dd-mm-yyyy HH:MM:ss");
                });
                return result;
            });
    }

    getTermsRequest(id) {
        return this._visitorStore.getTermsRequest(id)
            .then((result) => {
                let row = result.rows;

                if(row[0].id !== config.terms.version) {
                    fs = require("fs");
                    fs.writeFile("./src/templates/terms_" + row[0].id + ".hbs", row[0].terms_file, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("Terms file created");
                    });
                }
                return "terms_" + row[0].id ;
            });
    }


    postTermsRequest(data) {
        return this._visitorStore.postTermsRequest(data)
            .then((result) => {
                let row = result.rows;
                if(row[0].id !== config.terms.version) {
                    fs = require("fs");
                    fs.writeFile("./src/templates/terms_" + row[0].id + ".hbs", row[0].terms_file, function (err) {
                        if (err){
                            return console.log(err);
                        }
                        console.log("Terms file created");
                    });
                }
                return "terms_" + row[0].id ;
            });
    }

    allTermsRequest(){
        this._logger.info(" Getting All Terms!");

        return this._visitorStore.allTermsRequest()
            .then((result) => {
                return result;
            });
    }

    updateTermsRequest(id){
        this._logger.info(" Updating Term!");

        return this._visitorStore.updateTermsRequest(id)
            .then((result) => {
                return result;
            });
    }

    processStatus (data) {
        //this._logger.info(JSON.stringify(data));
        return this._visitorStore.saveStatus(data)
            .then((res) => {
                return res;
            });
    }

    cleanStatus () {
        //this._logger.info(JSON.stringify(data));
        return this._visitorStore.cleanStatus()
            .then((res) => {
                return res;
            });
    }

    processGraphData() {

        this._logger.info("getting graph data!");

        return this._visitorStore.processGraphData()
            .then((result) => {

                var setData = [];

                _.forEach(result.rows, (value, key) => {
                    let setkey = this.timeConverter(value.date_part);
                    let setVal = value.status;
                    setData.push(JSON.stringify({setkey, setVal}));
                });

                return setData;
            });
    }

    currentStatus() {
        this._logger.info("Current Device Status!");

        return this._visitorStore.currentStatus()
            .then((data) => {

                var setData = [];
                _.forEach(data.rows, (value, key) => {

                    let setkey = this.timeConverter(value.date_part);
                    let setVal = value.status;
                    setData.push(JSON.stringify({setkey, setVal}));
                });
                return setData;
            });
    }


    timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var time = dateFormat(a, "yyyy-mm-dd HH:MM:ss");
        return time;
    }

    // Auto Complete functionality

    autoComplete() {
        return this._visitorStore.autoComplete()
            .then((res) => {
                _.forEach(res.rows, (value, key) => {
                    if(value.type === "visitor_name"){
                        value.type = "Visitor Name";
                    }
                });
                return res;
            });
    }

    autoCompletePost(data) {
        //this._logger.info(JSON.stringify(data));
        return this._visitorStore.autoCompletePost(data)
            .then((res) => {
                return res;
            })
            .then((result) => {
                return this._visitorStore.autoCompleteId(result.rows[0].id);
            });
    }

    updateAutoComplete(id, data){
        return this._visitorStore.updateAutoComplete(id, data)
            .then((res) => {
                return res;
            })
            .then((result) => {
                return this._visitorStore.autoCompleteId(id);
            });
    }

    deleteAutoComplete(id){
        return this._visitorStore.deleteAutoComplete(id)
            .then((res) => {
                return res;
            });
    }


    //Staff information

    allStaff(tabId){
        return this._visitorStore.allStaff(tabId)
            .then((res) => {
                return res;
            });
    }

    staffData(id){
        return this._visitorStore.staffData(id)
            .then((res) => {
                return res;
            });
    }

    staffSignIn(id){
        return this._visitorStore.staffSignIn(id)
            .then((res) => {
                return res;
            });
    }

    staffSignOut(id){
        return this._visitorStore.staffSignOut(id)
            .then((res) => {
                return res;
            });
    }

    // All staff signed In
    staffSignedIn(id){
        return this._visitorStore.staffSignedIn(id)
            .then((res) => {
                _.each(res.rows , function (value, key) {
                    value.signin_time = dateFormat(value.signin_time, "dd-mm-yyyy HH:MM:ss");
                });
                return res;
            });
    }

    // All staff signed Out
    staffSignedOut(id){
        return this._visitorStore.staffSignedOut(id)
            .then((res) => {

                _.each(res.rows , function (value, key) {
                    value.signout_time = dateFormat(value.signout_time, "dd-mm-yyyy HH:MM:ss");
                    value.signin_time = dateFormat(value.signin_time, "dd-mm-yyyy HH:MM:ss");
                });

                return res;
            });
    }

    // All Visitors print out
    allPrintOut(id){
        return this._visitorStore.allPrintOut()
            .then((res) => {
                _.each(res.rows , function (value, key) {
                    if(value.signin_time !== "undefined"){
                        value.signin_time = dateFormat(value.signin_time, "HH:MM:ss");
                    }
                });
                return res;
            })
            .then(result => {

                if(id === 1) {
                    result.rows.todayDate = dateFormat(result.rows.todayDate, "dd-mm-yyyy");

                    //render the Staff
                    var html = this._templateManager.render("allStaffPrintOut", {data: result.rows});

                    var options = {
                        format: "A5",
                        orientation: "landscape",
                        header: {
                            "height": "24mm",
                            "contents": '<div style="text-align: center;font-size: 20px;"><b>BRC Staff</b></div>' +
                            '<div><b>Date :</b>'+ result.rows.todayDate +'</div>'+
                            '<div style="float: left"><div style="border: 1px solid #dddddd;text-align: left;padding: 8px;width: 505px;float: left;">Name</div>'+
                            '<div style="border: 1px solid #dddddd;text-align: left;padding: 8px;width: 227px;float: left;">Signed In</div>'+
                            '<div style="border: 1px solid #dddddd;text-align: left;padding: 8px;width: 187px;float: left;">Status</div>'+
                            '</div>'
                        },
                        footer: {
                            "height": "10mm",
                            "contents": '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
                        }
                    };

                    pdf.create(html, options).toFile( config.pdfPath + 'allStaff.pdf', function (err, pdfRes) {

                        var cmd = '"lp -d brc-reception' +  config.pdfPath + 'allStaff.pdf"';

                        exec(cmd, function (error, stdout, stderr) {
                            console.log(stdout);

                            if (error !== null) {
                                console.log("exec error: " + error);
                            }
                        });
                    });

                    if(result.visitors != null) {

                        _.each(result.visitors , function (value, key) {
                            if(value.settime !== "undefined"){
                                var s = value.settime.substr(0,value.settime.indexOf(" "));
                                var b = s.split(/\D/);
                                value.settime = b.reverse().join("-") + " " + value.settime.substr(value.settime.indexOf(" ")+1);
                            }
                        });

                        result.visitors.todayDate = dateFormat(result.visitors.todayDate, "dd-mm-yyyy");


                        _.each(result.visitors , function (value, key) {
                            if(value.settime !== "undefined"){
                                value.settime = dateFormat(value.settime, "HH:MM:ss");
                            }
                        });



                        //render the Visitors
                        var html = this._templateManager.render("allVisitorsPrintOut", {data: result.visitors});

                        var options = {
                            format: "A5",
                            orientation: "landscape",
                            header: {
                                "height": "24mm",
                                "contents": '<div style="text-align: center;font-size:20px;"><b>BRC Site Visitors</b></div>' +
                                            '<div><b>Date :</b>'+ result.visitors.todayDate +'</div>'+
                                            '<div style="float: left"><div style="border: 1px solid #dddddd;text-align: left;padding: 8px; width: 82px;float: left;">Id</div>'+
                                            '<div style="border: 1px solid #dddddd;text-align: left;padding: 8px;width: 255px;float: left;">Name</div>'+
                                            '<div style="border: 1px solid #dddddd;text-align: left;padding: 8px;width: 272px;float: left;">Visiting</div>'+
                                            '<div style="border: 1px solid #dddddd;text-align: left;padding: 8px;width: 133px;float: left;">Signed In</div>'+
                                            '<div style="border: 1px solid #dddddd;text-align: left;padding: 8px;width: 139px;float: left;">Status</div>'+
                                            '</div>'
                            },
                            footer: {
                                "height": "10mm",
                                "contents": '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
                            }

                        };

                        pdf.create(html, options).toFile( config.pdfPath + "allVisitors.pdf", function (err, pdfRes) {

                            var cmd = '"lp -d brc-reception' +  config.pdfPath +'allVisitors.pdf"';
                            exec(cmd, function (error, stdout, stderr) {
                                console.log(stdout);

                                if (error !== null) {
                                    console.log("exec error: " + error);
                                }
                            });
                        })
                    }

                }

                return result;
            })
    }

    //FireMarshall Functionality
    addFireMarshall (data) {
        return this._visitorStore.addFireMarshall(data)
            .then((res) => {
                return res;
            })
    }

    updateFireMarshall (id, data) {
        return this._visitorStore.updateFireMarshall(id, data)
            .then((res) => {
                return res;
            })
    }

    allFireMarshall () {
        return this._visitorStore.allFireMarshall()
            .then((res) => {
                return res;
            })
    }

    deleteFireMarshall (id) {
        return this._visitorStore.deleteFireMarshall(id)
            .then((res) => {
                return res;
            })
    }

    fireMarshallMail () {
        return this._visitorStore.fireMarshallMail()
            .then((res) => {
                return res;
            })
    }

    //FirstAid Functionality
    postFirstAid (data) {
        return this._visitorStore.postFirstAid(data)
            .then((res) => {
                return res;
            })
    }

    updateFirstAid (id, data) {
        return this._visitorStore.updateFirstAid(id, data)
            .then((res) => {
                return res;
            })
    }

    allFirstAid () {
        return this._visitorStore.allFirstAid()
            .then((res) => {
                return res;
            })
    }

    deleteFirstAid (id) {
        return this._visitorStore.deleteFirstAid(id)
            .then((res) => {
                return res;
            })
    }


    //Search
    searchAllSignIns (id) {

        this._logger.info("Getting All Visitors!");
        this._logger.info("Getting Data");
        return this._visitorStore.searchAllSignIns(id)
            .then((data) => {
                return data;
            })
    }

    //NFC Activity
    nfcActivity (id) {
        return this._visitorStore.nfcActivity(id)
            .then((res) => {
                return res;
            })
    }

    //Functionality for Tablets
    addTablet () {
        return this._visitorStore.addTablet()
            .then((res) => {
                return res;
            })
    }

    tabletPost(data) {
        return this._visitorStore.tabletPost(data)
            .then((res) => {
                return res;
            })
    }

    allTablet() {
        return this._visitorStore.allTablet()
            .then((res) => {
                return res;
            })
    }

    allTabletLocations() {
        return this._visitorStore.allTabletLocations()
            .then((res) => {
                return res;
            })
    }

    updateTablet(id, data){
        return this._visitorStore.updateTablet(id, data)
            .then((res) => {
                return res;
            })
    }

    deleteTabletDept(id){
        return this._visitorStore.deleteTabletDept(id)
            .then((res) => {
                return res;
            })
    }
}
