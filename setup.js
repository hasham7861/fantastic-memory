// node modules
const express = require("express");
const process = require("process");
const next = require('next');

// load up server and frontend module
const backend = require('./server');
const frontend = next({ dev: process.env.NODE_ENV !== 'production' });

(async () => {
  try {
    await frontend.prepare();
  } catch (err) {
    console.error(ex.stack)
    process.exit(1)
  }

  const PORT = process.env.PORT | "5000";

  // Setup
  const setup = express();
  setup.use(express.json());
  setup.use(backend);

  setup.get('*',(req, res) => {
    return frontend.getRequestHandler()(req, res);
  })
  setup.listen(PORT, (err) => {
    if (err) throw err
    console.log('> Listening in on Port:', PORT)
  })

})()


