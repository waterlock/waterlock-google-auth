'use strict';

exports = module.exports = GoogleOAuth2Crypto;

/**
 *
 * @param modulus_b64
 *        the base64 encoded modulus
 * @param exponent_b64
 *        the base64 encoded exponent
 * @constructor
 */
function GoogleOAuth2Crypto(modulus_b64, exponent_b64){
  this._modulus_b64 = modulus_b64;
  this._exponent_b64 = exponent_b64;
}

//http://stackoverflow.com/questions/18835132/xml-to-pem-in-node-js
GoogleOAuth2Crypto.prototype.toPemEncodedPublicKey = function() {
  var modulus = new Buffer(this._modulus_b64, 'base64');
  var exponent = new Buffer(this._exponent_b64, 'base64');
  var modulus = new Buffer(modulus_b64, 'base64');
  var exponent = new Buffer(exponent_b64, 'base64');

  var modulus_hex = modulus.toString('hex');
  var exponent_hex = exponent.toString('hex');

  modulus_hex = this.prepadSigned(modulus_hex);
  exponent_hex = this.prepadSigned(exponent_hex);

  var modlen = modulus_hex.length/2;
  var explen = exponent_hex.length/2;

  var encoded_modlen = this.encodeLengthHex(modlen);
  var encoded_explen = this.encodeLengthHex(explen);
  var encoded_pubkey = '30' +
    this.encodeLengthHex(
      modlen +
      explen +
      encoded_modlen.length/2 +
      encoded_explen.length/2 + 2
    ) +
    '02' + encoded_modlen + modulus_hex +
    '02' + encoded_explen + exponent_hex;

  var der_b64 = new Buffer(encoded_pubkey, 'hex').toString('base64');

  var pem = '-----BEGIN RSA PUBLIC KEY-----\n'
    + der_b64.match(/.{1,64}/g).join('\n')
    + '\n-----END RSA PUBLIC KEY-----\n';

  return pem;
};

GoogleOAuth2Crypto.prototype.prepadSigned = function(hexStr) {
  var msb = hexStr[0];
  if (msb < '0' || msb > '7') {
    return '00'+hexStr;
  } else {
    return hexStr;
  }
};

GoogleOAuth2Crypto.prototype.toHex = function(number) {
  var nstr = number.toString(16);
  if (nstr.length%2) {
    return '0'+nstr;
  }
  return nstr;
};

// encode ASN.1 DER length field
// if <=127, short form
// if >=128, long form
GoogleOAuth2Crypto.prototype.encodeLengthHex = function(n) {
  if (n<=127) {
    return this.toHex(n);
  }
  else {
    var n_hex = this.toHex(n);
    var length_of_length_byte = 128 + n_hex.length/2; // 0x80+numbytes
    return this.toHex(length_of_length_byte)+n_hex;
  }
};
