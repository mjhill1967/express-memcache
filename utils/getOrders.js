require('dotenv').config();

const { Client, Environment, ApiError } = require("square");

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

exports.getOrders = async ( params ) => { 

if (params.location == undefined ) {
  params.location = 'LJZAMNQFK7X0V';  
}
if (params.startAt == undefined ) {
  params.startAt = '2023-11-05T00:00:00';  
}
if (params.endAt == undefined ) {
  params.endAt = '2023-11-05T23:59:00';  
}
console.log("Attempt to search orders");
console.log( params );
try {
  const response = await client.ordersApi.searchOrders({
    locationIds: [
      params.location
    ],
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
  tickets = response.result.orders;
  if (tickets == undefined) {
    tickets = [];
  } 
  const data = [];
  var ticketData = {};
  let x = 0;
  console.log('Found ' + tickets.length + ' records');
  if ( tickets.length > -1 ) {
    var txtOutput = '';
    data[ x ] = 'ticket_type;qty;tax;gross;discount;base_price;variation_price'
    x = x + 1;
	for (let i = 0; i < tickets.length; i++) {

		ticketItems = tickets[i].lineItems;
		if ( ticketItems != undefined ) {
			
			for (let j = 0; j < ticketItems.length; j++) {
				
				if ( ticketItems[j] != undefined ) { 
          let ticket_qty = ticketItems[j].quantity
          if ( ticketItems[j].name != undefined ) {
            let ticket_text = ticketItems[j].name;
            let ticket_type = ticket_text;
            if ( params.location == 'LJZAMNQFK7X0V' ) {
              ticket_type = ticket_text.replace(" Match ticket", "");
              ticket_type = ticket_type.replace("Conc", "Concession");
              ticket_type = ticket_type.replace("U18", "Youth (12-17)");
              ticket_type = ticket_type.replace("U12", "Child (Under 12)");
              ticket_type = ticket_type.replace("FAMILY ", "FAMILY of ");
              ticket_type = ticket_type.replace("NextGen 18-21", "Next Gen (18-23)");
              ticket_type = ticket_type.replace("NextGen 18-23", "Next Gen (18-23)");
            } else {
              console.log('Not a ticket');
            }
            let ticket_tax = ticketItems[j].totalTaxMoney;
            let ticket_gross = ticketItems[j].totalMoney;
            let ticket_discount = ticketItems[j].totalDiscountMoney;
            let ticket_base_price = ticketItems[j].basePriceMoney;
            let ticket_variation_price = ticketItems[j].variationTotalPriceMoney;

            if ( ticketData[ticket_type] == undefined ) {
              ticketData[ticket_type] = {};
              ticketData[ticket_type].qty = 0;
              ticketData[ticket_type].gross = 0;
              ticketData[ticket_type].discount = 0;
              ticketData[ticket_type].price = 0;
              ticketData[ticket_type].variation_price = 0;
              ticketData[ticket_type].tax = 0;              
            } else {
              ticketData[ticket_type].qty = ticketData[ticket_type].qty + parseInt(ticket_qty);
              ticketData[ticket_type].gross = ticketData[ticket_type].gross + parseFloat(ticket_gross.amount);
              ticketData[ticket_type].discount = ticketData[ticket_type].discount + parseFloat(ticket_discount.amount);
              ticketData[ticket_type].price = ticketData[ticket_type].price + parseFloat(ticket_base_price.amount);
              ticketData[ticket_type].variation_price = ticketData[ticket_type].variation_price + parseFloat(ticket_variation_price.amount);
              ticketData[ticket_type].tax = ticketData[ticket_type].tax + parseFloat(ticket_tax.amount);
            }
            
            // txtOutput = txtOutput + '<div style="padding:2px;"><strong>' + ticket_type + '</strong> x ' + ticket_qty + '</div>' ;
            data[ x ] = ticket_type + ';' + ticket_qty + ';' + ticket_tax.amount + ';' + ticket_gross.amount + ';' + ticket_discount.amount + ';' + ticket_base_price.amount + ';' + ticket_variation_price.amount + ';';
            txtOutput = txtOutput + '<div style="padding:2px;"><strong>' + data[x] + '</div>' ;
            x = x + 1;
          } else {
            console.log('Name is undefined');
            if ( ticketItems[j].itemType == 'CUSTOM_AMOUNT' ) {
              txtOutput = txtOutput + '*** Custom amount' + ' x ' + ticket_qty + '<br/>' ;
              data[ x ] = 'Custom amount' + ';' + ticket_qty + ';'
              x = x + 1;
            } else { console.log( ticketItems[j] ); }
          }
          
				}
				
			}

		}
		
	}
    console.log('Success');
    return ticketData;
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