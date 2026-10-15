export interface QueryResult {
  rowsAffected: number;
  lastInsertId?: number;
}

export interface IDatabase {
  execute(query: string, bindValues?: any[]): Promise<QueryResult>;
  select<T = any>(query: string, bindValues?: any[]): Promise<T>;
  close(): Promise<void>;
}
