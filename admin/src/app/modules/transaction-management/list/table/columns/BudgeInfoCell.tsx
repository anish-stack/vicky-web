import {FC} from 'react'

type Props = {
  model: any
    bg_color:string
}

const BudgeInfoCell: FC<Props> = ({ model, bg_color }) => (
    <div className={`badge badge-${bg_color}`}>
        {model ? (model) : ''}
    </div >
)

export {BudgeInfoCell}
