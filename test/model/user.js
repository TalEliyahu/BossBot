/* eslint-env mocha */
const { User } = require('../../api/schema/user');
const mongoose = require('mongoose');
const should = require('should');




describe('user Model', () => {

   
    
    const userData = {
        userId: 469886579,
        name: 'Dmitry Nikulchev',
        username:null,
        accessible:true
    };

    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save user model when proper data is provided ', async () => {
        const data = User(userData);
        data.save((e,d) => {
            should.not.exists(e);
            d.userId.should.equal(469886579);
        });
    });

    it('should not create user Model when userId is missing', async () => {
        try {
            await User.save({
                name: 'Dmitry Nikulchev',
                username:null,
                accessible:true
            });
        } catch (err) {
            should.exists(err.message);
        }
    });

});

