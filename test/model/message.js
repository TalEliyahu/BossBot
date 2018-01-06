/* eslint-env mocha */
const { messagesLog } = require('../../api/schema/message');
const mongoose = require('mongoose');
const should = require('should');



describe('Message Model', () => {
    
    const messageData = {
        message_id: 8,
        from: {
            id: 402684405,
            is_bot: false,
            first_name: 'Anton',
            last_name: 'Bryansky',
            username: 'Nacalyator'
        },
        chat: {
            id: -1001055197589,
            title: 'Naca',
            type: 'supergroup'
        },
        date: 1504309602,
        text: 'test message'
    };

    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when proper data is provided ', async () => {
        const data = messagesLog(messageData);
        data.save((e,d) => {
            should.not.exists(e);
            d.text.should.equal('test message');
            should.exists(d.from);     
        });
    });

    it('should not create message without proper payload', async () => {
        try {
            await messagesLog.save();
        } catch (err) {
            should.exists(err.message);
        }
    });

});

