import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);
// create logger;
const logger = createLogger('BE - TodosAccessLogger ')
function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      return new XAWS.DynamoDB.DocumentClient({
        region: "localhost",
        endpoint: "http://localhost:8000",
      });
    }
  
    return new XAWS.DynamoDB.DocumentClient();
  }
// TODO: Implement the dataLayer logic
export class TodosAccess {
  // init class property;
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todo_table = process.env.TODOS_TABLE,
    private readonly todo_index = process.env.TODOS_CREATED_AT_INDEX,
    private readonly s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET,
    private readonly url_expiration = process.env.S3_URL_EXPIRATION,
    private readonly s3 = new XAWS.S3({
      signatureVersion: "v4",
    })
  ) {}
  // init class method
  async getTodos(userId: String): Promise<any> {
    try {
      const result = await this.docClient
      .query({
        TableName: this.todo_table,
        IndexName: this.todo_index,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      }, (error: AWS.AWSError, data: AWS.DynamoDB.DocumentClient.QueryOutput) => {
        if (error) {
          logger.error(`getTodos error ${JSON.stringify(error)}`)
        } else {
          logger.log('getTodos success', data);
        }
      })
      .promise();
      const items = result.Items
      logger.info("getTodos invoke", {
        userId: userId,
        date: new Date().toISOString
      })
      return items as TodoItem[];
    } catch (error) {
      logger.error(`getTodos error ${(error as Error).message}`)
    }
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    try {
      this.docClient
      .put({
        TableName: this.todo_table,
        Item: todo,
      })
      .promise()
      logger.info("createTodo invoke", {
        userId: todo.userId,
        todoId: todo.todoId,
        date: new Date().toISOString
      })
      return todo as TodoItem;
    } catch (error) {
      logger.error(`createTodo Error=  ${error.message}`)
    }
  }

  async updateTodo(
    todoId: String,
    updatedTodo: TodoUpdate,
    userId: String
  ): Promise<TodoUpdate> {
    try {
      this.docClient.update(
        {
          TableName: this.todo_table,
          Key: {
            todoId,
            userId,
          },
          UpdateExpression: "set #name = :n, #dueDate = :due, #done = :d",
          ExpressionAttributeValues: {
            ":n": updatedTodo.name,
            ":due": updatedTodo.dueDate,
            ":d": updatedTodo.done,
          },
          ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done",
          },
        },
        function (err, data) {
          if (err) {
            logger.error(`error update todo access ${err.message}`) ;
          } else {
            logger.log("Element updated ", data);
          }
        }
      );
      return updatedTodo
    } catch (error) {
      logger.error(`updateTodo Error with Id: ${todoId} of user: ${userId}`);
    }
  }

  async deleteTodo(todoId: String, userId: String): Promise<void> {
    try {
      this.docClient.delete(
        {
          TableName: this.todo_table,
          Key: {
            todoId,
            userId,
          },
        },
        function (err) {
          if (err) {
            logger.info("Delete todo Error", {
              userId: userId,
              todoId: todoId,
              date: new Date().toISOString,
              message: err.message
            })
          } else {
            logger.info("Delete todo item", {
              userId: userId,
              todoId: todoId,
              date: new Date().toISOString
            })
          }
        }
      );
    } catch (error) {
      logger.error(`Error when delete totos ${(error as Error).message}`)
    }
  }

  async createAttachmentUrl(
    todoId: String,
    imageId: String,
    userId: String
  ): Promise<string> {
    try {
      const attachmentUrl = await this.s3.getSignedUrl("putObject", {
        Bucket: this.s3_bucket_name,
        Key: imageId,
        Expires: this.url_expiration,
      });

      this.docClient.update(
        {
          TableName: this.todo_table,
          Key: {
            todoId,
            userId,
          },
          UpdateExpression: "set attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": `https://${this.s3_bucket_name}.s3.amazonaws.com/${imageId}`,
          },
        },
        function (err) {
          if (err) {
            logger.info("attachmentUrl error", {
              userId: userId,
              todoId: todoId,
              date: new Date().toISOString,
              message: err.message
            })
          } else {
            logger.info("attachmentUrl INIT", {
              userId: userId,
              todoId: todoId,
              date: new Date().toISOString,
              message: err.message
            })
          }
        }
      );
      return attachmentUrl;
    } catch (error) {
      logger.error(`error createAttachmentUrl ${error.message}`)
    }
  }
}

