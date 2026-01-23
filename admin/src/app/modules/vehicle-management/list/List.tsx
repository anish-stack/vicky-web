import {ListViewProvider, useListView} from '../core/ListViewProvider'
import {QueryRequestProvider} from '../core/QueryRequestProvider'
import {QueryResponseProvider} from '../core/QueryResponseProvider'
import {ListHeader} from './components/header/ListHeader'
import {Table} from './table/Table'
import {KTCard} from '../../../../_metronic/helpers'

const List = () => {
  return (
    <>
      <KTCard>
        <ListHeader />
        <Table />
      </KTCard>
    </>
  )
}

const ListWrapper = () => (
  <QueryRequestProvider>
    <QueryResponseProvider>
      <ListViewProvider>
        <List/>
      </ListViewProvider>
    </QueryResponseProvider>
  </QueryRequestProvider>
)

export {ListWrapper}
