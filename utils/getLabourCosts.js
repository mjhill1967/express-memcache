require('dotenv').config();

const { Client, Environment, ApiError } = require("square");

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

exports.getLabourCosts = async ( params ) => { 

    if ( params.location == undefined ) {
        params.location = [ 'LJZAMNQFK7X0V' ];  
      } else if ( params.location == 'turnstiles' ) {
        console.log("Turnstiles");
        params.location = JSON.parse(process.env.TURNSTILES_POS);  
      } else if ( params.location == 'bars' ) {
        console.log("Bars");
        params.location = JSON.parse(process.env.BARS_POS);
      } else if ( params.location == 'food' ) {
        console.log("Food");
        params.location = JSON.parse(process.env.FOOD_POS);
      } else if ( params.location == 'retail' ) {
        console.log("Retail");
        params.location = JSON.parse(process.env.RETAIL_POS);    
      } else {
        query_str = params.location;
        params.location = query_str.split(',');
      }

      if (params.startAt == undefined ) {
        params.startAt = '2023-11-05T00:00:00+00:00';  
      }
      if (params.endAt == undefined ) {
        params.endAt = '2023-11-05T23:59:00+00:00';  
      }
      if (params.byLoc == undefined ) {
        params.byLoc = false;
      }

    console.log("Attempt to return labour costs...");
    console.log(params.startAt);
    params.startAt = params.startAt + "+00:00"
    console.log(params.endAt);
    params.endAt = params.endAt + "+00:00"

    try {
      
        const response = await client.laborApi.searchShifts({
            locationIds: 
            params.location,
          query: {
            filter: {
                start: {
                  startAt: params.startAt,
                  endAt: params.endAt,
                },
            },
          },
        limit: 100
        });
    
        console.log(response.result);
        _sqdata = response.result.shifts;
        if ( _sqdata == undefined ) {
          _sqdata = [];
        } 
        console.log('Found ' + _sqdata.length + ' records');
        // console.log(params.location);
        locations = params.location;
        var _updata = [];
        // console.log( "This query is " + params.byLoc );

        if ( _sqdata.length > -1 ) {
            if ( params.byLoc ) {

                for (let h = 0; h < locations.length; h++) {
                    // console.log( "This location is ID " + locations[h] );
                    _updata[h] = getData( _sqdata, params, locations[h] );
                }
                return _updata;

            } else {
                // console.log("All locations");
                _updata = getData( _sqdata, params, "all" );                
                return _updata;
            }
        
          } else { 
            return JSON.parse('No data found');
          }        

    } catch(error) {

        console.log(error);

    }

}

function getData( shiftdata, params, loc ) {
    console.log( params.location + " postData/loc=" + loc );

    var costData = [];
    var x = 0;
    var l = "all";
      for ( let i = 0; i < shiftdata.length; i++ ) {
        costData[x] = {};
        costData[x].location = shiftdata[i].locationId;
        var elementPos = costData.map(function(y) {return y.employee_id; }).indexOf(shiftdata[i].employeeId);
        if( elementPos != -1 ) {
            var objectFound = costData[elementPos];
            console.log(objectFound);
            console.log(elementPos);
        }
        costData[x].employee_id = shiftdata[i].employeeId;
        costData[x].category = shiftdata[i].wage.title;
        if ( shiftdata[i].wage.hourlyRate != undefined ){
        //  console.log( "Wage amount is " + shiftdata[i].wage.hourlyRate.amount );
            costData[x].wage = parseFloat(shiftdata[i].wage.hourlyRate.amount);
        //    costData[x].wage = shiftdata[i].wage;
        } else {
        //  console.log( shiftdata[i].wage );
            costData[x].wage = 0;
        }
        costData[x].status = shiftdata[i].status;
        costData[x].version = shiftdata[i].version;
        costData[x].start = shiftdata[i].startAt;
        costData[x].end = shiftdata[i].endAt;
        console.log(costData[x]);
        x = x + 1;
      }

      console.log('Success');
      return costData;

}  