import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {  getTodos  } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import { sendMessageToAllCurrentWsConnections } from '../../utils/ws'
const logger = createLogger('BE - getTodos :')
// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    try {
      const userId = getUserId(event)
      const todos = await getTodos(userId)
      const body = JSON.stringify({ items: todos })
      logger.log(`===== Get todos success =====`, userId);
      sendMessageToAllCurrentWsConnections('someone get all todos')
      return {
        statusCode: 200,
        body,
      };
    } catch (error) {
      logger.error(`===== Get todos error =====`, error.message)
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
