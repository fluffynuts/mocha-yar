const expect = require('chai').expect;
describe('Yet Another Reporter for Mocha', function() {
    it('should pass', function() {
        expect(1).to.equal(1);
    });
    it('should reflow running stats for console logs and display the test owning those logs', function() {
        console.log('this is a debug log');
        expect(true).to.equal(true);
    });
    it('should increment the failed count when a test fails', function() {
        expect(true).to.equal(false);
    });
});
