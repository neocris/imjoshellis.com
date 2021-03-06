import React from 'react'
import { gql, useQuery } from '@apollo/client'
import moment from 'moment'
import Card from './Card'
import Loading from './Loading'

const GET_RECENT_REPOS = gql`
  query GetRecentRepos {
    viewer {
      id
      repositories(
        orderBy: { field: PUSHED_AT, direction: ASC }
        last: 3
        privacy: PUBLIC
        isFork: false
      ) {
        edges {
          node {
            ... on Repository {
              name
              description
              homepageUrl
              pushedAt
              url
              openGraphImageUrl
              usesCustomOpenGraphImage
              refs(refPrefix: "refs/heads/", last: 3) {
                nodes {
                  name
                  target {
                    ... on Commit {
                      history {
                        totalCount
                      }
                      messageHeadline
                      pushedDate
                    }
                  }
                }
              }
              languages(first: 100) {
                edges {
                  node {
                    name
                    color
                  }
                }
              }
              repositoryTopics(first: 100) {
                edges {
                  node {
                    topic {
                      name
                    }
                  }
                }
              }
              pullRequests(first: 100) {
                totalCount
              }
            }
          }
        }
      }
    }
  }
`

interface RecentReposProps {}

export const RecentRepos: React.FC<RecentReposProps> = () => {
  const { loading, error, data } = useQuery(GET_RECENT_REPOS)

  let lastCommitTime
  lastCommitTime =
    data &&
    moment(
      data.viewer.repositories.edges.concat().reverse()[0].node.pushedAt
    ).fromNow()
  return (
    <>
      <div className='mt-8'>
        <h2 className='flex flex-col items-baseline py-2 text-xl font-bold md:flex-row'>
          Recent Activity{' '}
          {data && (
            <div className='text-sm font-normal text-gray-30 md:ml-2'>
              (last commit {lastCommitTime}){' '}
              {lastCommitTime.match(/[ms]/) && (
                <>
                  <span role='img' aria-label='sparkles emoji'>
                    {' '}
                    ✨️
                  </span>
                </>
              )}
            </div>
          )}
        </h2>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          <Loading loading={loading} source='GitHub' />
          <Loading loading={loading} source='GitHub' />
          <Loading loading={loading} source='GitHub' />
          {error && `Error! ${error.message}`}
          {data &&
            data.viewer.repositories.edges
              .map((r: any) => (
                <Card key={r.node.name} repoData={r.node} useImage={false} />
              ))
              .reverse()}
        </div>
      </div>
    </>
  )
}

export default RecentRepos
