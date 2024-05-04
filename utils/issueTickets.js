const request = require('axios');

const eventTicketByIdUrl = "https://api.pub1.passkit.io/eventTickets/ticket/id"


exports.issueTicket = async ( params ) => {
    if (params.sig == undefined ) {
        params.sig = default_sig;
    }
    if (params.id == undefined ) {
        params.id = default_id;  
    } 
    if (params.url == undefined ) {
        params.url = default_url;          
    }
    if (params.fields == undefined ) {
        console.log( JSON.stringify( fields ) )
    } else {
        fields = JSON.parse(params.fields);
    }

}

// Generates the jwt token from an api key and secret
var token = generateJWT("YOUR_API_KEY", "YOUR_API_SECRET");

// The Authorisation header of the HTTP request contains "PKAuth " + token string
document.getElementById("authToken").innerHTML = token;
  // I replaced the space with a non breaking space purely for format reasons.
document.getElementById("debugLink").href = "https://jwt.io/#id_token=" + token

function generateJWT(key, secret) {		
    var body = {
        "uid": key,
        "exp": Math.floor(new Date().getTime() / 1000) + 3600,
        "iat": Math.floor(new Date().getTime() / 1000),
        "web": true,
    };

    header = {
        "alg": "HS256",
        "typ": "JWT"
    };
    var token = [];
    token[0] = base64url(JSON.stringify(header));
    token[1] = base64url(JSON.stringify(body));
    token[2] = genTokenSign(token, secret);

   return token.join(".");
}

function genTokenSign(token, secret) {
    if (token.length != 2) {
        return;
    }
    var hash = CryptoJS.HmacSHA256(token.join("."), secret);
    var base64Hash = CryptoJS.enc.Base64.stringify(hash);
    return urlConvertBase64(base64Hash);
}


function base64url(input) {
    var base64String = btoa(input);
    return urlConvertBase64(base64String);
}

function urlConvertBase64(input) {
    var output = input.replace(/=+$/, '');
    output = output.replace(/\+/g, '-');
    output = output.replace(/\//g, '_');

   return output;
}