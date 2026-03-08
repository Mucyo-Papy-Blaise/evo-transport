export class PaginationUtil {
  static paginate(query: Record<string, unknown>, defaultLimit = 10) {
    const page = parseInt(String(query.page), 10) || 1;
    const limit = parseInt(String(query.limit), 10) || defaultLimit;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  static getSkipTake(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const take = limit;
    return { skip, take };
  }

  static getPaginationInfo(
    total: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  static filter(query: Record<string, string>, allowedFilters: string[]) {
    return Object.keys(query)
      .filter((key) => allowedFilters.includes(key))
      .reduce(
        (acc: Record<string, string>, key) => {
          const value = query[key];
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>,
      );
  }

  static search(
    query: Record<string, unknown>,
    searchFields: string[],
    searchTermKey = 'searchq',
  ) {
    const searchTerm =
      typeof query[searchTermKey] === 'string' ? query[searchTermKey] : null;
    if (!searchTerm) return null;

    return searchFields.map((field) => ({
      [field]: { contains: searchTerm, mode: undefined },
    }));
  }
}
