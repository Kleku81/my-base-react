"use strict";

const PrefixIpv6 = require("../models/prefixIpv6");


async function takeNest(id, ids, dbName) {

    //ids.push(id);

    var root = await PrefixIpv6.find({ _id: id, dbName:dbName });
    root.children = await PrefixIpv6.find({ parent: root[0].prefix });
    for (const element of root.children) {

        console.log(element.prefix);
        ids.push(element._id);

        var nest = await PrefixIpv6.find({ parent: element.prefix, dbName:dbName });
            if (nest.length > 0) {
                await takeNest(element._id, ids)
            }



    }

}
//var ids = [];

module.exports = {

    takeChild: async (id, ids, dbName) => {

        ids.push(id);

        var root = await PrefixIpv6.find({ _id: id, dbName: dbName });

        root.children = await PrefixIpv6.find({ parent: root[0].prefix, dbName : dbName });

        for (const element of root.children) {
            console.log(element.prefix);
            ids.push(element._id);
            var nest = await PrefixIpv6.find({ parent: element.prefix, dbName : dbName });
            if (nest.length > 0) {
                await takeNest(element._id, ids)
            }
            //console.log(nest);


        }

        console.log("test");
        return 1;

    }


}

