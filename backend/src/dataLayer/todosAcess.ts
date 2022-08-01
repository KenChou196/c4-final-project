import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { customLog } from '../utils/customLog';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      customLog("Init local DynamoDB", 'log');
      return new XAWS.DynamoDB.DocumentClient({
        region: "localhost",
        endpoint: "http://localhost:8000",
      });
    }
  
    return new XAWS.DynamoDB.DocumentClient();
  }
// TODO: Implement the dataLayer logic
export class TodosAccess {
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

  async getTodos(userId: String): Promise<any> {
    customLog(`Get List todo with userId =  ${userId}`, 'log')
    try {
      const result = await this.docClient
      .query({
        TableName: this.todo_table,
        IndexName: this.todo_index,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
      .promise();
      const items = result.Items
      logger.info("Get list todo", {
        userId: userId,
        date: new Date().toISOString
      })
      return items as TodoItem[];
    } catch (error) {
      customLog(`error when get todo ${(error as Error).message}`, 'log')
    }
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    customLog(`Get List todo with userId =  ${JSON.stringify(todo)}`, 'log')
    this.docClient
      .put({
        TableName: this.todo_table,
        Item: todo,
      })
      .promise()
      // .then(() => {
      //   logger.info("Create a new item todo", {
      //     userId: todo.userId,
      //     todoId: todo.todoId,
      //     date: new Date().toISOString
      //   })
      //   return todo as TodoItem;
      // })
      // .catch(error => {
      //   console.log(`error create todo ${(error as Error).message}`);
      //   return todo as TodoItem;
      // })
      logger.info("Create a new item todo", {
        userId: todo.userId,
        todoId: todo.todoId,
        date: new Date().toISOString
      })
      return todo as TodoItem;
  }

  async updateTodo(
    todoId: String,
    updatedTodo: TodoUpdate,
    userId: String
  ): Promise<TodoUpdate> {
    console.log("Updating todoId: ", todoId, " userId: ", userId);

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
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
    logger.info("Update a todo", {
      userId: userId,
      todoId: todoId,
      date: new Date().toISOString
    })
    return updatedTodo
  }

  async deleteTodo(todoId: String, userId: String): Promise<void> {
    console.log("Start delete todo with id: ", todoId, " of user with id: ", userId);
    this.docClient.delete(
      {
        TableName: this.todo_table,
        Key: {
          todoId,
          userId,
        },
      },
      function (err, data) {
        if (err) {
          throw new Error("Error when delete  ror " + err);
        }
      }
    );
    logger.info("Delete todo item", {
      userId: userId,
      todoId: todoId,
      date: new Date().toISOString
    })
  }

  async createAttachmentPresignedUrl(
    todoId: String,
    imageId: String,
    userId: String
  ): Promise<string> {
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
      function (err, data) {
        if (err) {
          console.log("ERRROR " + err);
          throw new Error("Error " + err);
        } else {
          console.log("Element updated " + data);
        }
      }
    );
    logger.info("Creata a signedUrl", {
      userId: userId,
      todoId: todoId,
      date: new Date().toISOString
    })
    return attachmentUrl;
  }
}

