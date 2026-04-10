import { QueryResponse } from "../../../shared/types";

export interface QueryTab {
  id: string;
  title: string;
  query: string;
  result: QueryResponse | null;
  loading: boolean;
  error: string | null;
  createdAt: Date;
  tableName?: string;
}
