require('dotenv').config();

const { Client, Environment, ApiError } = require("square");

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

exports.getOrders = async ( customerId ) => { 

try {
  const response = await client.ordersApi.searchOrders({
    locationIds: [
      'LJZAMNQFK7X0V'
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
            startAt: '2023-04-15T09:00:00+00:00',
            endAt: '2023-04-15T23:00:00+00:00'
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
  const data = [];
  var ticketData = [];
  let x = 0;
  if ( tickets.length > -1 ) {
    var txtOutput = '';
    data[ x ] = 'ticket_type;qty;tax;gross;discount;base_price;variation_price'
    x = x + 1;
	for (let i = 0; i < tickets.length; i++) {
		// console.log( 'Line items: ' + tickets[i].lineItems );
		ticketItems = tickets[i].lineItems;
		if ( ticketItems != undefined ) {
			// console.log( 'Items is ' + ticketItems.length );
			for (let j = 0; j < ticketItems.length; j++) {
				
				if ( ticketItems[j] != undefined ) { 
          let ticket_qty = ticketItems[j].quantity
          if ( ticketItems[j].name != undefined ) {
            let ticket_text = ticketItems[j].name;
            let ticket_type = ticket_text.replace(" Match ticket", "");
            ticket_type = ticket_type.replace("Conc", "Concession");
            ticket_type = ticket_type.replace("U18", "Under 18");
            ticket_type = ticket_type.replace("U12", "Under 12");
            ticket_type = ticket_type.replace("FAMILY ", "FAMILY of ");
            ticket_type = ticket_type.replace("NextGen 18-21", "Next Gen 18-21");
            let ticket_tax = ticketItems[j].totalTaxMoney;
            let ticket_gross = ticketItems[j].totalMoney;
            let ticket_discount = ticketItems[j].totalDiscountMoney;
            let ticket_base_price = ticketItems[j].basePriceMoney;
            let ticket_variation_price = ticketItems[j].variationTotalPriceMoney;

            // console.log( ticketItems[j]);
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
            // console.log( ticket_type );
            // txtOutput = txtOutput + '<div style="padding:2px;"><strong>' + ticket_type + '</strong> x ' + ticket_qty + '</div>' ;
            data[ x ] = ticket_type + ';' + ticket_qty + ';' + ticket_tax.amount + ';' + ticket_gross.amount + ';' + ticket_discount.amount + ';' + ticket_base_price.amount + ';' + ticket_variation_price.amount + ';';
            txtOutput = txtOutput + '<div style="padding:2px;"><strong>' + data[x] + '</div>' ;
            x = x + 1;
          } else {
            if ( ticketItems[j].itemType == 'CUSTOM_AMOUNT' ) {
              txtOutput = txtOutput + '*** Custom amount' + ' x ' + ticket_qty + '<br/>' ;
              data[ x ] = 'Custom amount' + ';' + ticket_qty + ';'
              x = x + 1;
            } else { console.log( ticketItems[j] ); }
          }
          
				};
				
			}

		}
		
	}
    console.log('Success');
    return ticketData;
  }
} catch(error) {
  console.log('Square error');
  console.log(error);
  return error;
}

}