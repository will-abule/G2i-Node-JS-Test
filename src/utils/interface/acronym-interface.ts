export interface AcronymInterface {
  _id?: string;
  acronym: string;
  definition: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcronymUpdateInterface {
  acronym?: string;
  definition?: string;
}
