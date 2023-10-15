
export type QueryPaginationTypeUser = {
    sortBy: string
    sortDirection: 1 | -1
    pageNumber: number
    pageSize: number
    searchLoginTerm: string
    searchEmailTerm: string
    skip: number
  }
   
  export const getPaginationFromQueryUser = (query: any): QueryPaginationTypeUser => {
   const defaultValuesUsers: QueryPaginationTypeUser = {
     sortBy: 'createdAt',
     sortDirection: -1,
     pageNumber: 1,
     pageSize: 10,
     searchLoginTerm: '',
     searchEmailTerm: '',
     skip: 0
   }
   if (query.sortBy) {defaultValuesUsers.sortBy = query.sortBy};
   if (query.sortDirection) {defaultValuesUsers.sortDirection = query.sortDirection}
   if (query.pageNumber) {defaultValuesUsers.pageNumber = +query.pageNumber}
   if (query.pageSize) {defaultValuesUsers.pageSize = +query.pageSize}
   if (query.searchLoginTerm) {defaultValuesUsers.searchLoginTerm = query.searchLoginTerm}
   if (query.searchEmailTerm) {defaultValuesUsers.searchEmailTerm = query.searchEmailTerm}
   defaultValuesUsers.skip = (defaultValuesUsers.pageNumber - 1)*defaultValuesUsers.pageSize
   
   return defaultValuesUsers
  }


  export type QueryPaginationType = {
    searchNameTerm: string
    sortBy: string
    sortDirection: 'asc' | 'desc'
    pageNumber: number
    pageSize: number
    skip: number
  }
  
  export const getPaginationFromQuery = (query: any): QueryPaginationType => {
    const defaultValues: QueryPaginationType = {
      searchNameTerm: '',
      sortBy: 'createdAt',
      sortDirection: 'desc',
      pageNumber: 1,
      pageSize: 10,
      skip: 0
    }
  
    if (query.searchNameTerm) { defaultValues.searchNameTerm = query.searchNameTerm };
    if (query.sortBy) { defaultValues.sortBy = query.sortBy };
    if (query.sortDirection) { defaultValues.sortDirection = query.sortDirection }
    if (query.pageNumber) { defaultValues.pageNumber = +query.pageNumber }
    if (query.pageSize) { defaultValues.pageSize = +query.pageSize }
    defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize
    return defaultValues
  }