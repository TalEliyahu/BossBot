/* eslint-env mocha */
const { mongoNowConfigatates } = require('../../api/schema/mongoNowConfigatates');
const mongoose = require('mongoose');
const should = require('should');




describe('NowConfigatates  Model', () => {

    const configurate = {
        user : 198541872,
        group : {
            id : -1001089692006.0,
            title : 'Some title',
            type :'supergroup'
        }
    };

    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when proper data is provided ', async () => {
        const data = mongoNowConfigatates(configurate);
        data.save((e,d) => {
            should.not.exists(e);
            d.user.should.equal(198541872);
            should.exists(d.group);
        });
    });

    it('should not create NowConfigatates Model when user is missing', async () => {
        try {
            await mongoNowConfigatates.save({group : {
                id : -1001089692006.0,
                title : 'Some title',
                type :'supergroup'
            }});
        } catch (err) {
            should.exists(err.message);
        }
    });

    it('should not create NowConfigatates Model when groupData is missing', async () => {
        try {
            await mongoNowConfigatates.save({
                user : 198541872
            });
        } catch (err) {
            should.exists(err.message);
        }
    });


});

