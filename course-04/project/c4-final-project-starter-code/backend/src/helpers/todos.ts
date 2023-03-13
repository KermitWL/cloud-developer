import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('Todos Business Logic')

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info("getting Todos for user " + userId)
    return todosAccess.getAllTodosForUser(userId)
}

export async function createTodo(userId: string, request: CreateTodoRequest): Promise<TodoItem> {
    logger.info("creating new Todo for user: " + userId + " with content " + JSON.stringify(request))
    
    const todoId = uuid.v4()
    const newItem: TodoItem = {
        "userId": userId,
        "todoId": todoId,
        "createdAt": new Date().toISOString(),
        "name": request.name,
        "dueDate": request.dueDate,
        "done": false,
        "attachmentUrl": undefined
    }

    return await todosAccess.createTodo(newItem)
}

export async function updateTodo(userId: string, todoId: string, request: UpdateTodoRequest): Promise<TodoItem> {
    logger.info("updateing Todo item " + todoId + " for user: " + userId + " with content " + JSON.stringify(request))
    
    if (!doesItemBelongToUser(todoId, userId)) {
        logger.error("todo item " + todoId + " does not belong to user " + userId)
        return undefined
    }
    const currentItem: TodoItem = await todosAccess.getTodo(todoId)

    return await todosAccess.createTodo({
        "userId": userId,
        "todoId": todoId,
        "createdAt": currentItem.createdAt,
        "name": request.name,
        "dueDate": request.dueDate,
        "done": request.done,
        "attachmentUrl": currentItem.attachmentUrl
    })
}

export async function deleteTodo(todoId: string, userId: string) {
    logger.info("deleting todo " + todoId)

    if (!doesItemBelongToUser(todoId, userId)) {
        logger.error("todo item " + todoId + " does not belong to user " + userId)
        return undefined
    }

    return todosAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info("getting upload URL for todo " + todoId)

    if (!doesItemBelongToUser(todoId, userId)) {
        logger.error("todo item " + todoId + " does not belong to user " + userId)
        return undefined
    }

    return attachmentUtils.getUploadURL(todoId)
}

async function doesItemBelongToUser(todoId: string, userId: string): Promise<boolean> {
    logger.info("checking if todo item " + todoId + " belongs to user " + userId)
    const currentItem: TodoItem = await todosAccess.getTodo(todoId)
    if (currentItem == undefined) {
        logger.error("error getting todo item " + todoId)
        return false
    }

    logger.info("todo item " + todoId + " belongs to user " + userId)
    return currentItem.userId == userId
}
