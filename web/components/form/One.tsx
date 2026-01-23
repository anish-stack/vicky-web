import React, { useCallback, useEffect, useState } from 'react';
import parse from 'html-react-parser';
import Select from 'react-select';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Link from 'next/link';


interface BookingFormProps {
    Title: string
    subTitle: string
    buttonName: string
    imgURL: string
}

const BookingForm: React.FC<BookingFormProps> = ({
    Title,
    subTitle,
    buttonName,
    imgURL
}) => {

    const [startOption, setStartOption] = useState(null) as any;
    const [endOption, setEndOption] = useState(null) as any;
    const [startSearchValue, setStartSearchValue] = useState('');
    const [endSearchValue, setEndSearchValue] = useState('');
    const [startMapData, setStartMapData] = useState([]) as any;
    const [endMapData, setEndMapData] = useState([]) as any;
    const [distance, setDistance] = useState('');

    let timer: NodeJS.Timeout;

    const handleSearchChange = useCallback((inputValue: string, type: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (type === 'start') {
                setStartSearchValue(inputValue);
            } else if (type === 'end') {
                setEndSearchValue(inputValue);
            }
        }, 1000);
    }, []);

    const fetchPlaces = async (query: any, setMapData: any) => {
        if (!query) {
            setMapData([]);
            return;
        }
        try {
            const response = await fetch(`/api/places?query=${query}`);
            const data = await response.json();

            if (data.results) {
                const apiData = data.results.map((item: any) => ({
                    label: item.formatted_address,
                    value: item.place_id,
                    latitude: item.geometry?.location?.lat,
                    longitude: item.geometry?.location?.lng,
                }));
                setMapData(apiData);
            } else {
                setMapData([]);
            }
        } catch (error) {
            console.error("Error fetching places:", error);
            setMapData([]);
        }
    };

    useEffect(() => {
        fetchPlaces(startSearchValue, setStartMapData);
    }, [startSearchValue]);

    useEffect(() => {
        fetchPlaces(endSearchValue, setEndMapData);
    }, [endSearchValue]);

    const calculateDistance = async () => {
        if (!startOption || !endOption) {
            setDistance('Please select both start and end destinations.');
            return;
        }

        try {
            const response = await fetch(
                `/api/distance-matrix?origins=${startOption.latitude},${startOption.longitude}&destinations=${endOption.latitude},${endOption.longitude}`
            );
            const data = await response.json();

            if (data.rows[0]?.elements[0]?.distance) {
                setDistance(data.rows[0].elements[0].distance.text);
            } else {
                setDistance('Unable to calculate distance.');
            }
        } catch (error) {
            console.error("Error calculating distance:", error);
            setDistance('Error calculating distance.');
        }
    };

    useEffect(() => {
        if (startOption && endOption) {
            calculateDistance();
        }
    }, [startOption, endOption])

    const generateGoogleMapsLink = () => {
        if (startOption && endOption) {
            const start = `${startOption.latitude},${startOption.longitude}`;
            const end = `${endOption.latitude},${endOption.longitude}`;
            return `https://www.google.com/maps/dir/?api=1&origin=${start}&destination=${end}`;
        }
        return '';
    };

    const customSelectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: '#1F1D1D',
            borderRadius: '5px',
            boxShadow: 'none',
            color: 'white !important',
            padding: '0 8px',
            border: '1px solid white',
            cursor: 'text'
        }),
        input: (provided: any) => ({
            ...provided,
            color: 'white',
            padding: '0',
            fontSize: '14px'
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'white',
            padding: '0',
            fontSize: '14px',
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: 'white',
            opacity: '1',
            position: 'relative',
            fontSize: '14px',
            top: '0px',
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            display: 'none',

        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
    };

    const directions = [
        { label: 'One way', value: 'One way' },
        { label: 'Return', value: 'Return' },
    ]

    const Passengers = [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
    ];

    const Suitcases = [
        { label: '0', value: '0' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
    ];

    const [selectedDate, setSelectedDate] = useState(null);

    const handleChange = (date: any) => {
        setSelectedDate(date);
    };

    function generateTimeArray() {
        const times = [];
        let currentHour = 0;
        let currentMinute = 0;
        while (currentHour < 24 || (currentHour === 23 && currentMinute <= 55)) {
            const period = currentHour < 12 ? "AM" : "PM";
            const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
            const formattedLabel = `${String(displayHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} ${period}`;
            const formattedValue = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

            times.push({ label: formattedLabel, value: formattedValue });

            currentMinute += 5;
            if (currentMinute === 60) {
                currentMinute = 0;
                currentHour += 1;
            }
        }
        return times;
    }
    const timeArray = generateTimeArray();

    return (
        <>
            <style>
                {`
                    .booking-section .outer-box::after {
                        background-image: url(${imgURL});
                    }
                `}
            </style>
            <section className="booking-section pull-up">
                <div className="auto-container">
                    <div className="outer-box">
                        <div className="booking-form">
                            <div className="sec-title light">
                                <span className="sub-title">{Title}</span>
                                <h2 className="letters-slide-up text-split text-white">{subTitle}</h2>
                            </div>
                            <form method="get" action="#">
                                <div className="row gx-3">
                                    <p className="fields-title mb-2">{'Journey Information'}</p>
                                    <div className="form-group col-lg-6 col-md-6 col-sm-12">
                                        <div className="input-outer">
                                            <Select
                                                value={startOption}
                                                onChange={setStartOption}
                                                onInputChange={(value) => handleSearchChange(value, 'start')}
                                                options={startMapData}
                                                placeholder="Collection Address *"
                                                filterOption={null}
                                                styles={customSelectStyles}
                                            />
                                            <i className="icon fal fa-map-marker-alt"></i>
                                        </div>
                                    </div>

                                    <div className="form-group col-lg-6 col-md-6 col-sm-12">
                                        <div className="input-outer">
                                            <Select
                                                value={endOption}
                                                onChange={setEndOption}
                                                onInputChange={(value) => handleSearchChange(value, 'end')}
                                                options={endMapData}
                                                placeholder="Destination Address *"
                                                filterOption={null}
                                                styles={customSelectStyles}
                                            />
                                            <i className="icon fal fa-map-marker-alt"></i>
                                        </div>
                                    </div>
                                    <p className="fields-title mb-2">{'Options'}</p>
                                    <div className="form-group col-lg-4 col-md-6 col-sm-12">
                                        <div className="input-outer">
                                            <Select
                                                options={directions}
                                                placeholder="Direction *"
                                                styles={customSelectStyles}
                                            />
                                            <i className="icon fa-light fa-route"></i>
                                        </div>
                                    </div>
                                    <div className="form-group col-lg-4 col-md-6 col-sm-12">
                                        <div className="input-outer">
                                            <Select
                                                options={Passengers}
                                                placeholder="Passengers *"
                                                styles={customSelectStyles}
                                            />
                                            <i className="icon fal fa-user-group"></i>
                                        </div>
                                    </div>
                                    <div className="form-group col-lg-4 col-md-6 col-sm-12">
                                        <div className="input-outer">
                                            <Select
                                                options={Suitcases}
                                                placeholder="Suitcases *"
                                                styles={customSelectStyles}
                                            />
                                            <i className="icon fa-light fa-cart-flatbed-suitcase"></i>
                                        </div>

                                    </div>

                                    <div className="form-group col-lg-4 col-md-6 col-sm-12">
                                        <div className="input-outer">
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={handleChange}
                                                placeholderText="Booking Date *"
                                                dateFormat="MM/dd/yyyy"
                                                className="form-control w-100"
                                            />
                                            <i className="icon fal fa-calendar-days"></i>
                                        </div>
                                    </div>
                                    <div className="form-group col-lg-4 col-md-6 col-sm-12">
                                        <div className="input-outer">
                                            <Select
                                                options={timeArray}
                                                placeholder="Booking Time *"
                                                styles={customSelectStyles}
                                            />
                                            <i className="icon fal fa-clock"></i>
                                        </div>
                                    </div>
                                    {startOption && endOption && (
                                        <>
                                            <div className='col-lg-6 col-md-12 co-sm-12 mt-3 mt-sm-0'>
                                                <div className='mapinfo-card'>
                                                    <div className='icon'>
                                                        <i className="fa-light fa-route"></i>
                                                    </div>
                                                    <div className='desc'>
                                                        <p className='mb-1'>Distance</p>
                                                        <h6 className='mb-1'>{distance}</h6>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='col-lg-6 col-md-12 co-sm-12 mt-3 mt-sm-0'>
                                                <Link href={generateGoogleMapsLink()} target="_blank" rel="noopener noreferrer">
                                                    <div className='mapinfo-card'>
                                                        <div className='icon'>
                                                            <i className="fa-light fa-map-location-dot"></i>
                                                        </div>
                                                        <div className='desc'>
                                                            <p className='mb-1'>Map</p>
                                                            <h6 className='mb-1'>View Route On Map</h6>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </>
                                    )}

                                    <div className="form-group col-lg-12 col-md-6 col-sm-12 mt-3 mt-sm-0">
                                        <button
                                            type="submit"
                                            className="theme-btn btn-style-one dark-line-two hover-light"
                                        >
                                            <span className="btn-title">{buttonName}</span>
                                        </button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>

    );
};

export default BookingForm;
