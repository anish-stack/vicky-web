import { auto } from '@popperjs/core'
import {FC} from 'react'
import Select from 'react-select'

type Props = {
    onChange: any
    options: any
    value: any
    className: any
}

const CustomSelect: FC<Props> = ({onChange, options, value, className}) =>{
    
    const customStyles = {
        control: (_:any, { selectProps: { width }}:any) => ({
            ..._,
            background:'#f5f8fa',
            border:'none',
            padding:'0.3rem 1rem',
            borderRadius:'7px'
        }),
      }

    const defaultValue = (options:any,value:any) =>{
        return options ? options.find((option:any)=>option.value === value):""
    }
    return(
        <div className={className}>
            <Select 
                styles={customStyles}
                value={defaultValue(options,value)}
                onChange={(value: any)=>onChange(value)}
                options={options}
            />
        </div>
    )
}
export {CustomSelect}