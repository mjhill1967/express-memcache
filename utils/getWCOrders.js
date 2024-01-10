const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM

const api = new WooCommerceRestApi({
  url: 'https://fanzone.stalbanscityfc.com',
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  version: 'wc/v3'
});

exports.getProducts = async ( params ) => {
    try{
        const response = await api.get("products", {
            per_page: 20, // 20 products per page
            category: 100,
            })
            console.log("Response Status:", response.status);
            console.log("Response Headers:", response.headers);
            console.log("Total of pages:", response.headers['x-wp-totalpages']);
            console.log("Total of products:", response.headers['x-wp-total']);
            const result = response.data;
            // console.log(result);
            let prod = []
            for (let i = 0; i < result.length; i++) {
                prod[i] = {};
                prod[i].id = result[i].id;
            //    prod[i].orders = woo.getProductOrders( {product: prod[i].id} );
                prod[i].name = result[i].name;
                prod[i].type = result[i].type;
                prod[i].total_sales = result[i].total_sales;
            }
            console.log( prod );
            return prod;

    } catch(error) {
        const errBody = JSON.parse(error.body);
        const errorDetails = errBody.errors[0];
        errorDetails.statusCode = error.statusCode;
        console.log("Products error " + errorDetails.statusCode);
        return errorDetails;
    }
}

exports.getProductOrders = async ( params ) => {
    try{
        const response = await api.get("orders", {
            per_page: 50, // 50 products per page
            product: params.product_id,
            page: params.page,
            })
            // console.log("Response Status:", response.status);
            // console.log("Response Headers:", response.headers);
            // console.log("Total of pages:", response.headers['x-wp-totalpages']);
            // console.log("Total of orders:", response.headers['x-wp-total']);
            const result = response.data;
            const total_pages = response.headers['x-wp-totalpages'];
            // console.log("Total pages:", total_pages );
            // console.log( "Current page:", params.page );

            var orderitem = []
            var total_qty = 0;
            var total_net = 0;
            var total_tax = 0;
            var subtotal_net = 0;
            var subtotal_tax = 0;


            for ( let i = 0; i < result.length; i++) {
                let data = {};
                data.id = result[i].id;
                data.channel = result[i].created_via;
                data.total = result[i].total;
                data.discount_total = parseFloat( result[i].discount_total ) + parseFloat( result[i].discount_tax );
                data.coupons = result[i].coupon_lines;
                data.status = result[i].status;
                data.payment_method = result[i].payment_method;
             //   if ( data.discount_total > 0 ) {
             //       console.table( data.coupons );
             //       console.log( data.discount_total );
             //       console.log( data.total );
             //   }
                if ( data.status == 'completed' || data.status == 'processing') {
                    data.items = [];
                    for ( let j = 0; j < result[i].line_items.length; j++) {
                        item = {};

                      //  console.log(result[i].line_items[j].name);
                      //  console.log(result[i].line_items[j].quantity);
                      //  console.log(result[i].line_items[j].total);
                      //  console.log(result[i].line_items[j].subtotal);

                        item.name = result[i].line_items[j].name;
                        item.product_id = result[i].line_items[j].product_id;
                        item.qty = result[i].line_items[j].quantity;
                        total_qty = total_qty + item.qty;
                        item.total = result[i].line_items[j].total;
                        item.subtotal = result[i].line_items[j].subtotal;
                        item.net = result[i].line_items[j].total;
                        total_net = total_net + parseFloat(item.net);
                        subtotal_net = subtotal_net + parseFloat(item.subtotal);
                        item.tax = result[i].line_items[j].total_tax;
                        item.subtotal_tax = result[i].line_items[j].subtotal_tax;
                        subtotal_tax = subtotal_tax + parseFloat(item.subtotal_tax);
                        total_tax = total_tax + parseFloat(item.tax);
                        if ( item.total != item.net ) {
                            console.log('Total different to sub-total');
                            console.log(result[i].line_items);
                        }
                        if ( params.product_id == item.product_id ) {
                            data.items.push( item );
                        }
                    }                    
                    orderitem.push( data );
                }
            }
            var info = {};
            info.pages = total_pages;
            info.thispage = params.page;
            info.qty = total_qty;
            info.net = total_net;
            info.tax = total_tax;
            info.subtotal_net = subtotal_net;
            info.subtotal_tax = subtotal_tax;
            info.id = params.product_id;
            // console.table( info );
            orderitem.push( info );
            return orderitem;

    } catch( error ) {
        const errBody = JSON.parse(error.body);
        const errorDetails = errBody.errors[0];
        errorDetails.statusCode = error.statusCode;
        console.log("Product orders error " + errorDetails.statusCode);
        return errorDetails;
    }
    console.log("Now get page:", current_page);
    getProductOrders( { page: current_page } );

}