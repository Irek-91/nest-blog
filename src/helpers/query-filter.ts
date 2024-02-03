import { Injectable } from "@nestjs/common"

export type queryPaginationTypeUser = {
  sortBy: string
  sortDirection: 'ASC' | 'DESC',
  pageNumber: number
  pageSize: number
  searchLoginTerm: string
  searchEmailTerm: string
  skip: number
}
export type queryPaginationType = {
  searchNameTerm: string
  sortBy: string
  sortDirection: 'ASC' | 'DESC'
  pageNumber: number
  pageSize: number
  skip: number
}

export type queryPaginationQuestionsType = {
  bodySearchTerm: string
  publishedStatus: 'all' | 'published' | 'notPublished'
  sortBy: string
  sortDirection: 'ASC' | 'DESC'
  pageNumber: number
  pageSize: number
  skip: number
}

export type queryPaginationPairsType = {
  sortBy: string
  sortDirection: 'ASC' | 'DESC'
  pageNumber: number
  pageSize: number
  skip: number
}

export type queryPaginationTopUsersType = {
  sort:  string[]
  pageNumber: number
  pageSize: number
  skip: number
}

@Injectable()
export class Pagination {
  getPaginationFromQueryUser = (query: any): queryPaginationTypeUser => {
    const defaultValuesUsers: queryPaginationTypeUser = {
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      searchLoginTerm: '',
      searchEmailTerm: '',
      skip: 0
    }
    if (query.sortBy) { defaultValuesUsers.sortBy = query.sortBy };
    if (query.sortDirection) { defaultValuesUsers.sortDirection = query.sortDirection.toUpperCase() }
    if (query.pageNumber) { defaultValuesUsers.pageNumber = +query.pageNumber }
    if (query.pageSize) { defaultValuesUsers.pageSize = +query.pageSize }
    if (query.searchLoginTerm) { defaultValuesUsers.searchLoginTerm = query.searchLoginTerm }
    if (query.searchEmailTerm) { defaultValuesUsers.searchEmailTerm = query.searchEmailTerm }
    defaultValuesUsers.skip = (defaultValuesUsers.pageNumber - 1) * defaultValuesUsers.pageSize

    return defaultValuesUsers
  }

  




  getPaginationFromQuery = (query: any): queryPaginationType => {
    const defaultValues: queryPaginationType = {
      searchNameTerm: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      skip: 0
    }

    if (query.searchNameTerm) { defaultValues.searchNameTerm = query.searchNameTerm };
    if (query.sortBy === 'createdAt' || query.sortBy === 'name') { defaultValues.sortBy = query.sortBy }
    else { query.sortBy = 'createdAt' };
    if (query.sortDirection) { defaultValues.sortDirection = query.sortDirection.toUpperCase() }
    if (query.pageNumber) { defaultValues.pageNumber = +query.pageNumber }
    if (query.pageSize) { defaultValues.pageSize = +query.pageSize }
    defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize
    return defaultValues
  }
  getPaginationFromQueryPosts = (query: any): queryPaginationType => {
    const defaultValues: queryPaginationType = {
      searchNameTerm: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      skip: 0
    }

    if (query.searchNameTerm) { defaultValues.searchNameTerm = query.searchNameTerm };
    if (query.sortBy === 'createdAt' || query.sortBy === 'blogName' || query.sortBy === 'title'
      || query.sortBy === 'shortDescription' || query.sortBy === 'content' || query.sortBy === 'blogId'
      || query.sortBy === 'blogName'
    ) { defaultValues.sortBy = query.sortBy }
    else { query.sortBy = 'createdAt' };
    if (query.sortDirection) { defaultValues.sortDirection = query.sortDirection.toUpperCase() }
    if (query.pageNumber) { defaultValues.pageNumber = +query.pageNumber }
    if (query.pageSize) { defaultValues.pageSize = +query.pageSize }
    defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize
    return defaultValues
  }


