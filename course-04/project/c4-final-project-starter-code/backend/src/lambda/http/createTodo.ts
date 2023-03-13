import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // done TODO: Implement creating a new TODO item
    logger.info('Processing event: ', event)
    const userId = getUserId(event)
    const newTodoRequest: CreateTodoRequest = JSON.parse(event.body)

    let newTodoItem = await createTodo(userId, newTodoRequest)
    logger.info("created item: " + JSON.stringify(newTodoItem))

    delete newTodoItem.userId
    
    if (newTodoItem.attachmentUrl == undefined) {
      newTodoItem.attachmentUrl = ""
    }
    const returnItem = {
      "item": newTodoItem
    }

    logger.info("RETURNING item: " + JSON.stringify(returnItem))
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: returnItem
      })
    }
  })

handler
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  })
)
