
// source #https://mochajs.org/

var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../libs/server/server')
var should = chai.should();
chai.use(chaiHttp);
// describe('Array', function () {
//     describe('#indexOf()', function () {
//         it('should return -1 when the value is not present', function () {
//             assert.equal([1, 2, 3].indexOf(4), -1);
//         });
//     });
// });



 describe('server', function () {
     
    // beforeEach(function() {
    //     return server.then(function() {
    //       return true
    //     });
    //   });

      it('should work!', function(done) {
        chai.request(server)
          .get('/')
          .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            // res.body.should.be.a('array');
            done();
          });
      });

 })
  
  
// describe('retries', function () {
//     // Retry all tests in this suite up to 4 times
//     this.retries(4);

//     beforeEach(function () {
//         browser.get('http://www.yahoo.com');
//     });

//     it('should succeed on the 3rd try', function () {
//         // Specify this test to only retry up to 2 times
//         this.retries(2);
//         expect($('.foo').isDisplayed()).to.eventually.be.true;
//     });
// });