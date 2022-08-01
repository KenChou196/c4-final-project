import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {  getTodos  } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { customLog } from '../../utils/customLog'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    try {
      const userId = getUserId(event)
      const todos = await getTodos(userId)
      return {
        statusCode: 200,
        body: JSON.stringify(todos),
      };
    } catch (error) {
      customLog(`Error when get list todos ${(error as Error).message}`, 'log')
      return {
        statusCode: 401,
        body: 'Error get list todos',
      };
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
