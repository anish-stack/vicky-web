import {useQuery} from 'react-query'
import {isNotEmpty, QUERIES, ID} from '../../../../../_metronic/helpers'
import {getUserById} from '../core/_requests'
import {UserAdd} from './UserAdd'
import {useParams} from 'react-router-dom'

const UserAddWrapper = () => {
  
  const params = useParams();
  
  const enabledQuery: boolean = isNotEmpty(params.id);

  const {
    isLoading,
    data: user,
    error,
  } = useQuery(
    `${QUERIES.LIST}-user-${params.id as ID}`,
    () => {
        return getUserById(params.id as ID)
    },
    {
      cacheTime: 0,
      enabled: enabledQuery,
      onError: (err) => {
        console.error(err)
      },
    }
  )

  if (!params.id) {
    return <UserAdd isUserLoading={isLoading} user={{id: undefined}} />
  }

  if (!isLoading && !error && user) {
    return <UserAdd isUserLoading={isLoading} user={user}/>
  }

  return null
}

export {UserAddWrapper}