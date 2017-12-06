const fetch = require("node-fetch");

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

//RjBwXyc5I66
//&startDate=2017-09-09&endDate=2017-10-09&skipPaging=true
const getEvents = async(program, status) => {
    let result = await fetch(`${psi.baseUrl}/api/events.json?program=${program}&skipPaging=true`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: createAuthenticationHeader(psi.username, psi.password)
            }
        })
        .then(function(res) {
            return res;
        });

    let json = await result.json();
    return json;
};

const getOrgUnits= async() => {
    let result = await fetch(`${psi.baseUrl}/api/programs/RjBwXyc5I66.json?fields=organisationUnits[id,name,code,coordinates,attributeValues,parent[name]]`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: createAuthenticationHeader(psi.username, psi.password)
            }
        })
        .then(function(res) {
            return res;
        });

    let json = await result.json();
    return json;
};

const filterStatus = (data, status) => {
    return data.events.filter((x) => x.dataValues.find((y) => y.value == `${status}`));
};

const transformPSI = (cases, orgUnits) => {

    let payload = {
        events: []
    };
    cases.forEach(c => {

        let org = orgUnits.organisationUnits.find(x => x.id == c.orgUnit);
        let cordinate = org.coordinates.replace("[","").replace("]","").split(",");
        let orgCode = org.attributeValues[0].value;

        let event = {
            event: c["event"],
            eventDate: c["eventDate"],
            orgUnit: orgCode,
            program: program[c["program"]],
            programStage: programStage[c["programStage"]],
            coordinate: {
                latitude: Number(cordinate[1]),
                longitude: Number(cordinate[0])
            },
            dataValues: [{
                dataElement: "XJvCy70VHLY",
                value: "1"
            }]
        };

        for (var key in deMapping) {

            let temp = c.dataValues.find((x) => x.dataElement == `${key}`);
            if (temp != null) {
                let dataValue = {};
                dataValue["dataElement"] = deMapping[key].mapping;
                dataValue["value"] = (deMapping[key].optionSet) ? optionSets[deMapping[key].optionSet][temp.value] : temp.value;
                event.dataValues.push(dataValue);
            }
        }
        payload.events.push(event);
    });
    return payload;
};


module.exports = {
    getEvents,
    getOrgUnits,
    transformPSI,
    filterStatus
}