import {FC} from 'react'

type Props = {
    dham_pickup_city_name: any
    dham_package_name:string
    cartab:string
    places:string
}

const AddressCell: FC<Props> = ({ dham_package_name, dham_pickup_city_name, cartab, places }) => {

    let placesArray: any[] = [];

    try {
        placesArray = JSON.parse(places);
    } catch (error) {
        console.error("Invalid JSON in 'places':", error);
    }
  

    return (
  <>
        {cartab == 'chardham' ? 
        <>
            {dham_pickup_city_name && dham_package_name && (
              
                    
                   
                        <>
                                    
                            <div className="place-tag mt-0 fs-9 px-1">
                                    {dham_pickup_city_name}
                                </div>
                                <div>
                                <i className="fa fa-arrow-right mx-1 "></i>
                                <span className="place-tag mt-2  fs-9 px-1" style={{maxWidth:'300px'}}>
                                    {dham_package_name}
                                </span>
                                </div>
                               
                        </>
            
            )}
        </>
        :
        <>
            {placesArray && (
                <div className='col mt-0'>
                    
                    <div className=''>
                        <div className='start-align'>
                            {placesArray.map((data: any, index: number) => (
                                <div className='' key={index}>
                                    {index != 0 && (
                                        <i className="fa fa-arrow-right mx-1"></i>
                                    )}
                                    <span className="place-tag mt-1   fs-9 px-1" key={index} style={{ maxWidth: '300px' }}>
                                        {data?.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
        
        }
    
  </>
)}

export {AddressCell}