  getPaginationFromQueryQuestions = (query: any): queryPaginationQuestionsType => {
    const defaultValues: queryPaginationQuestionsType = {
      bodySearchTerm: '',
      publishedStatus: 'all',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      skip: 0
    }

    if (query.bodySearchTerm) { defaultValues.bodySearchTerm = query.bodySearchTerm };

    if (query.publishedStatus === 'all' || query.publishedStatus === 'published' ||
      query.publishedStatus === 'notPublished') { defaultValues.publishedStatus = query.publishedStatus }
    else { defaultValues.publishedStatus === 'all' }


    if (query.sortBy === 'createdAt' || query.sortBy === 'published' || query.sortBy === 'updatedAt' ||
      query.sortBy === 'body' || query.sortBy === 'id') { defaultValues.sortBy = query.sortBy }
    else { defaultValues.sortBy = 'createdAt' };

    if (query.sortDirection === 'asc' || query.sortDirection === 'desc' ||
      query.sortDirection === 'ASC' || query.sortDirection === 'DESC') { defaultValues.sortDirection = query.sortDirection.toUpperCase() }
    else { defaultValues.sortDirection = 'DESC' };

    if (query.pageNumber) { defaultValues.pageNumber = +query.pageNumber }

    if (query.pageSize) { defaultValues.pageSize = +query.pageSize }
    defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize

    return defaultValues
  }

  getPaginationFromQueryPairs = (query: any): queryPaginationPairsType => {
    const defaultValues: queryPaginationPairsType = {
      sortBy: 'pairCreatedDate',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      skip: 0
    }


    if (query.sortBy === 'status' || query.sortBy === 'startGameDate' || query.sortBy === 'finishGameDate') { defaultValues.sortBy = query.sortBy }
    else { defaultValues.sortBy = 'pairCreatedDate' };

    if (query.sortDirection === 'asc' || query.sortDirection === 'desc' ||
      query.sortDirection === 'ASC' || query.sortDirection === 'DESC') { defaultValues.sortDirection = query.sortDirection.toUpperCase() }
    else { defaultValues.sortDirection = 'DESC' };

    if (query.pageNumber) { defaultValues.pageNumber = +query.pageNumber }

    if (query.pageSize) { defaultValues.pageSize = +query.pageSize }
    defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize

    return defaultValues
  }
  getPaginationFromQueryTopUsers = (query: any): queryPaginationTopUsersType => {
    const defaultValues: queryPaginationTopUsersType = {
      sort: ['avgScores: DESC', 'sumScore; DESC'],
      pageNumber: 1,
      pageSize: 10,
      skip: 0
    }
            
            let resultFilter = query.sort //'avgScores desc' ||  ["avgScores desc", "sumScore desc", "winsCount desc", "lossesCount asc"]
            // const array = ["sumScore desc", "avgScores desc"]
            
            if (typeof resultFilter == "object") {
                let array = (resultFilter).join(' ').split(' ')
                resultFilter = array.reduce(function (result, value, index,) {

                    if ((index === 0 || index % 2 == 0) && value === 'avgScores') {
                        result += `"${value}"`
                    } else if (index === 0 || index % 2 == 0) {
                        result += `"s"."${value}"`
                    }
                    if (index === (array.length - 1) && index % 2 !== 0) {
                        result += ` ${value.toUpperCase()}`
                    }
                    else if (index % 2 !== 0) {
                        result += ` ${value.toUpperCase()},`
                    }
                    return result.split(',')
                }, '')
                defaultValues.sort = resultFilter
            } else {
              let array = (resultFilter).split(' ')
              resultFilter = array.reduce(function (result, value, index,) {
                if (index === 0 && value === "avgScores") {
                  result += `"${value}"`
                }
                else if (index === 0 && value !== "avgScores") {
                  result += `"s"."${value}"`
                } else {
                  result += ` ${value.toUpperCase()}`
                }
                return [result]
              }, '')
              defaultValues.sort = resultFilter
            } 
            
    if (query.pageNumber) { defaultValues.pageNumber = +query.pageNumber }
    if (query.pageSize) { defaultValues.pageSize = +query.pageSize }
    defaultValues.skip = (defaultValues.pageNumber - 1) * defaultValues.pageSize

    return defaultValues
  }



}