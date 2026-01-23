import {useQuery} from 'react-query'
import {isNotEmpty, QUERIES, ID} from '../../../../_metronic/helpers'
import {getModelById} from '../core/_requests'
import {Add} from './Add'
import {useParams} from 'react-router-dom'

const AddWrapper = (props:any) => {
  
  const params = useParams();
  
  const enabledQuery: boolean = isNotEmpty(params.id);

  const {
    isLoading,
    data: model,
    error,
  } = useQuery(
    `${QUERIES.LIST}-${props.ModuleName.slug}-${params.id as ID}`,
    () => {
        return getModelById(params.id as ID)
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
    return <Add isLoading={isLoading} model={{id: undefined}} ModuleName={props.ModuleName} />
  }

  if (!isLoading && !error && model) {
    return <Add isLoading={isLoading} model={model} ModuleName={props.ModuleName}/>
  }

  return null
}

export {AddWrapper}