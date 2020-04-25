`use strict`
// source #https://mochajs.org/
// https://www.chaijs.com/
const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../libs/server/server')(false)
const should = chai.should();
const expect = chai.expect;
const { notify } = require('../libs/utils')
chai.use(chaiHttp);


describe('server:api', function () {

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
      .get(`/order?id=${orderID}&bread=1&milk=2&apples=3&soup=3`)
      .end(function (err, res) {
        orderResp = res.body
        done();
      });
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

        res.should.have.status(200);
        res.should.be.json;
        done();
      });
  });

  it('GET: /order results', function (done) {

    try {
      assert.equal(orderResp.success, true)
      const { basket } = orderResp.response || {}
      expect(basket['bread'].purchase).equal(1)
      expect(basket['milk'].purchase).equal(2)
      expect(basket['apples'].purchase).equal(3)
      expect(basket['soup'].purchase).equal(3)
      assert.equal(orderResp.code, 200)
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
          assert.equal(res.body.code, 200)
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
          assert.equal(res.body.code, 200)

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
          assert.equal(res.body.code, 200)
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
          assert.equal(res.body.code, 200)
        } catch (err) {
          notify(err)
          expect('success').not.equal('success')
        }
        done();
      });
  });
})