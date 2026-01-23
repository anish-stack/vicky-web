import clsx from 'clsx';
import {FC} from 'react';
import {Row} from 'react-table';
import {Model} from '../../../core/_models';
import {useNavigate} from 'react-router-dom';

type Props = {
	row: Row<Model>
}

const CustomRow: FC<Props> = ({row}) => {
	const navigate = useNavigate();

	const RedirectTo = (id:any, cell_id:any) => {
		if('selection' !=  cell_id && 'actions' != cell_id) {
			navigate(`/vehicle-management/edit/${id}`);
		}
	}
	return (
		<tr {...row.getRowProps()}>
			{row.cells.map((cell) => {
				return (
					<td {...cell.getCellProps()} className={clsx({'text-end min-w-100px': cell.column.id === 'actions'})} onClick={() => RedirectTo(row.original.id, cell.column.id)} >
						{cell.render('Cell')}
					</td>
				)
			})}
		</tr>
	)
}

export {CustomRow}
