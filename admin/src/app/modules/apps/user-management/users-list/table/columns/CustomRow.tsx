import clsx from 'clsx';
import {FC} from 'react';
import {Row} from 'react-table';
import { useAuth } from '../../../../../auth';
import {User} from '../../core/_models';
import {useNavigate} from 'react-router-dom';

type Props = {
  row: Row<User>
}

const CustomRow: FC<Props> = ({row}) => {
	const {currentUser, logout} = useAuth();
	const navigate = useNavigate();

	const RedirectTo = (id:any, cell_id:any) => {
		if('selection' !=  cell_id && 'actions' != cell_id) {
			navigate(`/apps/user-management/edit/${id}`);
		}
	}

	return(
		<tr {...row.getRowProps()}>
			{row.cells.map((cell) => {
				var userColumns = (currentUser?.user?.columns as any)?currentUser?.user?.columns:{"users": ["name" ]};
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
