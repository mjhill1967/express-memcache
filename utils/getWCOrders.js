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
            console.log("Total of pages:", response.headers['x-wp-totalpages']);
            console.log("Total of orders:", response.headers['x-wp-total']);
            const result = response.data;
            const total_pages = response.headers['x-wp-totalpages'];
            console.log("Total pages:", total_pages );
            console.log( "Current page:", params.page );

            var orderitem = []
            var total_qty = 0;
            var total_net = 0;
            var total_tax = 0;

            for ( let i = 0; i < result.length; i++) {
                let data = {};
                data.id = result[i].id;
                data.channel = result[i].created_via;
                data.total = result[i].total;
                data.status = result[i].status;
                data.payment_method = result[i].payment_method;
                data.items = [];
                for ( let j = 0; j < result[i].line_items.length; j++) {
                    item = {};
                    item.name = result[i].line_items[j].name;
                    item.product_id = result[i].line_items[j].product_id;
                    item.qty = result[i].line_items[j].quantity;
                    total_qty = total_qty + item.qty;
                    item.net = result[i].line_items[j].subtotal;
                    total_net = total_net + parseInt(item.net);
                    item.tax = result[i].line_items[j].subtotal_tax;
                    total_tax = total_tax + parseInt(item.tax);
                    if ( params.product_id == item.product_id ) {
                        data.items.push( item );
                    }
                }
                orderitem.push( data );
            }
            orderitem.pages = total_pages;
            orderitem.qty = total_qty;
            orderitem.net = total_net;
            orderitem.tax = total_tax;
            return orderitem;

    } catch(error) {
        const errBody = JSON.parse(error.body);
        const errorDetails = errBody.errors[0];
        errorDetails.statusCode = error.statusCode;
        console.log("Product orders error " + errorDetails.statusCode);
        return errorDetails;
    }
    // console.log("Now get page:",current_page);
    // getProductOrders( { page: current_page } );

}