import { useQuery } from 'react-query'
import { isNotEmpty, QUERIES, ID, KTCard } from '../../../../_metronic/helpers'
import { getModelById } from '../core/_requests'
import { Add } from './Add'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { initialModel } from '../core/_models'
import { Tab, Tabs } from 'react-bootstrap'
import { AddWrapper as AddCityWrapper } from './AddCityWrapper'
import { FC, useState } from 'react'
import { AddWrapper as AddWrapperLimit } from './AddWrapperLimit'

type Props = {
  ModuleName: any
}

const AddWrapper: FC<Props> = ({ ModuleName }) => {

  const params = useParams();
  const navigate = useNavigate();

  const queryParams = useParams();

  const [key, setKey] = useState<String>(queryParams.tab || 'basic');


  const enabledQuery: boolean = isNotEmpty(params.id);

  const {
    isLoading,
    data: model,
    error,
  } = useQuery(
    `${QUERIES.LIST}-${ModuleName.slug}-${params.id as ID}`,
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

  return (
    <>
      <KTCard>


        {
          !isLoading &&
          (
            <>
              <Tabs activeKey={key as string} id="client-tab" className="mb-3" onSelect={(k: any) => {
                setKey(k);
                if (queryParams.id) {
                  navigate(`/${ModuleName.slug}-management/edit/${queryParams.id}/${k}`);
                }
              }}>
                <Tab eventKey="basic" title="Basic Details">
                  {key === 'basic' &&
                    <AddCityWrapper ModuleName={{ singular: 'city', plural: 'city', slug: 'city' }} />
                  }
                </Tab>
                <Tab eventKey="booking-limit" title="Booking Limit">
                  {key === 'booking-limit' &&
                    <AddWrapperLimit ModuleName={{ singular: 'Booking Limit', plural: 'Booking Limit', slug: 'bookinglimit' }} />
                  }
                </Tab>



              </Tabs>

            </>
          )
        }



      </KTCard>
    </>
  )
}

export { AddWrapper }