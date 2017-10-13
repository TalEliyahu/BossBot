/* eslint-env mocha */

const assert = require('assert');

const isJoinedMessage = require('../lib/filters.js').implementation.isJoinedMessage;
const isArabicMessage = require('../lib/filters.js').implementation.isArabicMessage;
const isUrlMessage = require('../lib/filters.js').implementation.isUrlMessage;
const isBotCommand = require('../lib/filters.js').implementation.isBotCommand;

// TEST FILTER FUNCTIONS
// Message samples

const msgWithText = {
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
};

const msgJoined = {
    message_id: 10,
    from: {
        id: 402684405,
        is_bot: false,
        first_name: 'Anton',
        last_name: 'Bryansky',
        username: 'Nacalyator'
    },
    chat: { id: -1001055197589, title: 'Naca', type: 'supergroup' },
    date: 1504309729,
    new_chat_participant: {
        id: 133833735,
        is_bot: false,
        first_name: 'Aleksey',
        last_name: 'Bushmelev',
        username: 'Bushmelev_Aleksey'
    },
    new_chat_member: {
        id: 133833735,
        is_bot: false,
        first_name: 'Aleksey',
        last_name: 'Bushmelev',
        username: 'Bushmelev_Aleksey'
    },
    new_chat_members: [{
        id: 133833735,
        is_bot: false,
        first_name: 'Aleksey',
        last_name: 'Bushmelev',
        username: 'Bushmelev_Aleksey'
    }]
};

const msgLeft = {
    message_id: 11,
    from: {
        id: 402684405,
        is_bot: false,
        first_name: 'Anton',
        last_name: 'Bryansky',
        username: 'Nacalyator'
    },
    chat: { id: -1001055197589, title: 'Naca', type: 'supergroup' },
    date: 1504309741,
    left_chat_participant: {
        id: 133833735,
        is_bot: false,
        first_name: 'Aleksey',
        last_name: 'Bushmelev',
        username: 'Bushmelev_Aleksey'
    },
    left_chat_member: {
        id: 133833735,
        is_bot: false,
        first_name: 'Aleksey',
        last_name: 'Bushmelev',
        username: 'Bushmelev_Aleksey'
    }
};

const msgWithArabic = {
    message_id: 9,
    from: {
        id: 402684405,
        is_bot: false,
        first_name: 'Anton',
        last_name: 'Bryansky',
        username: 'Nacalyator'
    },
    chat: { id: -1001055197589, title: 'Naca', type: 'supergroup' },
    date: 1504309636,
    text: 'ڃ ڄ څ چ ڇ ڈ ډ ڊ ڋ ڌ ڍ ڎ ڏ 0690 ڐ ڑ ڒ ړ ڔ ڕ ږ ڗ ژ ڙ ښ ڛ'
};

const msgWithUrl = {
    message_id: 7,
    from: {
        id: 402684405,
        is_bot: false,
        first_name: 'Anton',
        last_name: 'Bryansky',
        username: 'Nacalyator'
    },
    chat: { id: -1001055197589, title: 'Naca', type: 'supergroup' },
    date: 1504309593,
    text: 'www.github.com',
    entities: [ { offset: 0, length: 14, type: 'url' } ]
};

const msgBotCmd = {};

// Filter functions tests
describe('isJoinedMessage', function() {
    it('Should return false for message with URL', function() {
        assert.equal(isJoinedMessage(msgWithUrl), false);
    });

    it('Should return false for message with text', function() {
        assert.equal(isJoinedMessage(msgWithText), false);
    });

    it('Should return false for message with arabic text', function() {
        assert.equal(isJoinedMessage(msgWithArabic), false);
    });

    it('Should return true for message \'User joined chat\'', function() {
        assert.equal(isJoinedMessage(msgJoined), true);
    });

    it('Should return true for message \'User left chat\'', function() {
        assert.equal(isJoinedMessage(msgLeft), true);
    });

    it('Should return false for message with bot command', function() {
        assert.equal(isJoinedMessage(msgBotCmd), false);
    });

});

describe('isArabicMessage', function() {
    it('Should return false for message with URL', function() {
        assert.equal(isArabicMessage(msgWithUrl), false);
    });

    it('Should return false for message with text', function() {
        assert.equal(isArabicMessage(msgWithText), false);
    });

    it('Should return true for message with arabic text', function() {
        assert.equal(isArabicMessage(msgWithArabic), true);
    });

    it('Should return false for message \'User joined chat\'', function() {
        assert.equal(isArabicMessage(msgJoined), false);
    });

    it('Should return false for message \'User left chat\'', function() {
        assert.equal(isArabicMessage(msgLeft), false);
    });

    it('Should return false for message with bot command', function() {
        assert.equal(isArabicMessage(msgBotCmd), false);
    });

});

describe('isUrlMessage', function() {
    it('Should return true for message with URL', function() {
        assert.equal(isUrlMessage(msgWithUrl), true);
    });

    it('Should return false for message with text', function() {
        assert.equal(isUrlMessage(msgWithText), false);
    });

    it('Should return false for message with arabic text', function() {
        assert.equal(isUrlMessage(msgWithArabic), false);
    });

    it('Should return false for message \'User joined chat\'', function() {
        assert.equal(isUrlMessage(msgJoined), false);
    });

    it('Should return false for message \'User left chat\'', function() {
        assert.equal(isUrlMessage(msgLeft), false);
    });

    it('Should return false for message with bot command', function() {
        assert.equal(isUrlMessage(msgBotCmd), false);
    });

});

describe('isBotCommand', function() {
    it('Should return false for message with URL', function() {
        assert.equal(isBotCommand(msgWithUrl), false);
    });

    it('Should return false for message with text', function() {
        assert.equal(isBotCommand(msgWithText), false);
    });

    it('Should return false for message with arabic text', function() {
        assert.equal(isBotCommand(msgWithArabic), false);
    });

    it('Should return false for message \'User joined chat\'', function() {
        assert.equal(isBotCommand(msgJoined), false);
    });

    it('Should return false for message \'User left chat\'', function() {
        assert.equal(isBotCommand(msgLeft), false);
    });

    it('Should return true for message with bot command', function() {
        assert.equal(isBotCommand(msgBotCmd), true);
    });

});
