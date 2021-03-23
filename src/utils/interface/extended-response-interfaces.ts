import { Request } from "express";

interface Url {
  protocol: any | null;
  slashes: any | null;
  auth: any | null;
  host: any | null;
  port: any | null;
  hostname: any | null;
  hash: any | null;
  search: string | null;
  query: string | null;
  pathname: string | null;
  path: string | null;
  href: string | null;
  _raw: string | null;
}

export interface ExtendedRequestInterfaces extends Request {
  _parsedUrl: Url;
}
