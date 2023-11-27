// import all the required packages
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const expressWinston = require("express-winston");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const responseTime = require("response-time");
const winston = require("winston");
const config = require("./config");
const square = require('./utils/getOrders');
const woo = require('./utils/getWCOrders');
const locs = require('./utils/getLocations');

// const orderData = require('./routers/ordersrouter'); 
// configure the application
const app = express();
const port = config.serverPort;
const secret = config.sessionSecret;
const store = new session.MemoryStore();

console.log('Server app');
//app.set('view engine', 'ejs');

const alwaysAllow = (_1, _2, next) => {
  next();
};

const protect = (req, res, next) => {
  const { authenticated } = req.session;

  if (!authenticated) {
    res.sendStatus(401);
  } else {
    next();
  }
};

app.disable("x-powered-by");

app.use(helmet());
app.use(responseTime());
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    statusLevels: true,
    meta: false,
    level: "debug",
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: true,
    ignoreRoute() {
      return false;
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit(config.rate));

app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: true,
    store,
  })
);

app.get("/login", (req, res) => {
  const { authenticated } = req.session;

  if (!authenticated) {
    req.session.authenticated = true;
    res.status(200).json("Successfully authenticated");
  } else {
    res.status(200).json("Already authenticated");
  }
});

app.get("/status", (request, response) => {
  const status = {
     "Status": "Running"
  };
  
  response.status(200).json(status);
});

app.get("/orders", async (req, res, next) => {
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

app.get("/products", async (req, res, next) => {
  console.log('get /products');
  // console.log( req.query );
  const products = woo.getProducts( req.query );
  console.log(products);
  products.then(data => {
    res.status(200).json(data);
  })
  .catch(err => {
    res.status(500).json(err);
  })  
});

app.get("/productorders", async (req, res, next) => {
  console.log('get /productorders');
    if ( req.query.page == undefined ) {
      req.query.page = 1;
    }
  const productorders = woo.getProductOrders( req.query );
  productorders.then( data => {
    total_pages = data.pages;
    console.log( "Items:", data.qty );
    console.log( "Net:", data.net );
    console.log( "Tax:", data.tax );
    console.log( "Total pages returned:", data.pages );

    res.status(200).json(data);
  })
  .catch( err => {
    res.status(500).json(err);
  })

});

app.get("/locations", async (req, res, next) => {
  console.log('get /locations');
  const locations = locs.getLocations( req.query );
  locations.then( data => {
    res.status(200).json(data);
  } )
  .catch( err => {
    res.status(500).json(err);
  } )    
});

Object.keys(config.proxies).forEach((path) => {
  const { protected, ...options } = config.proxies[path];
  const check = protected ? protect : alwaysAllow;
  app.use(path, check, createProxyMiddleware(options));
});

app.get("/logout", protect, (req, res) => {
  req.session.destroy(() => {
    res.status(200).json("Successfully logged out");
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});