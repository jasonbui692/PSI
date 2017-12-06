const fetch = require('node-fetch');
const moment = require('moment');

const {
    psi,
    hmis
} = require("./PSIconfig.json");

const {
    deMapping,
    optionSets,
    programStage,
    program
} = require("./PSIconfig.json");

const createAuthenticationHeader = (username, password) => {
    return "Basic " + new Buffer(username + ":" + password).toString("base64");
};

const pushData = async (data) => {

    let result = await fetch(`${hmis.baseUrl}/api/events?orgUnitIdScheme=code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: createAuthenticationHeader(hmis.username, hmis.password)
        },
        body: JSON.stringify(data)
    })
        .then(function (res) {
            return res;
        });

    let json = await result.json();
    return json;
};

const updateStatus = async (res, data) => {

    let payload = {
        events: []
    };

    res.response.importSummaries.forEach((re, index) => {

        //let temp = data.events.find((x) => x.event == `${re["reference"]}`);
        let status = data[index].dataValues.find((x) => x.dataElement == `MLbNyweMihi`);
        status["value"] = (re.status == "SUCCESS") ? "Synced" : "Rejected";

        let syncDate = data[index].dataValues.find((x) => x.dataElement == `N5B5r1okTqq`);
        if (syncDate != null) {
            syncDate["value"] = (re.status == "SUCCESS") ? moment().format('YYYY-MM-DDTHH:MM:SS') : "";
        } else {
            let temp = {
                dataElement: "N5B5r1okTqq",
                value: moment().format('YYYY-MM-DDTHH:MM:SS')
            };
            data[index].dataValues.push(temp);
        }

        payload.events.push(data[index]);

    })

    await fetch(psi.baseUrl + "/api/events", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: createAuthenticationHeader(psi.username, psi.password)
        },
        body: JSON.stringify(payload)
    })
        .then(function (res) {
            return res.json();
        })
        .then(json => {
            console.log(JSON.stringify(json));
        });
};

module.exports = {
    pushData,
    updateStatus
}