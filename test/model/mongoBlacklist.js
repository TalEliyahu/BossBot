/* eslint-env mocha */
const { mongoBlacklist } = require('../../api/schema/mongoBlacklist');
const mongoose = require('mongoose');
const should = require('should');




describe('mongoBlacklist  Model', () => {

    const blacklist = {
        groupId: -1001055197589,
        words:['hey there'],
        createdAt: 1504309602
    };

    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when proper data is provided ', async () => {
        const data = mongoBlacklist(blacklist);
        data.save((e,d) => {
            should.not.exists(e);
            d.groupId.should.equal(-1001055197589);
            should.exists(d.words);     
        });
    });

    it('should not create mongoBlacklist Model when content is missing', async () => {
        try {
            await mongoBlacklist.save({ words:['hey there']});
        } catch (err) {
            should.exists(err.message);
        }
    });

});

