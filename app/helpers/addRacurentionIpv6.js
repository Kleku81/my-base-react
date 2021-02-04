const ip6addr = require('ip6addr')
const { sortSourceIpv6, sortedIndexIpv6, list_to_tree, takeMask, takeAddress, generateList } = require("./validate.js");


const checkPrefixes = (prefix, arr, parent ) => {
    let putted = false;
    //const arr_length = arr.length
    for (let i = 0; i < arr.length; i++) {
        //console.log(i);


        var veryfing = checkPrefix(prefix, arr[i]);

        if (veryfing == 1) {

            //if (arr[i].children.length > 0) {
                return checkPrefixes(prefix, arr[i].children, arr[i]._doc.prefix );
            //}
        }
        else if (veryfing == -1) {

            temp_item = arr[i];
            temp_item.parent = prefix.prefix;
            // if (putted == false) {
            //     arr[i] = prefix;
            //     putted = true;
            // }
            // else if (putted == true)
            // {
                
            // }
            arr.splice(i,1);
            i--;
            //prefix.children.push(temp_item);
            temp_item.updated = true; 
            //temp_item.isNew = true;
            prefix.children.splice(sortedIndexIpv6(prefix.children, temp_item),0,temp_item)
        }

    }
    prefix.parent = parent;
    prefix.created = true;
    arr.splice(sortedIndexIpv6(arr, prefix),0,prefix);
    
    return 0;
}
const checkPrefix = (prefix, prefix_iter) => {

    if (prefix_iter._doc.mask < prefix._doc.mask) {


        if (ip6addr.createCIDR(prefix_iter._doc.prefix).contains(takeAddress(prefix._doc.prefix)) == true) {
            //matched_prefix_up = prefix_iter;
            //prefixes = array_all.filter(obj => obj.parent == prefix_iter.prefix)
            //prefixes = prefixes.sort(sortSourceIpv6);
            //i = 0;
            //}

            return 1
        }
    }
    else if (prefix_iter._doc.mask > prefix._doc.mask) {


        if (ip6addr.createCIDR(prefix._doc.prefix).contains(takeAddress(prefix_iter._doc.prefix)) == true) {
            //matched_prefix_down.push(prefix_iter); AQ

            return -1
        }
    }
    return 0
}

module.exports = {checkPrefixes};