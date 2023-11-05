const { Router } = require('express');
const protect = require('../utils/protect');
// const orders = require('../controllers/orderscontroller')
const square = require('../utils/getOrders');
const router = Router(); 

router.get('/orders', protect, async (req, res) => {
    console.log('get /orders');
    console.log( req.query );
    const orders = square.getOrders( req.query );
  
    orders.then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(500).json(err);
    })
  });

module.exports = router;
