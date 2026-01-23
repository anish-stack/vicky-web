import {useMemo} from 'react'
import {useTable, ColumnInstance, Row} from 'react-table'
import {CustomHeaderColumn} from '../table/columns/CustomHeaderColumn'
import {CustomRow} from '../table/columns/CustomRow'
import {useQueryResponseData, useQueryResponseLoading} from '../../core/QueryResponseProvider'
import {tableColumns} from './columns/_columns'
import {Model} from '../../core/_models'
import {ListLoading} from '../components/loading/ListLoading'
import {ModelsListPagination} from '../components/pagination/ModelsListPagination'
import {capitalize, KTCardBody} from '../../../../../_metronic/helpers'
import {useQueryRequest} from '../../core/QueryRequestProvider'
const Table = () => {
  const models = useQueryResponseData()
  const isLoading = useQueryResponseLoading()
  const data = useMemo(() => models, [models])
  const columns = useMemo(() => tableColumns, [])
  const {ModuleName} = useQueryRequest()

  const {getTableProps, getTableBodyProps, headers, rows, prepareRow} = useTable({
    columns,
    data,
  })
  // console.log(rows);

  return (
    <KTCardBody className='py-4'>
      <div className='table-responsive'>
        <table
          id={`kt_table_${ModuleName.slug}`}
          className='table align-middle table-row-bordered border-secondary fs-6 gy-1 dataTable no-footer'>
          <thead>
            <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
              {headers.map((column: ColumnInstance<Model>) => (
                <CustomHeaderColumn key={column.id} column={column} />
              ))}
            </tr>
          </thead>
          <tbody className='text-gray-600 fw-semibold' {...getTableBodyProps()}>
            {rows.length > 0 ? (
              rows.map((row: Row<Model>, i) => {
                prepareRow(row)
                return <CustomRow row={row} key={`row-${i}-${row.id}`} />
              })
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className='d-flex text-center w-100 align-content-center justify-content-center'>
                    No matching records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ModelsListPagination />
      {isLoading && <ListLoading />}
    </KTCardBody>
  )
}

export {Table}
