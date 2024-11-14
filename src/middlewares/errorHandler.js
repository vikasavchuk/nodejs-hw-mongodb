import createHttpError from 'http-errors'; 

export const errorHandler = (error, req, res, next) => {
  if (error instanceof createHttpError.HttpError) { 
    res.status(error.status).json({
      status: error.status,
      message: error.name,
      data: error,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: error.message,
  });
};
  