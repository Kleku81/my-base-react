"use strict";

const PrefixIpv6 = require("../models/prefixIpv6")
const helper = require("../helpers/validate")
const ip = require('ip')
const ip6addr = require('ip6addr')
    //fs = require('fs');

module.exports =  {
    

    //saveAddress: async (line) => {

    saveAddress:  async (line, dbName) => {

        try{
        line = line.replace(/"/g, "");
        var sline = line.split(";");
        //var prefixes = await PrefixIpv4.find({ "parent": "#" });
        //await prefixDAO.saveAddress(sline[0], sline[3], sline[4], sline[5], sline[6], sline[7]);
        if(!helper.ipv6RegExp(sline[0]))
        {
            throw new Error('Linia zawiera niepoprawny adres IPv4!');
        }

        if(!helper.ipCidrTest(sline[0], "ipv6"))
        {
            throw new Error('Linia zawiera niepoprawny CIDR IPv4!');
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

        {

            var adress = helper.takeAddress(prefix.prefix);
            var prefixes =  await PrefixIpv6.find({ "parent": "#", "dbName": dbName  });
            var prefix_iter;
            var matched_prefix_up = null;
            var matched_prefix_down = [];
            var i = 0;
            while (prefixes.length > 0 && i < prefixes.length) {
                // for (i = 0; i < prefix.length; i++) {
                prefix_iter = prefixes[i];
                //if()
                if (prefix_iter.mask < prefix.mask) {
                    if (ip6addr.createCIDR(prefix_iter.prefix).contains(adress) == true) {
                        matched_prefix_up = prefix_iter;
                        //await PrefixIpv4.populate(prefix_iter, "subnetworks").then(prefix_1 => console.log(prefix_1));
                        prefixes = await  PrefixIpv6.find({ "parent": prefix_iter.prefix, "dbName": dbName });
                        i = 0;
                    }
                    else {
                        /*if (i == (prefixes.length - 1)) {
                            break;
                        }*/
                        i++;
                    }
                }
                else if (prefix_iter.mask > prefix.mask) {

                    var test1 = prefix.prefix;
                    var test2 = helper.takeAddress(prefix_iter.prefix);
                    if (ip6addr.createCIDR(prefix.prefix).contains(helper.takeAddress(prefix_iter.prefix)) == true) {
                        matched_prefix_down.push(prefix_iter);
                    }
                        //prefixes = prefix_iter.subnetworks;
                        //break;
                        i++;
                    
                }
                else {
                    if (i == (prefixes.length - 1)) {
                        break;
                    }
                    i++;
                }


                //}

            }
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
            return [1,"Success"];
            //matched_prefix_up.subnetworks.push(prefix);
            //matched_prefix_up.save();

        };


    } catch(err){
        console.log(line+";"+err.message);
        return [0,err.message];

    }
}



}