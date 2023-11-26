const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM

const api = new WooCommerceRestApi({
  url: 'https://fanzone.stalbanscityfc.com',
  consumerKey: 'ck_a87d5ce43359bc7a4b9cb5b36e3ef3f4a228a405',
  consumerSecret: 'cs_4c6a7b34c1d55273f94a79410c509e389863fecf',
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
            per_page: 50, // 20 products per page
            product: params.product_id,
            })
            console.log("Response Status:", response.status);
            console.log("Response Headers:", response.headers);
            console.log("Total of pages:", response.headers['x-wp-totalpages']);
            console.log("Total of orders:", response.headers['x-wp-total']);
            const result = response.data;
            // console.log(result);
            let orderitem = []
            for (let i = 0; i < result.length; i++) {
                orderitem[i] = {};
                orderitem[i].id = result[i].id;
                orderitem[i].channel = result[i].created_via;
                orderitem[i].total = result[i].total;
            }
            console.log( orderitem );
            return orderitem;

    } catch(error) {
        const errBody = JSON.parse(error.body);
        const errorDetails = errBody.errors[0];
        errorDetails.statusCode = error.statusCode;
        console.log("Product orders error " + errorDetails.statusCode);
        return errorDetails;
    }
}