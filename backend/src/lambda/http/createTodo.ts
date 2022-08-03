import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import * as uuid from "uuid";
import { createLogger } from '../../utils/logger'
const logger = createLogger('BE - createTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      // TODO: Implement creating a new TODO item => DONE
      const userId = getUserId(event);
      const todoId = uuid.v4();
      const itemTodo = await createTodo(todoId, newTodo, userId);
      logger.log(`createTodos success`, userId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          item: itemTodo,
        }),
      }
    } catch (error) {
      logger.error(`create item ${error.message}`,'log');
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
