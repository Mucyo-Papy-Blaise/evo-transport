import { PrismaService } from '../../prisma/prisma.service';
import { IBaseRepository, FindManyOptions } from './base-repository.interface';

export abstract class BaseRepositoryService<
  T,
  TInclude = any,
> implements IBaseRepository<T> {
  protected abstract readonly modelName: string;

  constructor(protected readonly prisma: PrismaService) {}

  create(data: Partial<T> | any): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
    });
  }

  findById(id: string, include?: TInclude): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where: { id },
      include,
    });
  }

  findOne(filter: Partial<T>, include?: TInclude): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({
      where: filter,
      include,
    });
  }

  findMany(
    filter?: Partial<T>,
    options?: FindManyOptions,
    include?: TInclude,
  ): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      where: filter,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
      include,
    });
  }

  update(id: string, data: Partial<T>): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }

  async count(filter?: Partial<T>): Promise<number> {
    return this.prisma[this.modelName].count({
      where: filter,
    });
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.prisma[this.modelName].count({
      where: filter,
    });
    return count > 0;
  }
}
