/* eslint-env mocha */
const { actionLog } = require('../../api/schema/actionLog');
const mongoose = require('mongoose');
const should = require('should');



describe('action Log Model', () => {

    const event = {
        eventType: 'SENDING_CONFIG_PM',
        payload:{
            message_id: 8,
            from: {
                id: 402684405,
                is_bot: false,
                first_name: 'Anton',
                last_name: 'Bryansky',
                username: 'Nacalyator'
            },
            chat: { id: -1001055197589, title: 'Naca', type: 'supergroup' },
            date: 1504309602,
            text: 'test message'
        }
    };
    
    beforeEach(() => mongoose.connection.dropDatabase());
    after(() => mongoose.connection.dropDatabase());


    it('Should save when eventType is provided ', async () => {
        const data = actionLog(event);
        data.save((e,d) => {
            should.not.exists(e);
            d.eventType.should.equal('SENDING_CONFIG_PM');
            should.exists(d.payload);     
        });
    });

    it('should not create actionLog without eventType', async () => {
        try {
            await actionLog.save({});
        } catch (err) {
            should.exists(err.message);
        }
    });

});

