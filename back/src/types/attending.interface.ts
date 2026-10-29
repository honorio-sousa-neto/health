import { Service, Symptoms } from "@prisma/client";
import {
  TAddSymptoms,
  TCreateAttending,
  TUpdateAttending,
} from "../validator/attending.validator";

export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  SERVER_ERROR = 500,
}

export enum Message {
  OK = "Operação realizada com sucesso",
  WRONG_PWD = "Palavra-passe errada",
  LOGIN_SUCCEED = "Login feito com sucesso",
  INTERNAL_ERROR = "Erro de servidor",
  UNKNOWN_USER = "Usuario desconhecido",
}
export interface Meta<Entity> {
  meta?: {
    perPage?: number;
    page?: number;
    search?: string;
    total?: number;
    totalPages?: number;
  };
  data: Entity | null;
}

export interface HttpResponse<Entity> {
  status: StatusCode;
  success: boolean;
  message: Message | string;
  body?: Meta<Entity>;
}

export interface IControllerAttending {
  index(payload: {
    search?: string;
    page: number;
    perPage: number;
    orderBy?: any;
    category?: string;
    stage?: any;
  }): Promise<HttpResponse<any[]>>;
  indexByStatus(payload: {
    search?: string;
    page: number;
    perPage: number;
    orderBy?: any;
    category?: string;
    status?: string;
  }): Promise<HttpResponse<any[]>>;
  addSymptom(payload: TAddSymptoms): Promise<HttpResponse<any>>;
  removeSymptom(
    attendingId: string,
    symptomId: string
  ): Promise<HttpResponse<any>>;
  create(payload: TCreateAttending): Promise<HttpResponse<any>>;
  show(id: string): Promise<HttpResponse<any>>;
  showExams(attendingId: string): Promise<HttpResponse<Service[]>>;
  updateExamsAttending(
    attendingId: string,
    payload: any[]
  ): Promise<HttpResponse<any[]>>;
  update(
    attendingId: string,
    payload: TUpdateAttending
  ): Promise<HttpResponse<any>>;
  askExams(payload: {
    search?: string;
    page: number;
    perPage: number;
    query: any;
  }): Promise<HttpResponse<any[]>>;
}

export interface IRepositoryAttending {
  index(payload: {
    search?: string;
    page?: number;
    perPage?: number;
    orderBy?: any;
    stage?: any;
  }): Promise<Meta<any[]>>;
  indexByStatus(payload: {
    search?: string;
    page?: number;
    perPage?: number;
    orderBy?: any;
    status?: string;
  }): Promise<Meta<any[]>>;
  create(payload: TCreateAttending): Promise<Meta<any>>;
  show(id: string): Promise<Meta<any>>;
  removeSymptom(attendingId: string, symptomId: string): Promise<Meta<any>>;
  addSymptom(payload: TAddSymptoms): Promise<Meta<any>>;
  updateExamsAttending(
    attendingId: string,
    payload: any[]
  ): Promise<Meta<any[]>>;
  showExams(attendingId: string): Promise<Meta<Service[]>>;
  update(attendingId: string, payload: TUpdateAttending): Promise<Meta<any>>;
  askExams(payload: {
    search?: string;
    page: number;
    perPage: number;
    query: any;
  }): Promise<Meta<any[]>>;
}
