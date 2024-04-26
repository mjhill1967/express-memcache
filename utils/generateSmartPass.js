var crypto = require('crypto');

var fields = {
    "members.tier.id": "standard",
    "person.forename": "Test",
    "person.surname": "Person",
    "person.emailAddress": "mrmichaeljh@gmail.com",
    "universal.expiryDate":"2024-05-31T22:59:59Z",
    "members.member.externalId":"999000111222"
  }
  
  console.log(JSON.stringify(fields))

  const default_sig = process.env.PASSKIT_DEFAULT_SECRET
  const default_id = process.env.PASSKIT_DEFAULT_ID
  const default_url = process.env.PASSKIT_DEFAULT_URL
  
exports.passkitURL = async ( params ) => {
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

    const distributionUrl = params.url + params.id
    console.log( distributionUrl )
    let newpass_url = GenerateSmartPassLink( fields, distributionUrl, params.sig );
    console.log( newpass_url )
    return newpass_url;
}

const GenerateSmartPassLink = (fields, distributionURL, key) => {
    const base64JsonPayload = btoa( JSON.stringify(fields) );
    let link = distributionURL + '?data=' + base64JsonPayload;
    //creating hmac object 
    var hmac = crypto.createHmac('sha256', key);
    //passing the data to be hashed
    data = hmac.update( link );
    //Creating the hmac in the required format
    gen_hmac= data.digest('hex');

    link = link + '&sig=' + gen_hmac;

    return link;
  };