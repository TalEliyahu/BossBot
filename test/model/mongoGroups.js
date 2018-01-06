/* eslint-env mocha */
const { mongoGroups } = require('../../api/schema/mongoGroups');
const mongoose = require('mongoose');
const should = require('should');




describe('mongoGroups  Model', () => {

    const blacklist = {
        'joinedMsg': false,
        'pinnedMsg': false,
        'arabicMsg': false,
        'urlMsg': false,
        'deleteCommands': false,
        'helloMsg': false,
        'deleteBlacklist': false,
        'groupId': -1001055197589
    };

    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when proper data is provided ', async () => {
        const data = mongoGroups(blacklist);
        data.save((e,d) => {
            should.not.exists(e);
            d.groupId.should.equal(-1001055197589);
        });
    });

    it('should not create mongoBlacklist Model when groupId is missing', async () => {
        try {
            await mongoGroups.save({
                'joinedMsg': false,
                'pinnedMsg': false,
                'arabicMsg': false});
        } catch (err) {
            should.exists(err.message);
        }
    });

});

