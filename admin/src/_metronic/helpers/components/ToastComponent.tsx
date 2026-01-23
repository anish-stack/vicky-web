import React, {FC, useState, useEffect} from 'react'
import { Toast,ToastContainer } from 'react-bootstrap'
import {WithChildren} from '../react18MigrationHelpers'

type Props = {
    bg?:string
    title?:string
    msg?: string
    show?:boolean
    onChange?:any
  }

 const ToastComponent: FC<Props & WithChildren> = (props: Props): JSX.Element => {

    const [show, setShow] = useState(false);

    useEffect(()=>{
      if(props.show==true){
        setShow(props.show);
      }
    },[props.show])

    function handleChange(){
      props.onChange(false);
      setShow(false);
    }

  return (
    <div>
      <ToastContainer className="p-3 position-fixed" position="top-end">
          <Toast bg={props.bg} onClose={handleChange} show={show} delay={3000} autohide>
            <Toast.Header>
              <img
                src="holder.js/20x20?text=%20"
                className="rounded me-2"
                alt=""
              />
              <strong className="me-auto">{props.title}</strong>
            </Toast.Header>
            <Toast.Body className='text-start text-dark'>{props.msg}</Toast.Body>
          </Toast>
        </ToastContainer>
    </div>
  )
}
export {ToastComponent};
