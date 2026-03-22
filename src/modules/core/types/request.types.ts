import { Request } from 'express';

export type RequestWithBody<T> = Request<object, object, T>;

export type RequestWithParamsId = Request<{ id: string }>;

export type RequestWithParamsIdAndBody<T> = Request<{ id: string }, object, T>;

export type RequestWithQuery<TQuery> = Request<object, object, object, TQuery>;

export type RequestWithParamsIdAndQuery<TQuery> = Request<
  { id: string },
  object,
  object,
  TQuery
>;
