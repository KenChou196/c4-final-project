import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { customLog } from '../../utils/customLog'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId = getUserId(event)
    const response = await deleteTodo(todoId, userId)
    customLog(`delete item ${JSON.stringify(response)}`,'log')
    return {
      statusCode: 200,
      body: null
    }
    } catch (error) {
      customLog(`delete item ${JSON.stringify(error)}`,'log')
      return {
        statusCode: 401,
        body: null
      }
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
