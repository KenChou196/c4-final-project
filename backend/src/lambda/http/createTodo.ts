import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import * as uuid from "uuid";
import { customLog } from '../../utils/customLog'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      // TODO: Implement creating a new TODO item => DONE
      const userId = getUserId(event);
      const todoId = uuid.v2();
      const itemTodo = await createTodo(todoId, newTodo, userId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          item: itemTodo,
        }),
      }
    } catch (error) {
      customLog(`create item ${JSON.stringify(error)}`,'log')
      return {
        statusCode: 401,
        body: null
      }
    }
    
  }
)

handler.use(
  cors({
    credentials: true
  })
)
