process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const {
    getEvents,
    getOrgUnits,
    transformPSI,
    filterStatus
} = require("./utils.js");

const {
    pushData,
    updateStatus    
} = require("./push-data.js");

const jsonfile = require("jsonfile");

// const moment = require('moment');
// console.log(moment().format('YYYY/MM/DDTHH:MM:SS'));
// return;

(async() => {

    let data = await getEvents("RjBwXyc5I66", 1);
    let orgUnits = await getOrgUnits();
    let penddingData = filterStatus(data, "Pendding");
    // console.log(JSON.stringify(data));
    let pushD = transformPSI(penddingData, orgUnits);
    // pushD.events[0].orgUnit = "asdasdasdasdasd";
    // pushD.events[2].dataValues[0].dataElement = "sdfsdfsdfsdfsdfsdf";
    //console.log(JSON.stringify(pushD));
    let response = await pushData(pushD);
    console.log(JSON.stringify(penddingData));
    updateStatus(response, penddingData);

})()