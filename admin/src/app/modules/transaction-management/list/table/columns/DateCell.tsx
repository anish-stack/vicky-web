import {FC} from 'react'

type Props = {
  model: any
  return_date:any
}

const DateCell: FC<Props> = ({ model, return_date }) => {
    // const formattedDate = new Date(model).toLocaleString('en-US', {
    //     day: '2-digit',
    //     month: 'long',
    //     year: 'numeric',
    //     hour: '2-digit',
    //     minute: '2-digit',
    //     hour12: true,
    //   });
    function formatCustomDate(dateStr: string): string {
        const date = new Date(dateStr);

        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12; // Convert 0 to 12
        const formattedHours = hours.toString().padStart(2, '0');

        return `${day} ${month}, ${year}  ${formattedHours}:${minutes} ${ampm}`;
    }
      
      return(
    <div className='align-items-center text-dark'>
          {formatCustomDate(model)}
          <p>{return_date ? formatCustomDate(return_date): ''}</p>
              
    </div>
)}

export {DateCell}
