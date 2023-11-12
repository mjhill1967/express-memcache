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
    return response.result;
} catch( error)  {
    const errBody = JSON.parse(error.body);
    const errorDetails = errBody.errors[0];
    errorDetails.statusCode = error.statusCode;
    console.log("Error " + errorDetails.statusCode);
    return errorDetails;
}

}