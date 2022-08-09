import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { sendMessageToAllCurrentWsConnections } from '../../utils/ws'
const logger = createLogger('BE - updateTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
      const { pathParameters: { todoId } } = event;
      const updatedTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
      const userId = getUserId(event)
      const item = await updateTodo(todoId, updatedTodoRequest, userId);
      logger.log(`updateTodo success`, item)
      sendMessageToAllCurrentWsConnections('a todo has been updated')
      return {
        statusCode: 200,
        body: JSON.stringify({
          item,
        }),
      }
    } catch (error) {
      logger.error(`updateTodo faile ${error.message}`)
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
