import { CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth0Authorizer')

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // TODO: Implement token verification => DONE
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  if (!jwt) throw new Error("invalid token");
  
  const { header: { kid } } = jwt;
  const jwkeySecrect = await Axios.get(jwksUrl);

  const signingKS = jwkeySecrect.data.keys.filter((k: { kid: string }) => k.kid === kid)[0];
  if (!signingKS) throw new Error(`Unable to find a signing key that matches '${kid}'`);
  
  const { x5c } = signingKS;
  const certify = `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`;
  return verify(token, certify, { algorithms: ["RS256"] }) as JwtPayload;
 
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
// TODO: Provide a URL that can be used to download a certificate that can be used => DONE
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-d-vngzq8.us.auth0.com/.well-known/jwks.json'
export const handler = async (
  event: { authorizationToken: string }
): Promise<CustomAuthorizerResult> => {
  // try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('handler authorized with user token', jwtToken)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  // } catch (e) {
  //   logger.error('handler authorized error', { error: e.message })
  //   return {
  //     principalId: 'user',
  //     policyDocument: {
  //       Version: '2012-10-17',
  //       Statement: [
  //         {
  //           Action: 'execute-api:Invoke',
  //           Effect: 'Deny',
  //           Resource: '*'
  //         }
  //       ]
  //     }
  //   }
  // }
}

