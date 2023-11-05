const square = require('../utils/getOrders');

module.exports = (req, res) => {
    console.log('get /orders');
    console.log( req.query );
    const orders = square.getOrders( req.query );
  
    orders.then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json(err);
    })
  };