import { auto } from "@popperjs/core";
import { FC, useEffect, useState } from "react";
import Select from "react-select";

type Props = {
  onChange: any;
  options: any;
  value?: any;
  className: any;
  isMulti: any;
  customStyles?: any;
  placeholder?: string;
};

type OptionType = { value: any; label: string };

const CustomSelect: FC<Props> = ({
  onChange,
  options,
  value,
  className,
  isMulti,
  customStyles,
  placeholder,
}) => {
  // const defaultValue = (options:any,value:any) =>{
  //     if(isMulti === undefined)
  //     {
  //         return options ? options.find((option:any)=>option.value === value):""

  //     }
  //     else{
  //        var returnValue = [];
  //         if(value !== undefined){

  //             var valArray = value.split(',');
  //             for(var i=0;i<valArray.length;i++)
  //             {
  //                 returnValue.push(options ? options.find((option:any)=>option.value === parseInt(valArray[i])):"");
  //             }
  //             return returnValue;
  //         }
  //         else{
  //             return "";
  //         }
  //     }
  // }

  const getValidValue = (inputValue: any, opts: OptionType[]) => {
    if (!opts) return isMulti ? [] : null;

    if (isMulti) {
      const values =
        typeof inputValue === "string" ? inputValue.split(",") : [];
      return values
        .map((v) => {
          const parsedValue = parseInt(v.trim(), 10);
          return opts.find((opt) => opt.value === parsedValue);
        })
        .filter((opt) => opt !== undefined) as OptionType[];
    } else {
      return opts.find((opt) => opt.value === inputValue) || null;
    }
  };
  const [menuPlacement, setMenuPlacement] = useState("auto");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMenuPlacement("auto");
      } else {
        setMenuPlacement("auto");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validValue = getValidValue(value, options);
  return (
    <Select
      classNamePrefix="custom-select"
      styles={customStyles}
      value={validValue}
      onChange={(value: any) => onChange(value)}
      options={options}
      isMulti={isMulti}
      className="w-100"
      placeholder={placeholder}
      menuPlacement={menuPlacement as any}
    />
  );
};
export { CustomSelect };
