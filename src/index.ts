import app from './app';
import { config } from './config';
import logger from './logger';

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server started on port ${config.port} in ${config.env} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`, {
    stack: err.stack,
  });
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`, {
    stack: err.stack,
  });
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default server;