/* eslint-env mocha */
const { mongoAllowedAdmins } = require('../../api/schema/mongoAllowedAdmins');
const mongoose = require('mongoose');
const should = require('should');



describe('mongoAllowedAdmins  Model', () => {

    const Admin = {
        groupId: -1001055197589,
        moderators: [402684405, 402684456],
        createdAt: 1504309602
    };

    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when proper data is provided ', async () => {
        const data = mongoAllowedAdmins(Admin);
        data.save((e,d) => {
            should.not.exists(e);
            d.groupId.should.equal(-1001055197589);
            should.exists(d.moderators);     
        });
    });

    it('should not create allowedAdmin Model without proper content', async () => {
        try {
            await mongoAllowedAdmins.save({moderators: [402684405, 402684456]});
        } catch (err) {
            should.exists(err.message);
        }
    });

});

