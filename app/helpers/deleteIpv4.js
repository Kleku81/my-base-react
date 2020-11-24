"use strict";

const PrefixIpv4 = require("../models/prefixIpv4");


async function takeNest(id, ids) {

    //ids.push(id);

    var root = await PrefixIpv4.find({ _id: id });
    root.children = await PrefixIpv4.find({ parent: root[0].prefix });
    for (const element of root.children) {

        console.log(element.prefix);
        ids.push(element._id);

        var nest = await PrefixIpv4.find({ parent: element.prefix });
            if (nest.length > 0) {
                await takeNest(element._id, ids)
            }



    }

}
//var ids = [];

module.exports = {

    takeChild: async (id, ids) => {

        ids.push(id);

        var root = await PrefixIpv4.find({ _id: id });

        root.children = await PrefixIpv4.find({ parent: root[0].prefix });

        for (const element of root.children) {
            console.log(element.prefix);
            ids.push(element._id);
            var nest = await PrefixIpv4.find({ parent: element.prefix });
            if (nest.length > 0) {
                await takeNest(element._id, ids)
            }
            //console.log(nest);


        }

        console.log("test");
        return 1;

    }


}

