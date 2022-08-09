import * as AWS from 'aws-sdk'
import 'source-map-support/register'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.WEBSOCKET_CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
  apiVersion: '2018-11-29',
  endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

export async function sendMessageToAllCurrentWsConnections(payload) {
  const connections = await docClient
    .scan({
      TableName: connectionsTable
    })
    .promise()

  for (const connection of connections.Items) {
    const connectionId = connection.id
    await sendMessageToWsConnection(connectionId, payload)
  }
}

export async function sendMessageToWsConnection(connectionId, payload) {
  try {
    console.log('Sending message to a websocket connection...', connectionId)

    await apiGateway
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(payload)
      })
      .promise()
  } catch (e) {
    console.log('Failed to send message', JSON.stringify(e))
    if (e.statusCode === 410) {
      console.log('This connection is not available any more, deleting...')

      await docClient
        .delete({
          TableName: connectionsTable,
          Key: {
            id: connectionId
          }
        })
        .promise()
    }
  }
}
