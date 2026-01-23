import { auto } from '@popperjs/core'
import {FC} from 'react'
import Select from 'react-select'

type Props = {
    onChange: any
    options: any
    value?: any
    className: any
    isMulti:any
    isLoading?: boolean
    isDisabled?: boolean
    isclearable?:boolean
}

const CustomSelect: FC<Props> = ({ onChange, options, value, className, isMulti, isLoading, isDisabled, isclearable }) =>{
    
    const customStyles = {
        // option: (provided:any, state:any) => ({
        //   ...provided,
        //   border: 'none',
        //   color: state.isSelected ? 'red' : 'blue',
        //   padding: 20,
        //   background: '#ddd'
        // }),
        control: (_:any, { selectProps: { width }}:any) => ({
            ..._,
            // width: width
            background:'#f5f8fa',
            border:'none',
            padding:'0.3rem 1rem',
            borderRadius:'7px'
        }),
        // singleValue: (provided:any, state:any) => {
        //   const opacity = state.isDisabled ? 0.5 : 1;
        //   const transition = 'opacity 300ms';
      
        //   return { ...provided, opacity, transition };
        // }
      }

    const defaultValue = (options:any,value:any) =>{
        if(isMulti === undefined)
        {
            return options ? options.find((option:any)=>option.value === value):""
            
        }
        else{
           var returnValue = [];
            if(value !== undefined){

            
                var valArray = value.split(',');
                for(var i=0;i<valArray.length;i++)
                {
                    returnValue.push(options ? options.find((option:any)=>option.value === parseInt(valArray[i])):"");
                }
                return returnValue;
            }
            else{
                return "";
            }
        }
    }
    return(
        <div className={className}>
            <Select 
                styles={customStyles}
                value={defaultValue(options,value)}
                onChange={(value: any)=>onChange(value)}
                options={options}
                isMulti={isMulti}
                isLoading={isLoading || false}
                isDisabled={isDisabled || false}
                isClearable={isclearable||false}
            />
        </div>
    )
}
export {CustomSelect}