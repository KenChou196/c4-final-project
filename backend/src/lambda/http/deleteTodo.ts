import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { sendMessageToAllCurrentWsConnections } from '../../utils/ws'
const logger = createLogger('BE - deleteTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      // TODO: Remove a TODO item by id
      const userId = getUserId(event);
      await deleteTodo(todoId, userId);
      logger.log(`delete item success`,'log');
      sendMessageToAllCurrentWsConnections('A todo has been deleted')
      return {
        statusCode: 200,
        body: 'DELETE SUCCESS'
      }
    } catch (error) {
      logger.error(`delete item ${error.message}`,'log')
    }
  }
)
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
