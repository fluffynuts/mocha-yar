const expect = require('chai').expect;
describe(`happy tests, should all pass`, () => {
    for (let i = 0; i < 20; i++) {
        it(`should pass`, async () => {
            // Arrange
            // Act
            await sleep(200);
            expect(1).to.equal(1);
            // Assert
        });
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});