const expect = require('chai').expect;
describe('Yet Another Reporter for Mocha', function() {
    it('should pass', function() {
        expect(1).to.equal(1);
    });
    it('should reflow running stats for console logs and display the test owning those logs', function() {
        console.log('this is a debug log');
        expect(true).to.equal(true);
    });
    it('should increment the failed count when a test fails (expect this test to fail)', function() {
        expect(true).to.equal(false);
    });
    it('should suppress console output for tests specified by title when calling setOptions', function() {
        console.log('should not see this log');
        expect(true).to.be.true
    });
    it('should only output the test name once when annotating console.log calls', function() {
        console.log('should see this log too!');
        console.log('should not see the test name before this log');
    });
});
