import { useAuth } from '../../../../../auth'
import { useState,Fragment  } from "react";
import Select, { components } from "react-select";
import "./styles.css";
import { updateUserColumns} from '../../core/_requests'
import {useFormik} from 'formik'
// import {usersColumns} from '../../table/columns/_columns'
import {updateColumns} from '../../core/_models'


const InputOption = ({
  getStyles,
  Icon,
  isDisabled,
  isFocused,
  isSelected,
  children,
  innerProps,
  ...rest
}:any) => {
  const [isActive, setIsActive] = useState(false);
  const onMouseDown = () => setIsActive(true);
  const onMouseUp = () => setIsActive(false);
  const onMouseLeave = () => setIsActive(false);

  // styles
  let bg = "transparent";
  if (isFocused) bg = "#eee";
  if (isActive) bg = "#B2D4FF";

  const style = {
    alignItems: "center",
    backgroundColor: bg,
    color: "inherit",
    display: "flex "
  };

  // prop assignment
  const props = {
    ...innerProps,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    style
  };



  return (
    <>
      <components.Option
        {...rest}
        isDisabled={isDisabled}
        isFocused={isFocused}
        isSelected={isSelected}
        getStyles={getStyles}
        innerProps={props}
      >
        <input className='me-3' type="checkbox" checked={isSelected} />
        {children}
      </components.Option>


    </>
  );
};
const Menu = (props:any) => {
  return (
    <Fragment>
      <components.Menu {...props}>
        <div>
          {props.selectProps.fetchingData ? (
            <span className="fetching">Fetching data...</span>
          ) : (
            <div>{props.children}</div>

          )}


        </div>
        <div className='text-center'><button type='submit'  className='btn btn-primary w-100'>Apply</button></div>
      </components.Menu>
    </Fragment>
  );
};

  const allOptions = [
    // { value: "middle_name", label: "Name" },
    { value: "username", label: "User Name" },
    { value: "mobile_no", label: "Mobile No" },
    { value: "dob", label: "Date Of Birth" },
    { value: "address", label: "Address" },
    { value: "gender", label: "Gender" },
    { value: "birth_place", label: "Birth Place" },

    { value: "net_worth", label: "Net Worth" },
    { value: "profession_name", label: "Profession" },
    { value: "country", label: "Country" },
    { value: "state", label: "State" },
    { value: "city", label: "City" },
    { value: "area", label: "Area" },
    { value: "role", label: "Role" },


  ];

export default function ColumnSelect() {
    const {currentUser, setCurrentUser} = useAuth()


  const [selectedOptions, setSelectedOptions] = useState(currentUser?.user?.columns?.users);
  const handleChange = (options:any) => {
    var names = options.map(function(i:any) {
      return i.value;
    });
    setSelectedOptions(names)
    formik.setFieldValue('tablecolumns',names)

};
  const [userForEdit] = useState<updateColumns>({

    // tablecolumns:selectedOptions,
    tablename:'users'

  })
    const formik = useFormik({
      initialValues: userForEdit,

      onSubmit: async (values, {setSubmitting}) => {
        // console.log("formik.values.tablecolumns",values)
        setSubmitting(true)
        try {

          await updateUserColumns(values).then((response:any)=>{
            setCurrentUser(response);
          });

        } catch (ex) {
          console.error(ex)
        } finally {
          setSubmitting(true)

        }
      },
    })



  return (
    <>

    <div className="pe-3 d-none">
    <form id='kt_modal_edit_user_columns_form' className='form' onSubmit={formik.handleSubmit} noValidate>

        <div className='d-flex columndiv'>
        <input type='hidden' name='tablename' value='users'/>
        <input type='hidden' name='tablecolumns' value={formik.values.tablecolumns}/>

        <Select

            defaultValue={currentUser?.user?.columns?.users?.map((Obj:any) => { return { 'label': Obj, 'value': Obj } }) || []}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            onChange={handleChange}
            options=  {allOptions as any}
            placeholder="Selected Columns"
            name='selectcolumns'
            value={selectedOptions?.map((Obj:any) => { return { 'label': Obj, 'value': Obj } }) || []}
            components={{
            Option: InputOption,
            Menu:Menu
            }}

            controlShouldRenderValue={false}

        />

        </div>
    </form>
    </div>


    </>
  );
}

