import base64url from "base64url";
import crypto from "crypto";

export function jwtDecode(jwt) {
  try {
    // 1.   Verify that the JWT contains at least one period ('.')
    //        character.
    if (!jwt.includes(".")) {
      throw new Error("Need at least one '.'");
    }

    // 2.   Let the Encoded JOSE Header be the portion of the JWT before the
    //     first period ('.') character.
    const components = jwt.split(".");
    const header = components[0];

    // 3.   Base64url decode the Encoded JOSE Header following the
    // restriction that no line breaks, whitespace, or other additional
    // characters have been used.
    const base64DecodedHeader = base64url.decode(header);
    if (!base64DecodedHeader) {
      console.err("base64DecodedHeader");
      console.err(base64DecodedHeader);
      throw new Error("Header isn't base64url encoded");
    }

    // 4.   Verify that the resulting octet sequence is a UTF-8-encoded
    //         representation of a completely valid JSON object conforming to
    //         RFC 7159 [RFC7159]; let the JOSE Header be this JSON object.
    const jsonHeader = JSON.parse(base64DecodedHeader);

    // 5.   Verify that the resulting JOSE Header includes only parameters
    //     and values whose syntax and semantics are both understood and
    //     supported or that are specified as being ignored when not
    //     understood.
    const { typ, cty, alg } = jsonHeader;

    if (typ && typ !== "JWT") {
      throw new Error(`Need to be type jwt. Received: ${typ}`);
    }
    if (cty && cty !== "JWT") {
      throw new Error(`Need a cty of 'JWT'. Received: ${cty}`);
    }
    if (!alg) {
      throw new Error("Missing algorithm in JOSE header.");
    }

    // 6.   Determine whether the JWT is a JWS or a JWE using any of the
    //         methods described in Section 9 of [JWE].
    if (components.length === 3) {
      // JWS
      // 7a   If the JWT is a JWS, follow the steps specified in [JWS] for
      // validating a JWS.  Let the Message be the result of base64url
      // decoding the JWS Payload.
      const payload = components[1];
      const base64urlDecodedPayload = base64url.decode(payload);
      const jsonPayload = JSON.parse(base64urlDecodedPayload);

      return {
        header: jsonHeader,
        payload: jsonPayload,
        signature: components[2],
      };
    }

    if (components.length === 5) {
      throw new Error("JWE not currently supported.");
      // TODO
      // // JWE
      // // 7b   Else, if the JWT is a JWE, follow the steps specified in
      // //      [JWE] for validating a JWE.  Let the Message be the resulting
      // //      plaintext.
      // // When using the JWE Compact Serialization, the
      // //   JWE Protected Header, the JWE Encrypted Key, the JWE
      // //   Initialization Vector, the JWE Ciphertext, and the JWE
      // //   Authentication Tag are represented as base64url-encoded values
      // //   in that order, with each value being separated from the next by
      // //   a single period ('.') character, resulting in exactly four
      // //   delimiting period characters being used.
      // // header = components[0]
      // const key = components[1];
      // const initVector = components[2];
      // const ciphertext = components[3];
      // const authnTag = components[4];

      // // const base64urlDecodedKey = base64url.decode(key);
      // const base64urlDecodedKey = base64url.toBuffer(key).toString();
      // const base64urlDecodedInitVector = base64url.decode(initVector);
      // const base64urlDecodedCiphertext = base64url.decode(ciphertext);
      // const base64urlDecodedAuthnTag = base64url.decode(authnTag);

      // switch(alg) {

      // }
    } else {
      throw new Error("Not using compact serialization.");
    }
  } catch (e) {
    console.error(e.message, e);
    return { header: "header", payload: "payload", signature: "signature" };
  }
}

function hs256(value, key) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(value);
  return hmac.digest("utf8");
}

export function jwtEncode(header, payload, key) {
  let jsonHeader;
  try {
    jsonHeader = JSON.parse(header);
  } catch (e) {
    // Is it invald json syntax or is it not a string
    console.err(`${e.name}:${e.message}`);
  }
  console.log("jsonHeader");
  console.log(jsonHeader);

  const headerBase64URL = base64url.encode(header);
  console.log("headerBase64URL");
  console.log(headerBase64URL);
  console.log("eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9");
  const payloadBase64URL = base64url.encode(JSON.stringify(payload));
  console.log("payloadBase64URL");
  console.log(payloadBase64URL);
  console.log(
    "eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ"
  );
  const headerPayload = `${headerBase64URL}.${payloadBase64URL}`;
  console.log("headerPayload");
  console.log(headerPayload);
  const headerPayloadBuff = Buffer.from(headerPayload, "ascii");
  console.log("headerPayloadBuff");
  console.log(headerPayloadBuff);
  const { alg } = JSON.parse(header);
  console.log("alg");
  console.log(alg);
  let sig;
  switch (alg) {
    case "HS256":
      sig = Buffer.from(hs256(headerPayload, key)).toString("utf8");
      break;
    default:
      throw new Error(`Unsupported alg.${alg}`);
  }
  console.log("sig");
  console.log(sig);
  const sigBase64URL = base64url.encode(Buffer.from(sig, "ascii").toString());
  console.log("sigBase64URL");
  console.log(sigBase64URL);
  const sigBase64URL2 = base64url.encode(Buffer.from(sig, "utf8").toString());
  console.log("sigBase64URL2");
  console.log(sigBase64URL2);
}
