require('dotenv').config();

const { Client, Environment, ApiError } = require("square");

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

exports.getOrders = async ( params ) => { 
//  console.log( params );
if (params.location == undefined ) {
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
  params.startAt = '2023-11-05T00:00:00';  
}
if (params.endAt == undefined ) {
  params.endAt = '2023-11-05T23:59:00';  
}
if (params.byLoc == undefined ) {
  params.byLoc = false;
}
if (params.cursor == undefined ) {
  params.cursor = '';
}

try {
  const response = await client.ordersApi.searchOrders({
    cursor:
      params.cursor,    
    locationIds: 
      params.location,
    query: {
      filter: {
        stateFilter: {
          states: [
            'COMPLETED'
          ]
        },
        dateTimeFilter: {
          closedAt: {
            startAt: params.startAt,
            endAt: params.endAt
          }
        }
      },
      sort: {
        sortField: 'CLOSED_AT',
        sortOrder: 'DESC'
      }
    }
  });
  _sqdata = response.result.orders;
  let _cursor = response.result.cursor;
  if ( _sqdata == undefined ) {
    _sqdata = [];
  } 
  // console.log('Found ' + _sqdata.length + ' records');
  locations = params.location;
  var _updata = [];
  if ( _sqdata.length > -1 ) {
    if ( params.byLoc ) {
      for (let h = 0; h < locations.length; h++) {
      //  console.log( "This location is ID " + locations[h] );
        _updata[h] = getData( _sqdata, params, locations[h] );
      }
      return _updata;
    } else {
        _updata = getData( _sqdata, params, "all" );
        if ( _cursor != undefined ) {
          _updata.cursor = _cursor;
        }
      return _updata;
    }

  } else { 
    return JSON.parse('No data found');
  }
} catch( error)  {
    const errBody = JSON.parse(error.body);
    const errorDetails = errBody.errors[0];
    errorDetails.statusCode = error.statusCode;
    console.log("Error " + errorDetails.statusCode);
    return errorDetails;
  }    

}

function getData( tickets, params, loc ) {
  // console.log( params.location + " getData/loc=" + loc );
  var ticketData = {};
  var ticketItems = [];
  var l = "all";
  // console.log("Number of items is " + tickets.length );
	for ( let i = 0; i < tickets.length; i++ ) {
    // console.log( tickets[i].locationId );
		ticketItems = tickets[i].lineItems;
		
		if ( ticketItems != undefined ) {
        // console.log( ticketItems );      
        l = tickets[i].locationId;
        if ( loc == "all" ) { 
          l = loc; 
        }
			for (let j = 0; j < ticketItems.length; j++) {
        // console.log( ticketItems[j] );
				if ( ticketItems[j] != undefined && l == loc ) { 
          let ticket_qty = ticketItems[j].quantity
          let ticket_text = ticketItems[j].name;
            if ( ticket_text == undefined ) { 
              ticket_text = "Custom amount"; 
            }
            let ticket_type = ticket_text;
            if ( tickets[i].locationId == "LJZAMNQFK7X0V" ) {
              ticket_type = ticket_text.replace(" Match ticket", "");
              ticket_type = ticket_type.replace("Conc", "Concession");
              ticket_type = ticket_type.replace("U18", "Youth (12-17)");
              ticket_type = ticket_type.replace("U12", "Junior (5-11)");
              ticket_type = ticket_type.replace("U5", "Infant (0-4)");
              ticket_type = ticket_type.replace("FAMILY ", "FAMILY of ");
              ticket_type = ticket_type.replace("NextGen 18-21", "Next Gen (18-23)");
              ticket_type = ticket_type.replace("NextGen 18-23", "Next Gen (18-23)");
              ticket_type = ticket_type.replace("CUSTOM AMOUNT", "Other");
            }
            let ticket_tax = ticketItems[j].totalTaxMoney;
            let ticket_gross = ticketItems[j].totalMoney;
            let ticket_discount = ticketItems[j].totalDiscountMoney;
            let ticket_base_price = ticketItems[j].basePriceMoney;
            let ticket_variation_price = ticketItems[j].variationTotalPriceMoney;

            if ( ticketData[ticket_type] == undefined ) {
              ticketData[ticket_type] = {};
              ticketData[ticket_type].qty = parseInt(ticket_qty);
              ticketData[ticket_type].gross = parseFloat(ticket_gross.amount);
              ticketData[ticket_type].discount = parseFloat(ticket_discount.amount);
              ticketData[ticket_type].price = parseFloat(ticket_base_price.amount);
              ticketData[ticket_type].variation_price = parseFloat(ticket_variation_price.amount);
              ticketData[ticket_type].tax = parseFloat(ticket_tax.amount);
              ticketData[ticket_type].location_id = tickets[i].locationId;              
            } else {
              ticketData[ticket_type].qty = ticketData[ticket_type].qty + parseInt(ticket_qty);
              ticketData[ticket_type].gross = ticketData[ticket_type].gross + parseFloat(ticket_gross.amount);
              ticketData[ticket_type].discount = ticketData[ticket_type].discount + parseFloat(ticket_discount.amount);
              ticketData[ticket_type].price = ticketData[ticket_type].price + parseFloat(ticket_base_price.amount);
              ticketData[ticket_type].variation_price = ticketData[ticket_type].variation_price + parseFloat(ticket_variation_price.amount);
              ticketData[ticket_type].tax = ticketData[ticket_type].tax + parseFloat(ticket_tax.amount);
              ticketData[ticket_type].location_id = tickets[i].locationId;
            }
            console.log("Completed " + i);
				} else {
          console.log("No match for location " + l );
        }
				
			}

		}
		
	}
    console.log('Success');

    return ticketData;
}

