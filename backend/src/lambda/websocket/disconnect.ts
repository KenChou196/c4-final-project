import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.WEBSOCKET_CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const connectionId = event.requestContext.connectionId
        const key = {
            id: connectionId
        }

        console.log('Removing websocket connection with id: ', connectionId)

        await docClient.delete({
            TableName: connectionsTable,
            Key: key
        }).promise()

        return {
            statusCode: 200,
            body: ''
        }
    }
    catch (error) {
        console.log('Cannot remove websocket connection from DB')
        return {
            statusCode: 500,
            body: 'Internal Server Error'
        }
    }
}
