'use strict';

exports.headerSetting = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'x-auth,content-type,X-XSRF-TOKEN');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}