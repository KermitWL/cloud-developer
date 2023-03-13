import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

// done TODO: Get all TODO items for a current user

const logger = createLogger('heet getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info('Processing event: ', event)
    const userId = getUserId(event)
    logger.info("getting Todos for user " + userId)

    const todos = await getTodosForUser(userId)

    // strip userId from returned items
    if (todos == undefined) {
      return {
        statusCode: 500,
        body: ""
      }
    }

    todos.forEach(element => delete element.userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        items: todos
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
