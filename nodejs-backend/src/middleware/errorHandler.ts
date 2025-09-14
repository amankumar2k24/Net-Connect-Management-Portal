import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((val: any) => val.message);
    message = errors.join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};