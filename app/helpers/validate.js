"use strict";
console.log("module validate start loading"); 
const PrefixIpv4 = require("../models/prefixIpv4");
console.log('PrefixIpv4', PrefixIpv4);
const PrefixIpv6 = require("../models/prefixIpv6");
console.log('PrefixIpv6', PrefixIpv6);

const ip = require('ip');
const ip6addr = require('ip6addr');
//const { exists } = require('../models/prefixIpv6.js');
//const PrefixIpv4 = require("../models/prefixIpv4");



//const db = require("../models");
//const IpDb = db.ipDb;
//const PrefixIpv4 = db.prefixIpv4;
//const PrefixIpv6 = db.prefixIpv6;

/*const Validator = require('validatorjs');
const validator = (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

module.exports = validator;*/

module.exports = {

    takeAddress: (prefix) => {

        var test = prefix.indexOf("/");

        return prefix.substring(0, prefix.indexOf("/"));

    },
    takeMask: (prefix) => {
        var test = prefix.indexOf("/");

        return prefix.substring(prefix.indexOf("/") + 1);

    },
    ipv4RegExp: (v) => {
        return /^((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\/([0-9]|[12][0-9]|3[0-2]))$)/.test(v);
    },

    ipv6RegExp: (v) => {
        return /^((([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/([0-9]|[1-9][0-9]|1[0-2][0-8])$)/.test(v);
    },


    ipCidrTest: (v, ipVer) => {

        if (ipVer == "ipv4")
            return module.exports.takeAddress(v) == ip.cidr(v);
        else if (ipVer == "ipv6") {
            const a = ip6addr.parse(module.exports.takeAddress(v)).toString()
            const b = module.exports.takeAddress(ip6addr.createCIDR(v).toString());
            const c = a == b;
            return a == b;
        }
        else
            throw new Error("Niepoprawna wersja IP!")


    },

    existsPrefix: async (prefix, dbName, ipVer) => {

        let prefix1; 
        if (ipVer == "ipv4")
        {
            prefix1 = await PrefixIpv4.findOne({ prefix: prefix, dbName: dbName });
        }
            else if (ipVer == "ipv6")
        {
            const prefixCidr = ip6addr.createCIDR(prefix).toString();
            prefix1 = await PrefixIpv6.findOne({ prefix: prefixCidr, dbName: dbName });
        }

        console.log(prefix1);
        console.log(prefix1 == null)
        if (prefix1 == null)
            return Promise.resolve();
        else
            return Promise.reject();

    }
}

console.log("module validate finish loading"); 
