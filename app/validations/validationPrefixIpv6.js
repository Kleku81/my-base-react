const helper = require("../helpers/validate")
const ip6addr = require('ip6addr')

const addressIpv6Validation = (slines, array_all, array_fail_result, io) => {

    try {

        
        for (let i = 0; i < slines.length; i++) {

            const sline = slines[i].replace(/"/g, "").split(";")
            //console.log(for_iter);
           


            if (!helper.ipv6RegExp(sline[0])) {

                array_fail_result.push(sline[0] + " => " + 'Niepoprawny adres IPv6!')
                //break;
                //i_line ++;
                slines.splice(i, 1)
                i--;
                continue;
                //throw new Error('Linia zawiera niepoprawny adres IPv6!');
            }

            if (!helper.ipCidrTest(sline[0], "ipv6")) {

                array_fail_result.push(line + " => " + 'Niepoprawny CIDR IPv6!')
                //break; 
                //i_line ++;
                slines.splice(i, 1)
                i--;
                continue;
                //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
            }
            //var start_iteracja = Date.now();
            const prefix = ip6addr.createCIDR(sline[0]).toString({ format: 'v6' })
            //if (array_all.filter(obj => obj.prefix === prefix).length == 1) {
                if (helper.checkExistanceIpv6(array_all, prefix)){
                //if (array_all.indexOf()) {  

                array_fail_result.push(sline[0] + " => " + 'Ten prefix juz istnieje')
                //break; 
                //i_line ++;
                //i_line++;
                //console.log(i_line);
                //io.emit("loading", ((i_line / array_file.length) * 100)*0.9);
                slines.splice(i, 1)
                //var end_iteracja = Date.now();
                //console.log(` Execution iteracja validation exist: ${end_iteracja - start_iteracja} ms`);
                i--;

                continue;
                //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
            }

           

        }
        return true;
    } catch (err) {

        console.log(err)
        throw "wystąpił bład przy walidacji";





    }
}


module.exports = { addressIpv6Validation }