export interface IBaseRepository<T> {
  create(data: Partial<T> | any): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter?: Partial<T>, options?: FindManyOptions): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<T>;
  count(filter?: Partial<T>): Promise<number>;
  exists(filter: Partial<T>): Promise<boolean>;
}

export interface FindManyOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, boolean>;
}