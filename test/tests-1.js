`use strict`

// asset: https://mochajs.org/
// asset: https://www.chaijs.com/


const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../libs/server/server')(false)
const should = chai.should();
const expect = chai.expect;
const { notify } = require('../libs/utils')
chai.use(chaiHttp);




/**
 * passing tests should
 */

describe('server:api | all should pass', function () {

  let port = ''
  let orderResp = null
  let orderID = new Date().getTime()


  // get current port
  before(async function (done) {
    port = server.address().port;
    done()
  });


  // create order
  before(function (done) {
    chai.request(server)
      .get(`/order?id=${orderID}&bread=5&milk=2&apples=3&soup=3`)
      .end(function (err, res) {
        orderResp = res.body
        done();
      });
  });

  after(function (done) {
    server.close();
    done();
  });


  it('server: port', function (done) {
    this.retries(2);
    const okPort = process.env.PORT || 5000
    assert.equal(okPort, Number(port))
    done()
  })


  it('status: online', function (done) {
    chai.request(server)
      .get('/')
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }

        res.should.have.status('200');
        res.should.be.json;
        done();
      });
  });

  it('GET: /order results', function (done) {

    try {
      assert.equal(orderResp.success, true)
      const { basket } = orderResp.response || {}
      expect(basket['bread'].purchase).equal(5)
      expect(basket['milk'].purchase).equal(2)
      expect(basket['apples'].purchase).equal(3)
      expect(basket['soup'].purchase).equal(3)
      assert.equal(orderResp.code, '200')
    } catch (err) {
      notify(err)
      expect('success').not.equal('success')
    }
    done()
  })


  it('GET: /store', function (done) {
    chai.request(server)
      .get('/store')
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        try {
          assert.equal(res.body.success, true)
          expect(Object.keys(res.body.response.menu).length).above(0)
          assert.equal(res.body.code, '200')
        } catch (err) {
          notify(err)
          expect('error').not.equal('success')
        }
        done();
      });
  });

  it('GET: /offers', function (done) {
    chai.request(server)
      .get('/offers')
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        try {
          assert.equal(res.body.success, true)
          const storeItems = res.body.response
          expect(storeItems['store'].length).above(0)
          expect(storeItems['basket'].length).above(0)
          assert.equal(res.body.code, '200')

        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });

  it(`GET: /shoppingcard?id=${orderID}`, function (done) {
    chai.request(server)
      .get(`/shoppingcard?id=${orderID}`)
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        try {
          assert.equal(res.body.success, true)
          const { card } = res.body.response || {}
          expect(Object.keys(card).length).equal(4)
          assert.equal(res.body.code, '200')
        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });

  it(`GET: /update?id=${orderID}`, function (done) {
    chai.request(server)
      .get(`/update?id=${orderID}&apples=7&bread=7`)
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        try {
          assert.equal(res.body.success, true)
          const { basket } = res.body.response || {}
          expect(basket['bread'].purchase).equal(7)
          expect(basket['apples'].purchase).equal(7)
          assert.equal(res.body.code, '200')
        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });

  it(`GET: /order  make new order`, function (done) {
    let orderID = new Date().getTime().toString()
    chai.request(server)
      .get(`/order?id=${orderID}&bread=500&milk=200&apples=310&soup=300&bananas=10&blah=-1`)
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        try {
          assert.equal(res.body.success, true)
          const { basket, offers, id } = res.body.response || {}

          expect(id).equal(orderID)
          expect(offers[0]).equal('Buy 2 or more tins of soup and get a loaf of bread for half price')
          expect(basket['bread'].purchase).equal(500)
          expect(basket['milk'].purchase).equal(200)
          expect(basket['apples'].purchase).equal(310)
          expect(basket['soup'].purchase).equal(300)
          expect(basket['bananas'].message).equal('sorry we dont have item: bananas in our store')
          assert.equal(res.body.code, '200')
        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });
})



/**
 * failing tests should
 */
describe('server:api | all should fail', function () {
  let orderID = new Date().getTime()
  // get current port

  after(function (done) {
    server.close();
    done();
  });

  it(`GET: /order should fail on empty query`, function (done) {
    chai.request(server)
      .get(`/order`)
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        //console.log('res.body', res.body)
        try {
          assert.notEqual(res.body.success, true)

          expect(res.body.response).undefined
          expect(res.body.message).equal('query for /order is required, but it was empty')

          assert.equal(res.body.code, '004')
        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });

  it(`GET: /update should be empty without initial order`, function (done) {
    chai.request(server)
      .get(`/update?id=${orderID}`)
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        try {
          assert.notEqual(res.body.success, true)

          expect(res.body.response).undefined
          expect(res.body.message).equal('SimpleOrder sorry your entry request has invalid parameters')

          assert.equal(res.body.code, '015')
        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });

  it(`GET: /shoppingcard?id=${orderID} should be empty`, function (done) {
    chai.request(server)
      .get(`/shoppingcard?id=${orderID}`)
      .end(function (err, res) {
        if (err) {
          expect('success').not.equal('success')
          return
        }
        try {
          assert.notEqual(res.body.success, true)
          expect(res.body.response).undefined
          expect(res.body.message).equal('SimpleOrder shoppingcard() sorry no cart details found for this id')

          assert.equal(res.body.code, '013')
        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });
})