const express = require('express');
const findPrime = require('./utils/findPrime');

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const n = req.query.n;

  if (!n) {
    res.render('index');
    return;
  }
  
  const prime = findPrime(n);

  const locals = { n, prime };
  res.render('index', locals);
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Example app is listening on port ${port}.`)
);