// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '571dxr6rzb'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`
// https://ovespwwc66.execute-api.us-east-1.amazonaws.com/dev/todos

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-d-vngzq8.us.auth0.com',
  domain: 'dev-d-vngzq8.us.auth0.com',            // Auth0 domain
  clientId: 'fCPICip7FSdvuy1C2JgbinvvaoLANjdd',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
