"use strict";
console.log("module validate start loading"); 
const PrefixIpv4 = require("../models/prefixIpv4");
console.log('PrefixIpv4', PrefixIpv4);
const PrefixIpv6 = require("../models/prefixIpv6");
console.log('PrefixIpv6', PrefixIpv6);

const ip = require('ip');
const ip6addr = require('ip6addr');
const uuid = require('uuid-random');
const fs = require('fs');
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

const sortSourceIpv6 = (a, b) => {

    a = a.prefix_full.split(/[\:,\/]/)
        .map((value) => parseInt(value, 16));
    b = b.prefix_full.split(/[\:,\/]/)
        .map((value) => parseInt(value, 16));

    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] || a[5] - b[5] || a[6] - b[6] || a[7] - b[7] || a[8] - b[8]

}


const sortSourceIpv4Prefixes = (a, b) => {

    a = a.split(/[\.,\/]/)
        .map((value) => parseInt(value));
    b = b.split(/[\.,\/]/)
        .map((value) => parseInt(value));

    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] 

}

const sortSourceIpv6Prefixes = (a, b) => {

    a = a.split(/[\:,\/]/)
        .map((value) => parseInt(value, 16));
    b = b.split(/[\:,\/]/)
        .map((value) => parseInt(value, 16));

    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] || a[5] - b[5] || a[6] - b[6] || a[7] - b[7] || a[8] - b[8]

}

const sortSourceIpv4 = (a, b) => {

    a = a.prefix.split(/[\.,\/]/)
        .map((value) => parseInt(value));
    b = b.prefix.split(/[\.,\/]/)
        .map((value) => parseInt(value));

    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] 

}

const generateList1 =  (data,dataList) => {

    //const dataList = [];
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        //const { key, title } = node;
        
        dataList.push(node);
        if (node.children) {
            generateList1(node.children,dataList);
        }
    }
    //return dataList;
  }

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

    },

    list_to_tree: (list) => {

        var start_ltt = Date.now();
      
        var map = {}, node, roots = [], i;
        
        for (i = 0; i < list.length; i += 1) {
          map[list[i]._doc.prefix] = i; // initialize the map
          list[i].children = []; // initialize the children
        }
        
        for (i = 0; i < list.length; i += 1) {
          node = list[i];
          if (node._doc.parent !== "#") {
            // if you have dangling branches check that map[node.parentId] exists
            list[map[node._doc.parent]].children.push(node);
          } else {
            roots.push(node);
          }
        }
      
        var end_ltt = Date.now();
        console.log(` Execution list_to_tree: ${end_ltt - start_ltt} ms`);
        return roots;
      },

      sortedIndexIpv4:(array, prefix) => {
        var low = 0,
            high = array.length;
    
        while (low < high) {
            var mid = (low + high) >>> 1;
            if (sortSourceIpv4(array[mid],prefix) < 0) low = mid + 1;
            else high = mid;
        }
        return low;
    },

    
    sortedIndexIpv6:(array, prefix) => {
        var low = 0,
            high = array.length;
    
        while (low < high) {
            var mid = (low + high) >>> 1;
            if (sortSourceIpv6(array[mid],prefix) < 0) low = mid + 1;
            else high = mid;
        }
        return low;
    },

    checkExistanceIpv4:(array, prefix) => {
        var low = 0,
            high = array.length;
    
        while (low < high) {
            var mid = (low + high) >>> 1;
            if(sortSourceIpv4Prefixes(array[mid].prefix,prefix) == 0)
            {
                return true
            }
            if (sortSourceIpv4Prefixes(array[mid].prefix,prefix) < 0) low = mid + 1;
            else high = mid;
        }
        return false;
    },

    checkExistanceIpv6:(array, prefix) => {
        var low = 0,
            high = array.length;
    
        while (low < high) {
            var mid = (low + high) >>> 1;
            if(sortSourceIpv6Prefixes(array[mid].prefix_full,ip6addr.createCIDR(prefix).toString({ zeroElide: false, zeroPad: true })) == 0)
            {
                return true
            }
            if (sortSourceIpv6Prefixes(array[mid].prefix_full,ip6addr.createCIDR(prefix).toString({ zeroElide: false, zeroPad: true })) < 0) low = mid + 1;
            else high = mid;
        }
        return false;
    },



    generateList: (data,dataList) => {

        //const dataList = [];
        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            //const { key, title } = node;
            
            dataList.push(node);
            if (node.children) {
                generateList1(node.children,dataList);
            }
        }
        //return dataList;
      },
      listFailToFile: (list) => {

        var raport_uuid = uuid();
        var raport_path = "./upload/" + raport_uuid + ".txt";
    
        var file = fs.createWriteStream(raport_path);
        file.on('error', function (err) { console.log("nie mogę znaleźć ../uploads/") });
        list.length>0 && list.forEach(function (v) { file.write(`${v} \n`); });
        file.end();

        return raport_uuid




      },

      sortSourceIpv6: (a, b) => {

        a = a.prefix_full.split(/[\:,\/]/)
            .map((value) => parseInt(value, 16));
        b = b.prefix_full.split(/[\:,\/]/)
            .map((value) => parseInt(value, 16));
    
        return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] || a[5] - b[5] || a[6] - b[6] || a[7] - b[7] || a[8] - b[8]
    
    },
    sortSourceIpv4: (a, b) => {

        a = a.prefix.split(/[\.,\/]/)
            .map(value => parseInt(value));
        b = b.prefix.split(/[\.,\/]/)
            .map(value => parseInt(value));
    
        return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] 
    
    }


}

console.log("module validate finish loading"); 
