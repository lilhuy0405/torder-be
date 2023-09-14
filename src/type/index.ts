import {User} from "../entity";
import {Request} from "express";

export type AuthenticatedRequest = Request & { user: User, file?: any };

export type Pagination<T> = {
  perPage: number,
  currentPage: number,
  contents: T[],
  totalPage: number,
  totalElements: number
}
