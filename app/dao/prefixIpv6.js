"use strict";

const PrefixIpv6 = require("../models/prefixIpv6")
const helper = require("../helpers/validate")
const ip = require('ip')
const ip6addr = require('ip6addr')
const { JSDOM } = require("jsdom");
const { db } = require("../models/prefixIpv6");
const { checkPrefixes } =require("../helpers/addRacurentionIpv6");
const { window } = new JSDOM()
//fs = require('fs');


function sortedIndex(array, value) {
    var low = 0,
        high = array.length;

    while (low < high) {
        var mid = (low + high) >>> 1;
        if (array[mid] < value) low = mid + 1;
        else high = mid;
    }
    return low;
}

const sortSourceIpv6 = (a, b) => {


    a = a.prefix_full.split(/[\:,\/]/)
        .map((value) => parseInt(value, 16));
    b = b.prefix_full.split(/[\:,\/]/)
        .map((value) => parseInt(value, 16));



    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3] || a[4] - b[4] || a[5] - b[5] || a[6] - b[6] || a[7] - b[7]


}

const fil = (fn, a) => {
    const f = []; //final
    for (let i = 0; i < a.length; i++) {
        if (fn(a[i])) {
            f.push(a[i]);
        }
    }
    return f;
};

function delay(t, v) {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t)
    });
}

const addressValidation = (sline, array_all, array_fail_result) => {

    if (!helper.ipv6RegExp(sline[0])) {

        array_fail_result.push(sline[0] + " => " + 'Niepoprawny adres IPv6!')
        //break;
        //i_line ++;
        return false;
        //throw new Error('Linia zawiera niepoprawny adres IPv6!');
    }

    if (!helper.ipCidrTest(sline[0], "ipv6")) {

        array_fail_result.push(line + " => " + 'Niepoprawny CIDR IPv6!')
        //break; 
        //i_line ++;
        return false;

        //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
    }
    if (array_all.filter(obj => obj.prefix == ip6addr.createCIDR(sline[0]).toString({ format: 'v6' })).length == 1) {

        array_fail_result.push(sline[0] + " => " + 'Ten prefix juz istnieje')
        //break; 
        //i_line ++;
        //i_line++;
        //console.log(i_line);
        //io.emit("loading", ((i_line / array_file.length) * 100)*0.9);
        return false;
        //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
    }

    return true;


}

