"use strict";

const PrefixIpv4 = require("../models/prefixIpv4"),
    helper = require("../helpers/validate"),
    ip = require('ip');
    const { checkPrefixes } =require("../helpers/addRacurentionIpv4");
    //fs = require('fs');

    function delay(t, v) {
        return new Promise(function (resolve) {
            setTimeout(resolve.bind(null, v), t)
        });
    }

module.exports =  {
    

    //saveAddress: async (line) => {


        saveline_v2: async (sline, array_tree, array_fail_result, dbName) => {
            try {
    
                var prefix = new PrefixIpv4({
                    prefix: sline[0],
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
    
    
        },

    saveAddress:  async (line, dbName) => {

        try{
        line = line.replace(/"/g, "");
        var sline = line.split(";");
        //var prefixes = await PrefixIpv4.find({ "parent": "#" });
        //await prefixDAO.saveAddress(sline[0], sline[3], sline[4], sline[5], sline[6], sline[7]);
        if(!helper.ipv4RegExp(sline[0]))
        {
            throw new Error('Linia zawiera niepoprawny adres IPv4!');
        }

        if(!helper.ipCidrTest(sline[0],"ipv4"))
        {
            throw new Error('Linia zawiera niepoprawny CIDR IPv4!');
        }
        

        var prefix = new PrefixIpv4({
            prefix: sline[0],
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
            var prefixes =  await PrefixIpv4.find({ "parent": "#", "dbName": dbName  });
            var prefix_iter;
            var matched_prefix_up = null;
            var matched_prefix_down = [];
            var i = 0;
            while (prefixes.length > 0 && i < prefixes.length) {
                // for (i = 0; i < prefix.length; i++) {
                prefix_iter = prefixes[i];
                //if()
                if (prefix_iter.mask < prefix.mask) {
                    if (ip.cidrSubnet(prefix_iter.prefix).contains(adress) == true) {
                        matched_prefix_up = prefix_iter;
                        //await PrefixIpv4.populate(prefix_iter, "subnetworks").then(prefix_1 => console.log(prefix_1));
                        prefixes = await  PrefixIpv4.find({ "parent": prefix_iter.prefix });
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
                    if (ip.cidrSubnet(prefix.prefix).contains(helper.takeAddress(prefix_iter.prefix)) == true) {
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