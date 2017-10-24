const MTProto = require('telegram-mtproto').MTProto;

const api = {
    initConnection: 0x69796de9,
    invokeWithLayer: 0x1c900537,
    lang_code: 'en',
    api_id: 190443
};

const server = {
    dev: false
};

const client = MTProto({ server, api });

exports.login = function (req, res) {
    let phone_number = req.body.phone_number;
    let code = req.body.code;
    let hash = req.body.hash;

    client('auth.signIn', {
        phone_number: phone_number,
        phone_code_hash: hash,
        phone_code: code
    }).then((json) => {
        res.send(json);
    }, (err) => {
        res.send(err);
    });
};

exports.sendCode = function (req, res) {
    let phone_number = req.body.phone;

    client('auth.sendCode', {
        phone_number: phone_number,
        current_number: false,
        api_id: 190443,
        api_hash: '3b6750b72e51ada650e9746a4f71b56e',
        sms_type: 0
    }).then((json) => {
        res.send(json);
    }, (err) => {
        res.send(err);
    });
};

exports.signup = function (req, res) {
    let phone_number = req.body.phone_number;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let code = req.body.code;
    let hash = req.body.hash;

    client('auth.signUp', {
        phone_number: phone_number,
        phone_code_hash: hash,
        phone_code: code,
        first_name: first_name,
        last_name: last_name
    }).then((json) => {
        res.send(json);
    }, (err) => {
        res.send(err);
    });
};

exports.sendCall = function (req, res){
    let phone_number = req.body.phone_number;
    let hash = req.body.hash;

    client('auth.sendSms', {
        phone_number: phone_number,
        phone_code_hash: hash
    }).then(json => {
        res.send(json);
    }, (err)=>{
        res.send(err);
    });
};