module.exports = {

    saveLines: async (array_file, dbName, io) => {

        try {

            var start_save_line = window.performance.now();
            var start_take_all = window.performance.now();
            var array_all = await PrefixIpv6.find({ "dbName": dbName });


            var start_fil = window.performance.now();
            fil(obj => obj.parent == "#", array_all);
            var end_fil = window.performance.now();
            console.log(`Execution custom fil =   : ${end_fil - start_fil} ms`);

            var start_array_filter = window.performance.now();
            array_all.filter(obj => obj.parent == "#");
            var end_array_filter = window.performance.now();
            console.log(`Execution array filter =   : ${end_array_filter - start_array_filter} ms`);

            var end_take_all = window.performance.now();
            console.log(`Execution take all =   : ${end_take_all - start_take_all} ms`);

            let array_fail_result = []


            io.emit("loading_start");
            var i_line = 0;
            for (let line of array_file) {

                line = line.replace(/"/g, "");
                var sline = line.split(";");

                if (addressValidation(sline, array_all, array_fail_result) == false) {

                    i_line++;
                    io.emit("loading", ((i_line / array_file.length) * 100) * 0.9);

                    continue;
                }



                var prefix = new PrefixIpv6({
                    prefix: ip6addr.createCIDR(sline[0]).toString({ format: 'v6' }),
                    prefix_full: ip6addr.createCIDR(sline[0]).toString({ zeroElide: false, zeroPad: true })
                    //  .split(/[\:,\/]/)
                    //  .map((value) => parseInt(value, 16))
                    //  .join(":")
                    ,
                    mask: helper.takeMask(sline[0]),
                    parent: "#",
                    dbName: dbName,
                    description: sline[4],
                    tag: sline[3]
                    //description3: sline[5],
                    //description4: sline[6],
                    //description5: sline[7]
                    //created_by: "5ed290a15fa2630114f61162"
                });

                var test = array_all.filter(obj => obj.prefix == prefix.prefix);


                {

                    var adress = helper.takeAddress(prefix.prefix);
                    var prefixes = array_all.filter(obj => obj.parent == "#")
                    //var prefixes = await PrefixIpv6.find({ "parent": "#", "dbName": dbName });

                    prefixes = prefixes.sort(sortSourceIpv6);

                    var prefix_iter;
                    var matched_prefix_up = null;
                    var matched_prefix_down = [];
                    var i = 0;
                    var start_while = window.performance.now();
                    while (prefixes.length > 0 && i < prefixes.length) {
                        // for (i = 0; i < prefix.length; i++) {
                        //var start_in = window.performance.now();
                        //var start_while_block1 = window.performance.now();
                        if (i == 0) {
                            for (var j = 2; prefixes.length / j > 4;) {
                                if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) == 0) {
                                    var test1 = Math.ceil(prefixes.length / j);
                                    prefixes = [prefixes[Math.ceil(prefixes.length / j)]]
                                }
                                else if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) > 0) {
                                    var test1 = Math.ceil(prefixes.length / j);
                                    var test2 = prefixes.length - 1;
                                    prefixes = prefixes.slice(Math.ceil(prefixes.length / j), prefixes.length - 1)
                                }
                                else if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) < 0) {
                                    var test1 = Math.ceil(prefixes.length / j);
                                    prefixes = prefixes.slice(0, Math.ceil(prefixes.length / j))
                                }
                            }
                        }
                        //var end_while_block1 = window.performance.now();
                        //console.log(`Execution while block1 : ${end_while_block1 - start_while_block1} ms`);
                        //var end_for = window.performance.now();
                        //console.log(`Execution time in for: ${end_for - start_in} ms`);


                        prefix_iter = prefixes[i];


                        //if()
                        //var start_while_block2 = window.performance.now();

                        if (prefix_iter.mask < prefix.mask) {

                            //var start_while_block2_sub1 = window.performance.now();

                            if (ip6addr.createCIDR(prefix_iter.prefix).contains(adress) == true) {
                                matched_prefix_up = prefix_iter;
                                //await PrefixIpv4.populate(prefix_iter, "subnetworks").then(prefix_1 => console.log(prefix_1));
                                //var start_take = window.performance.now();
                                //prefixes = await PrefixIpv6.find({ "parent": prefix_iter.prefix, "dbName": dbName });
                                var start_take_from_array = window.performance.now();
                                prefixes = array_all.filter(obj => obj.parent == prefix_iter.prefix)
                                var end_take_from_array = window.performance.now();
                                console.log(`Execution taking form array : ${end_take_from_array - start_take_from_array} ms`);
                                //var end_take = window.performance.now();
                                //console.log(`Execution take for parent "${prefix_iter.prefix}" : ${end_take - start_take} ms`);

                                prefixes = prefixes.sort(sortSourceIpv6);
                                i = 0;
                            }
                            else {
                                /*if (i == (prefixes.length - 1)) {
                                    break;
                                }*/
                                i++;
                            }
                            //var end_while_block2_sub1 = window.performance.now();
                            //console.log(`Execution while block2 sub1 : ${end_while_block2_sub1 - start_while_block2_sub1} ms`);
                        }



                        else if (prefix_iter.mask > prefix.mask) {

                            //var start_while_block2_sub2 = window.performance.now();

                            //var test1 = prefix.prefix;
                            //var test2 = helper.takeAddress(prefix_iter.prefix);
                            if (ip6addr.createCIDR(prefix.prefix).contains(helper.takeAddress(prefix_iter.prefix)) == true) {
                                matched_prefix_down.push(prefix_iter);
                            }
                            //prefixes = prefix_iter.subnetworks;
                            //break;
                            i++;

                            //var end_while_block2_sub2 = window.performance.now();
                            //console.log(`Execution while block2 sub2 : ${end_while_block2_sub2 - start_while_block2_sub2} ms`);

                        }
                        else {
                            //var start_while_block2_sub3 = window.performance.now();

                            if (i == (prefixes.length - 1)) {
                                break;
                            }
                            i++;

                            //var end_while_block2_sub3 = window.performance.now();
                            //console.log(`Execution while block2 sub3 : ${end_while_block2_sub3 - start_while_block2_sub3} ms`);
                        }
                        //var end_while_block2 = window.performance.now();
                        //console.log(`Execution while block2: ${end_while_block2 - start_while_block2} ms`);

                        //var end_in = window.performance.now();
                        //console.log(` i = ${i}; Execution time in while: ${end_in - start_in} ms`);

                        //}

                    }
                    var end_while = window.performance.now();
                    console.log(` Execution time out while: ${end_while - start_while} ms`);
                    var start_after_while = window.performance.now();

                    if (matched_prefix_up != null) {
                        prefix.parent = matched_prefix_up.prefix;
                    };
                    if (matched_prefix_down.length > 0) {
                        for (let prefix_d of matched_prefix_down) {
                            //matched_prefix_down.parent = this.text;
                            let index = array_all.indexOf(prefix_d);
                            prefix_d.parent = prefix.prefix;
                            prefix_d.updated = true;
                            array_all[index] = prefix_d
                            //await prefix_d.save();
                        }
                    }

                    prefix.created = true;
                    array_all.push(prefix);
                    //await prefix.save();
                    //return [1, "Success"];
                    //matched_prefix_up.subnetworks.push(prefix);
                    //matched_prefix_up.save();

                };

                i_line++;
                console.log(i_line);
                // process.nextTick(
                //io.emit("loading", ((i_line / array_file.length) * 100)*0.9));

            }

            const items_create = array_all.filter(obj => obj.created == true);
            if (items_create != null)
                items_create.forEach(obj => obj.save());

            const items_update = array_all.filter(obj => obj.updated == true && obj.created == null);
            if (items_update != null)
                items_update.forEach(obj => obj.save());

            io.emit("loading", (99));

            var end_after_while = window.performance.now();
            console.log(` Execution time after while: ${end_after_while - start_after_while} ms`);

            var end_save_line = window.performance.now();
            console.log(`Execution time save: ${end_save_line - start_save_line} ms`);
            return ({
                created: items_create.length,
                updated: items_update.length,
                raport: array_fail_result
            })



        } catch (err) {
            //items_create = array_all.filter(obj => obj.create == true); 
            //items_create.forEach(obj => obj.save()); 
            //console.log(line + ";" + err.message);
            console.log(err.message);
            return [err.message];

        }


    },

    saveline_v2: async (sline, array_tree, array_fail_result, dbName, formatFile) => {
        try {

            var prefix = formatFile == "old" ? new PrefixIpv6({
                prefix: ip6addr.createCIDR(sline[0]).toString({ format: 'v6' }),
                prefix_full: ip6addr.createCIDR(sline[0]).toString({ zeroElide: false, zeroPad: true })
                //  .split(/[\:,\/]/)
                //  .map((value) => parseInt(value, 16))
                //  .join(":")
                ,
                mask: helper.takeMask(sline[0]),
                parent: "#",
                dbName: dbName,
                description: sline[4],
                tag: sline[3]

                //description3: sline[5],
                //description4: sline[6],
                //description5: sline[7]
                //created_by: "5ed290a15fa2630114f61162"
            }):
            
            new PrefixIpv6({
                prefix: ip6addr.createCIDR(sline[0]).toString({ format: 'v6' }),
                prefix_full: ip6addr.createCIDR(sline[0]).toString({ zeroElide: false, zeroPad: true })
                //  .split(/[\:,\/]/)
                //  .map((value) => parseInt(value, 16))
                //  .join(":")
                ,
                mask: helper.takeMask(sline[0]),
                parent: "#",
                dbName: dbName,
                description: sline[1],
                tag: sline[2]

                //description3: sline[5],
                //description4: sline[6],
                //description5: sline[7]
                //created_by: "5ed290a15fa2630114f61162"
            });                         
            prefix.children = [];

            checkPrefixes(prefix, array_tree, "#");

            return delay(0, sline);

        }

        catch (err) {
            //items_create = array_all.filter(obj => obj.create == true); 
            //items_create.forEach(obj => obj.save()); 
            //console.log(line + ";" + err.message);
            console.log(err.message);
            array_fail_result.push(sline[0] + " => " + err.message)
            return new Promise((resolve, reject) => reject(sline[0] + " => " + err.message))
            //return [err.message];

        }


    }



    ,

    saveLine: async (sline, array_all, array_fail_result, dbName, io) => {

        try {

            //var start_save_line = window.performance.now();
            //var start_take_all = window.performance.now();
            //var array_all = await PrefixIpv6.find({ "dbName": dbName });


            //var start_fil= window.performance.now();
            //fil(obj => obj.parent == "#", array_all);
            //var end_fil= window.performance.now();
            //console.log(`Execution custom fil =   : ${end_fil - start_fil} ms`);

            //var start_array_filter= window.performance.now();
            //array_all.filter(obj => obj.parent == "#"  );
            //var end_array_filter= window.performance.now();
            //console.log(`Execution array filter =   : ${end_array_filter - start_array_filter} ms`);

            //var end_take_all= window.performance.now();
            //console.log(`Execution take all =   : ${end_take_all - start_take_all} ms`);

            //let array_fail_result = []


            //io.emit("loading_start");
            //var i_line = 0;
            //for (let line of array_file) {

            // line = line.replace(/"/g, "");
            // var sline = line.split(";");

            // if(addressValidation(sline,array_all,array_fail_result) == false) {

            //     i_line++;
            //     io.emit("loading", ((i_line / array_file.length) * 100)*0.9);

            //     continue; 
            // }



            var prefix = new PrefixIpv6({
                prefix: ip6addr.createCIDR(sline[0]).toString({ format: 'v6' }),
                prefix_full: ip6addr.createCIDR(sline[0]).toString({ zeroElide: false, zeroPad: true })
                //  .split(/[\:,\/]/)
                //  .map((value) => parseInt(value, 16))
                //  .join(":")
                ,
                mask: helper.takeMask(sline[0]),
                parent: "#",
                dbName: dbName,
                description: sline[4],
                tag: sline[3]
                //description3: sline[5],
                //description4: sline[6],
                //description5: sline[7]
                //created_by: "5ed290a15fa2630114f61162"
            });

            // var test = array_all.filter(obj => obj.prefix == prefix.prefix ); 


            {

                var adress = helper.takeAddress(prefix.prefix);
                var prefixes = array_all.filter(obj => obj.parent == "#")
                //var prefixes = await PrefixIpv6.find({ "parent": "#", "dbName": dbName });

                prefixes = prefixes.sort(sortSourceIpv6);

                var prefix_iter;
                var matched_prefix_up = null;
                var matched_prefix_down = [];
                var i = 0;
                var start_while = window.performance.now();
                while (prefixes.length > 0 && i < prefixes.length) {
                    // for (i = 0; i < prefix.length; i++) {
                    //var start_in = window.performance.now();
                    //var start_while_block1 = window.performance.now();
                    if (i == 0) {
                        for (var j = 2; prefixes.length / j > 4;) {
                            if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) == 0) {
                                var test1 = Math.ceil(prefixes.length / j);
                                prefixes = [prefixes[Math.ceil(prefixes.length / j)]]
                            }
                            else if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) > 0) {
                                var test1 = Math.ceil(prefixes.length / j);
                                var test2 = prefixes.length - 1;
                                prefixes = prefixes.slice(Math.ceil(prefixes.length / j), prefixes.length - 1)
                            }
                            else if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) < 0) {
                                var test1 = Math.ceil(prefixes.length / j);
                                prefixes = prefixes.slice(0, Math.ceil(prefixes.length / j))
                            }
                        }
                    }
                    //var end_while_block1 = window.performance.now();
                    //console.log(`Execution while block1 : ${end_while_block1 - start_while_block1} ms`);
                    //var end_for = window.performance.now();
                    //console.log(`Execution time in for: ${end_for - start_in} ms`);


                    prefix_iter = prefixes[i];


                    //if()
                    //var start_while_block2 = window.performance.now();

                    if (prefix_iter.mask < prefix.mask) {

                        //var start_while_block2_sub1 = window.performance.now();

                        if (ip6addr.createCIDR(prefix_iter.prefix).contains(adress) == true) {
                            matched_prefix_up = prefix_iter;
                            //await PrefixIpv4.populate(prefix_iter, "subnetworks").then(prefix_1 => console.log(prefix_1));
                            //var start_take = window.performance.now();
                            //prefixes = await PrefixIpv6.find({ "parent": prefix_iter.prefix, "dbName": dbName });
                            var start_take_from_array = window.performance.now();
                            prefixes = array_all.filter(obj => obj.parent == prefix_iter.prefix)
                            var end_take_from_array = window.performance.now();
                            //console.log(`Execution taking form array : ${end_take_from_array - start_take_from_array} ms`);
                            //var end_take = window.performance.now();
                            //console.log(`Execution take for parent "${prefix_iter.prefix}" : ${end_take - start_take} ms`);

                            prefixes = prefixes.sort(sortSourceIpv6);
                            i = 0;
                        }
                        else {
                            /*if (i == (prefixes.length - 1)) {
                                break;
                            }*/
                            i++;
                        }
                        //var end_while_block2_sub1 = window.performance.now();
                        //console.log(`Execution while block2 sub1 : ${end_while_block2_sub1 - start_while_block2_sub1} ms`);
                    }



                    else if (prefix_iter.mask > prefix.mask) {

                        //var start_while_block2_sub2 = window.performance.now();

                        //var test1 = prefix.prefix;
                        //var test2 = helper.takeAddress(prefix_iter.prefix);
                        if (ip6addr.createCIDR(prefix.prefix).contains(helper.takeAddress(prefix_iter.prefix)) == true) {
                            matched_prefix_down.push(prefix_iter);
                        }
                        //prefixes = prefix_iter.subnetworks;
                        //break;
                        i++;

                        //var end_while_block2_sub2 = window.performance.now();
                        //console.log(`Execution while block2 sub2 : ${end_while_block2_sub2 - start_while_block2_sub2} ms`);

                    }
                    else {
                        //var start_while_block2_sub3 = window.performance.now();

                        if (i == (prefixes.length - 1)) {
                            break;
                        }
                        i++;

                        //var end_while_block2_sub3 = window.performance.now();
                        //console.log(`Execution while block2 sub3 : ${end_while_block2_sub3 - start_while_block2_sub3} ms`);
                    }
                    //var end_while_block2 = window.performance.now();
                    //console.log(`Execution while block2: ${end_while_block2 - start_while_block2} ms`);

                    //var end_in = window.performance.now();
                    //console.log(` i = ${i}; Execution time in while: ${end_in - start_in} ms`);

                    //}

                }
                var end_while = window.performance.now();
                //console.log(` Execution time out while: ${end_while - start_while} ms`);
                var start_after_while = window.performance.now();

                if (matched_prefix_up != null) {
                    prefix.parent = matched_prefix_up.prefix;
                };
                if (matched_prefix_down.length > 0) {
                    for (let prefix_d of matched_prefix_down) {
                        //matched_prefix_down.parent = this.text;
                        let index = array_all.indexOf(prefix_d);
                        prefix_d.parent = prefix.prefix;
                        prefix_d.updated = true;
                        array_all[index] = prefix_d
                        //await prefix_d.save();
                    }
                }

                prefix.created = true;
                array_all.push(prefix);
                //await prefix.save();
                //return [1, "Success"];
                //matched_prefix_up.subnetworks.push(prefix);
                //matched_prefix_up.save();

            };

            //i_line++;
            //console.log(i_line);
            // process.nextTick(
            //io.emit("loading", ((i_line / array_file.length) * 100)*0.9));

            //}

            //    const items_create = array_all.filter(obj => obj.created == true); 
            //    if(items_create != null )
            //    items_create.forEach(obj => obj.save()); 

            //    const items_update = array_all.filter(obj => obj.updated == true && obj.created == null ); 
            //    if(items_update != null )
            //    items_update.forEach(obj => obj.save()); 

            //    io.emit("loading", (99));

            //    var end_after_while = window.performance.now();
            //    console.log(` Execution time after while: ${end_after_while - start_after_while} ms`);

            //    var end_save_line = window.performance.now();
            //    console.log(`Execution time save: ${end_save_line - start_save_line} ms`);
            //    return({
            //            created: items_create.length, 
            //            updated: items_update.length, 
            //            raport: array_fail_result 
            //         })

            //await io.emit("loading");

            //return new Promise((resolve,reject) =>  resolve(sline))

            return delay(0, sline);


        } catch (err) {
            //items_create = array_all.filter(obj => obj.create == true); 
            //items_create.forEach(obj => obj.save()); 
            //console.log(line + ";" + err.message);
            console.log(err.message);
            array_fail_result.push(sline[0] + " => " + err.message)
            return new Promise((resolve, reject) => reject(sline[0] + " => " + err.message))
            //return [err.message];

        }


    },


    //saveAddress: async (line) => {

    saveAddress: async (line, dbName) => {

        try {
            line = line.replace(/"/g, "");
            var sline = line.split(";");
            //var prefixes = await PrefixIpv4.find({ "parent": "#" });
            //await prefixDAO.saveAddress(sline[0], sline[3], sline[4], sline[5], sline[6], sline[7]);
            if (!helper.ipv6RegExp(sline[0])) {
                throw new Error('Linia zawiera niepoprawny adres IPv6!');
            }

            if (!helper.ipCidrTest(sline[0], "ipv6")) {
                throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
            }

            var start_take_test = window.performance.now();
            var test = await PrefixIpv6.find({ "dbName": dbName });
            var end_take_test = window.performance.now();
            console.log(`Execution take test for parent  : ${end_take_test - start_take_test} ms`);
            var start_test_filter = window.performance.now();
            var test_filter = test.filter(obj => obj.parent == "fd15:f100:f0f::/48")
            var end_test_filter = window.performance.now();
            console.log(`Execution take filter item = ${test_filter.length}  : ${end_test_filter - start_test_filter} ms`);


            var prefix = new PrefixIpv6({
                prefix: ip6addr.createCIDR(sline[0]).toString({ format: 'v6' }),
                prefix_full: ip6addr.createCIDR(sline[0]).toString({ zeroElide: false, zeroPad: true })
                //  .split(/[\:,\/]/)
                //  .map((value) => parseInt(value, 16))
                //  .join(":")
                ,
                mask: helper.takeMask(sline[0]),
                parent: "#",
                dbName: dbName,
                description: sline[4],
                tag: sline[3]
                //description3: sline[5],
                //description4: sline[6],
                //description5: sline[7]
                //created_by: "5ed290a15fa2630114f61162"
            });

            {

                var adress = helper.takeAddress(prefix.prefix);

                var prefixes = await PrefixIpv6.find({ "parent": "#", "dbName": dbName });
                prefixes = prefixes.sort(sortSourceIpv6);

                var prefix_iter;
                var matched_prefix_up = null;
                var matched_prefix_down = [];
                var i = 0;
                var start_out = window.performance.now();
                while (prefixes.length > 0 && i < prefixes.length) {
                    // for (i = 0; i < prefix.length; i++) {
                    var start_in = window.performance.now();
                    var start_while_block1 = window.performance.now();
                    if (i == 0) {
                        for (var j = 2; prefixes.length / j > 4;) {
                            if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) == 0) {
                                var test1 = Math.ceil(prefixes.length / j);
                                prefixes = [prefixes[Math.ceil(prefixes.length / j)]]
                            }
                            else if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) > 0) {
                                var test1 = Math.ceil(prefixes.length / j);
                                var test2 = prefixes.length - 1;
                                prefixes = prefixes.slice(Math.ceil(prefixes.length / j), prefixes.length - 1)
                            }
                            else if (sortSourceIpv6(prefix, prefixes[Math.ceil(prefixes.length / j)]) < 0) {
                                var test1 = Math.ceil(prefixes.length / j);
                                prefixes = prefixes.slice(0, Math.ceil(prefixes.length / j))
                            }
                        }
                    }
                    var end_while_block1 = window.performance.now();
                    console.log(`Execution while block1 : ${end_while_block1 - start_while_block1} ms`);
                    var end_for = window.performance.now();
                    //console.log(`Execution time in for: ${end_for - start_in} ms`);


                    prefix_iter = prefixes[i];


                    //if()
                    var start_while_block2 = window.performance.now();

                    if (prefix_iter.mask < prefix.mask) {

                        var start_while_block2_sub1 = window.performance.now();

                        if (ip6addr.createCIDR(prefix_iter.prefix).contains(adress) == true) {
                            matched_prefix_up = prefix_iter;
                            //await PrefixIpv4.populate(prefix_iter, "subnetworks").then(prefix_1 => console.log(prefix_1));
                            var start_take = window.performance.now();
                            prefixes = await PrefixIpv6.find({ "parent": prefix_iter.prefix, "dbName": dbName });
                            var end_take = window.performance.now();
                            console.log(`Execution take for parent "${prefix_iter.prefix}" : ${end_take - start_take} ms`);

                            prefixes = prefixes.sort(sortSourceIpv6);
                            i = 0;
                        }
                        else {
                            /*if (i == (prefixes.length - 1)) {
                                break;
                            }*/
                            i++;
                        }
                        var end_while_block2_sub1 = window.performance.now();
                        console.log(`Execution while block2 sub1 : ${end_while_block2_sub1 - start_while_block2_sub1} ms`);
                    }



                    else if (prefix_iter.mask > prefix.mask) {

                        var start_while_block2_sub2 = window.performance.now();

                        var test1 = prefix.prefix;
                        var test2 = helper.takeAddress(prefix_iter.prefix);
                        if (ip6addr.createCIDR(prefix.prefix).contains(helper.takeAddress(prefix_iter.prefix)) == true) {
                            matched_prefix_down.push(prefix_iter);
                        }
                        //prefixes = prefix_iter.subnetworks;
                        //break;
                        i++;

                        var end_while_block2_sub2 = window.performance.now();
                        console.log(`Execution while block2 sub2 : ${end_while_block2_sub2 - start_while_block2_sub2} ms`);

                    }
                    else {
                        var start_while_block2_sub3 = window.performance.now();

                        if (i == (prefixes.length - 1)) {
                            break;
                        }
                        i++;

                        var end_while_block2_sub3 = window.performance.now();
                        console.log(`Execution while block2 sub3 : ${end_while_block2_sub3 - start_while_block2_sub3} ms`);
                    }
                    var end_while_block2 = window.performance.now();
                    console.log(`Execution while block2: ${end_while_block2 - start_while_block2} ms`);

                    var end_in = window.performance.now();
                    //console.log(` i = ${i}; Execution time in while: ${end_in - start_in} ms`);

                    //}

                }
                var end_out = window.performance.now();
                console.log(` Execution time out while: ${end_out - start_out} ms`);
                if (matched_prefix_up != null) {
                    prefix.parent = matched_prefix_up.prefix;
                };
                if (matched_prefix_down.length > 0) {
                    for (let prefix_d of matched_prefix_down) {
                        //matched_prefix_down.parent = this.text;
                        prefix_d.parent = prefix.prefix;
                        await prefix_d.save();
                    }
                }
                await prefix.save();
                return [1, "Success"];
                //matched_prefix_up.subnetworks.push(prefix);
                //matched_prefix_up.save();

            };


        } catch (err) {
            console.log(line + ";" + err.message);
            return [0, err.message];

        }
    }



}