exports.listOrders = async ( params ) => {
// async function listOrders() {
  let limit = 500;
 // console.log( params );
if (params.location == undefined ) {
  params.location = [ 'LJZAMNQFK7X0V' ];  
} else if ( params.location == 'turnstiles' ) {
  params.location = JSON.parse(process.env.TURNSTILES_POS);  
} else if ( params.location == 'bars' ) {
  params.location = JSON.parse(process.env.BARS_POS);
} else if ( params.location == 'food' ) {
  params.location = JSON.parse(process.env.FOOD_POS);
} else if ( params.location == 'retail' ) {
  params.location = JSON.parse(process.env.RETAIL_POS);    
} else {
  query_str = params.location;
  params.location = query_str.split(',');
}
if (params.startAt == undefined ) {
  params.startAt = '2023-11-05T00:00:00';  
}
if (params.endAt == undefined ) {
  params.endAt = '2023-11-05T23:59:00';  
}
if (params.byLoc == undefined ) {
  params.byLoc = false;
}
if (params.cursor == undefined ) {
  params.cursor = '';
}

  try {
    var _updata = [];
    let listOrdersResponse = await client.ordersApi.searchOrders({
    cursor: undefined,
    limit: limit,    
    locationIds: params.location,
    query: {
      filter: {
        stateFilter: {
          states: [
            'COMPLETED'
          ]
        },
        dateTimeFilter: {
          closedAt: {
            startAt: params.startAt,
            endAt: params.endAt
          }
        }
      },
      sort: {
        sortField: 'CLOSED_AT',
        sortOrder: 'DESC'
      }      
    }
  });

    while (!isEmpty(listOrdersResponse.result)) {
      let orders = listOrdersResponse.result.orders;
      locations = params.location;
      // console.log( locations );
      if ( params.byLoc ) {
        for (let h = 0; h < locations.length; h++) {
           console.log( "This location is ID " + locations[h] );
          _updata[h] = getData( _sqdata, params, locations[h] );
        }
      } else {
        _dataset = getData( orders, params, "all" );
        _updata.push( _dataset );
      }

      let cursor = listOrdersResponse.result.cursor;
      if ( cursor ) {
        listOrdersResponse = await client.ordersApi.searchOrders({
          cursor: cursor,
          limit: limit,    
          locationIds: params.location,
          query: {
            filter: {
              stateFilter: {
                states: [
                  'COMPLETED'
                ]
              },
              dateTimeFilter: {
                closedAt: {
                  startAt: params.startAt,
                  endAt: params.endAt
                }
              }
            },
            sort: {
              sortField: 'CLOSED_AT',
              sortOrder: 'DESC'
            }      
          }
      });
      } else {
        return _updata;
        // break;
      }
    }

  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
      return json.parse('API error. Please check logs');
    } else {
      console.log("Unexpected error occurred: ", error);
      return json.parse('Unexpected error occurred: ' + error);
    }
  }
};

function isEmpty(obj) {
  return !Object.keys(obj).length;
}