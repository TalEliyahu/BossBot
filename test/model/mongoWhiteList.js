/* eslint-env mocha */
const { mongoWhiteList } = require('../../api/schema/mongoWhiteList');
const mongoose = require('mongoose');
const should = require('should');




describe('mongoWhiteList  Model', () => {

   
   
    const whitelist= {
        groupId : -1001138650994,
        links : [ 
            '3'
        ]
    };

    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when proper data is provided ', async () => {
        const data = mongoWhiteList(whitelist);
        data.save((e,d) => {
            should.not.exists(e);
            d.groupId.should.equal('-1001138650994');
        });
    });

    it('should not create mongoWhiteList Model when groupId is missing', async () => {
        try {
            await mongoWhiteList.save({links : [ 
                '3','ww.krypto.com'
            ]});
        } catch (err) {
            should.exists(err.message);
        }
    });

});

