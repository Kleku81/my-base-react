const helper = require("../helpers/validate")

const addressIpv6Validation = (slines, array_all, array_fail_result) => {

    try {

        for (const i = 0; i < slines.length; i++) {

            const sline = slines[i].replace(/"/g, "").split(";")


            if (!helper.ipv6RegExp(sline[0])) {

                array_fail_result.push(sline[0] + " => " + 'Niepoprawny adres IPv6!')
                //break;
                //i_line ++;
                slines.splice(i, 1)
                break;
                //throw new Error('Linia zawiera niepoprawny adres IPv6!');
            }

            if (!helper.ipCidrTest(sline[0], "ipv6")) {

                array_fail_result.push(line + " => " + 'Niepoprawny CIDR IPv6!')
                //break; 
                //i_line ++;
                slines.splice(i, 1)
                break;
                //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
            }
            if (array_all.filter(obj => obj.prefix == ip6addr.createCIDR(sline[0]).toString({ format: 'v6' })).length == 1) {

                array_fail_result.push(sline[0] + " => " + 'Ten prefix juz istnieje')
                //break; 
                //i_line ++;
                //i_line++;
                //console.log(i_line);
                //io.emit("loading", ((i_line / array_file.length) * 100)*0.9);
                slines.splice(i, 1)
                break;
                //throw new Error('Linia zawiera niepoprawny CIDR IPv6!');
            }

        }
        return true;
    } catch { err }

    console.log(err)
    throw "wystąpił bład przy walidacji";





}


module.exports = { addressIpv6Validation }