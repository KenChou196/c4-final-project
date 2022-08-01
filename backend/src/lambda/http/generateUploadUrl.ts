import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as uuid from "uuid";
import { customLog } from '../../utils/customLog'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
      const userId = getUserId(event)
      const imageId = uuid.v2()
      const uploadUrl: String = await createAttachmentPresignedUrl(
        todoId,
        imageId,
        userId
      );
      return {
        statusCode: 201,
        body: JSON.stringify({ uploadUrl }),
      };
    } catch (error) {
      customLog(`Error when generate Upload Url ${(error as Error).message}`, 'log')
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
