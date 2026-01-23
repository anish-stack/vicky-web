import {useQuery} from 'react-query'
import {isNotEmpty, QUERIES, ID} from '../../../../_metronic/helpers'
import { getBookingLimitsModelById } from '../core/_requests'
import { Add } from './AddLimit'
import {useParams} from 'react-router-dom'

const AddWrapper = (props:any) => {
  
  const params = useParams();
  
  const enabledQuery: boolean = isNotEmpty(params.id);

  const {
    isLoading,
    data: model,
    error,
  } = useQuery(
    `${QUERIES.LIST}-${props.ModuleName.slug}-booking-limit-${params.id as ID}`,
    () => {
        return getBookingLimitsModelById(params.id as ID)
    },
    {
      cacheTime: 0,
      enabled: enabledQuery,
      onError: (err) => {
        console.error(err)
      },
    }
  )
  console.log("model", model, isLoading)


  if (!isLoading && !error && model) {
    return <Add isLoading={isLoading} model={model} ModuleName={props.ModuleName}/>
  }

  return null
}

export {AddWrapper}