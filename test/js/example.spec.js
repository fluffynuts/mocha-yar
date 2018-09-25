const expect = require('chai').expect;
describe('Yet Another Reporter for Mocha', function() {
    it('should pass', function() {
        expect(1).to.equal(1);
    });

    it('should reflow running stats for console logs and display the test owning those logs', function() {
        console.log('this is a debug log');
        expect(true).to.equal(true);
    });

    it('should show all parameters from the console.log', function() {
      console.log('parameter #1 is', { id: 1, name: 'bob' })
    });

    it('SHOULD FAIL: should increment the failed count when a test fails', function() {
        expect(true).to.equal(false);
    });

    it('should print out console.error stuff in red', function() {
      console.error('Naughty, naughty', { more: 'Very naughty' });
      console.log('(this is not an error)');
    });

    it('should suppress console output for tests specified by title when calling setOptions', function() {
        console.log('should not see this log');
        expect(true).to.be.true
    });

    it('should only output the test name once when annotating console.log calls', function() {
        console.log('should see this log too!');
        console.log('should not see the test name before this log');
    });

    it('should just pass', function(done) {
      setTimeout(function() {
        done();
      }, 1000);
    });

    it('should just pass as well', function(done) {
      setTimeout(function() {
        done();
      }, 1000);
    });

    it('should fail', function(done) {
      setTimeout(function() {
        expect(false).to.be.true;
        done();
      }, 1000);
    });

    it('should just pass again', function(done) {
      setTimeout(function() {
        done();
      }, 1000);
    });

    it('should just pass some more', function(done) {
      setTimeout(function() {
        done();
      }, 1000);
    });
});
