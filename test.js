const { spawn } = require('child_process');
const request = require('request');
const test = require('tape');

// Start the app
const env = Object.assign({}, process.env, { PORT: 5000 });
const child = spawn('node', ['index.js'], { env });


test('1: order request', (t) => {
  t.plan(4);
  // Wait until the server is ready
  child.stdout.on('data', _ => {
    // Make a request to our app
    request({
      method: 'GET',
      json: true,
      url: 'http://127.0.0.1:5000/order?bread=5&apples=2&soup=2&milk=4'
    },
      (error, response, body) => {

        // stop the server
        child.kill();
        // No error
        t.false(error);
        // have results
        try {
          t.notEqual(Object.keys(body.response.basket).length, -1);
        } catch (err) {
          t.notEqual(-1, -1);
        }
      });
  });
});
