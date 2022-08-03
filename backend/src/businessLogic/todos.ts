import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess();

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodos(userId);
}

export async function createTodo(
  todoId: String,
  createTodoRequest: CreateTodoRequest,
  userId: string,
): Promise<TodoItem> {
  const todo = todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt:  new Date().toISOString(),
    attachmentUrl: undefined,
  } as TodoItem);

  return todo;
}

export async function updateTodo(
  todoId: String,
  updatedTodo: UpdateTodoRequest,
  userId: String
): Promise<TodoUpdate> {
  const updatedTodoRs = await todoAccess.updateTodo(todoId, updatedTodo, userId);
  return updatedTodoRs
}

export async function deleteTodo(
  todoId: String,
  userId: String
): Promise<void> {
  todoAccess.deleteTodo(todoId, userId);
}

export async function createAttachmentUrl(
  todoId: String,
  imageId: String,
  userId: String
): Promise<string> {
  return todoAccess.createAttachmentUrl(todoId, imageId, userId);
}

