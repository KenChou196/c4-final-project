import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as uuid from "uuid";
import { createLogger } from '../../utils/logger'
const logger = createLogger('BE - generateUploadUrl')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
      const userId = getUserId(event)
      const imageId = uuid.v4()
      const uploadUrl: String = await createAttachmentUrl(
        todoId,
        imageId,
        userId
      );
      logger.log(`create url success `, uploadUrl )
      return {
        statusCode: 201,
        body: JSON.stringify({ uploadUrl }),
      };
    } catch (error) {
      logger.error(`Error when generate Upload Url ${(error as Error).message}`)
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
