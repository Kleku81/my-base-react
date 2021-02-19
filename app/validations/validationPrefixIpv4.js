const helper = require("../helpers/validate")
//const ip6addr = require('ip6addr')

const addressIpv4Validation = (slines, array_all, array_fail_result) => {

    try {

        for (let i = 0; i < slines.length; i++) {

            if (!slines[i]) {
                slines.splice(i, 1)
                i--;
                continue;
            }

            const sline = slines[i].replace(/"/g, "").split(";")


            if (!helper.ipv4RegExp(sline[0])) {

                array_fail_result.push(sline[0] + " => " + 'Niepoprawny adres IPv4!')
                //break;
                //i_line ++;
                slines.splice(i, 1)
                i--;
                continue;
                //throw new Error('Linia zawiera niepoprawny adres IPv6!');
            }

            if (!helper.ipCidrTest(sline[0], "ipv4")) {

                array_fail_result.push(line + " => " + 'Niepoprawny CIDR IPv4!')
                //break; 
                //i_line ++;
                slines.splice(i, 1)
                i--;
                continue;
                //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
            }
            //if (array_all.filter(obj => obj.prefix == sline[0]).length == 1) {
            if (helper.checkExistanceIpv4(array_all, sline[0])) {

                array_fail_result.push(sline[0] + " => " + 'Ten prefix juz istnieje')
                //break; 
                //i_line ++;
                //i_line++;
                //console.log(i_line);
                //io.emit("loading", ((i_line / array_file.length) * 100)*0.9);
                slines.splice(i, 1)
                i--;
                continue;
                //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
            }

        }

        // for (let i = 0; i < slines.length; i++) {
        //     const sline = slines[i].replace(/"/g, "").split(";")

        //     const checkduplicationInFile = (prefix, slines) => {
        //         for (let j = i + 1; j < slines.length; j++) {

        //             const sline1 = slines[j].replace(/"/g, "").split(";")
        //             //const test1 = ip6addr.createCIDR(prefix.toString({ zeroElide: false, zeroPad: true }))
        //             //const test2 = ip6addr.createCIDR(sline1[0]).toString({ zeroElide: false, zeroPad: true })

        //             if ( prefix == sline1[0] ) {

        //                 array_fail_result.push(sline1[0] + " => " + 'Duplikacja prefix w pliku')
        //                 slines.splice(j, 1)
        //                 //i--;
        //                 j--;
        //             }

        //         }


        //     }

        //     checkduplicationInFile(sline[0], slines);
        // }


        return true;
    } catch (err) {

        console.log(err)
        throw "wystąpił bład przy walidacji";





    }
}


module.exports = { addressIpv4Validation }