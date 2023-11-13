require('dotenv').config();

const { Client, Environment, ApiError } = require("square");

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

exports.getLocations = async () => { 

console.log("Attempt to return locations");

try {
    const response = await client.locationsApi.listLocations()
    const result = response.result.locations
    let loc = []
        for (let i = 0; i < result.length; i++) {
            loc[i] = {};
            loc[i].id = result[i].id;
            loc[i].name = result[i].name;
        }
    return loc;
} catch( error)  {
    const errBody = JSON.parse(error.body);
    const errorDetails = errBody.errors[0];
    errorDetails.statusCode = error.statusCode;
    console.log("Error " + errorDetails.statusCode);
    return errorDetails;
}

}