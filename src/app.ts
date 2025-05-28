import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';
import { errorHandler, notFoundHandler, requestLogger } from './middlewares';
import routes from './routes';
import logger from './logger';

// Initialize Express app
const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging
app.use(requestLogger);

// API Routes
app.use('/api', routes);

// Swagger documentation
if (config.env !== 'production') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Employee Stock Dashboard API',
        version: '1.0.0',
        description: 'API documentation for Employee Stock Dashboard',
      },
      servers: [
        {
          url: `http://localhost:${config.port}/api`,
          description: 'Development server',
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/docs/*.yaml'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger documentation available at /api-docs');
}

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;