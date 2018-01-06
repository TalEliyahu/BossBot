/* eslint-env mocha */
const { member } = require('../../api/schema/member');
const mongoose = require('mongoose');
const should = require('should');



describe('Member Model', () => {

    const memberData = {
        userid: 402684405,
        firstname: 'Anton',
        lastname: 'Bryansky',
        username: 'Nacalyator',
        groupId: -1001055197589,
        joinDate: 1504309602,
        createdAt: 1504309602
    };
    
    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when all data is provided ', async () => {
        const data = member(memberData);
        data.save((e,d) => {
            should.not.exists(e);
            d.userid.should.equal(402684405);
        });
    });

    it('should not create member without userId', async () => {
        try {
            const data = member({
                firstname: 'Anton',
                lastname: 'Bryansky',
                username: 'Nacalyator',
                groupId: -1001055197589,
                joinDate: 1504309602,
                createdAt: 1504309602
            });
            await data.save({});

        } catch (err) {
            should.exists(err.message);
        }
    });


    it('should not create member without groupId', async () => {
        try {
            const data = member({
                userid: 402684405,
                firstname: 'Anton',
                lastname: 'Bryansky',
                username: 'Nacalyator',
                joinDate: 1504309602,
                createdAt: 1504309602
            });

            await data.save({});
            
        } catch (err) {
            should.exists(err.message);
        }
    });

    it('should return member Records with groupIds', async() => {
        const mem1 = member({
            userid: 122344405,
            firstname: 'Anton',
            lastname: 'Bryansky',
            username: 'Nacalyator',
            groupId: -100105789456,
            joinDate: 1504304569,
            createdAt: 1504304569
        });

        const mem2 = member({
            userid: 91323456,
            firstname: 'lima',
            lastname: 'brian',
            username: 'anhilator',
            groupId: -100105565432,
            joinDate: 1504309602,
            createdAt: 1504309602
        });
        await mem1.save();
        await mem2.save();
        const d = await member.getGroupMembers([-100105565432, -100105789456]);
        d.length.should.be.exactly(2);
    });


});

