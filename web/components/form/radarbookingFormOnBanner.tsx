import React, { useCallback, useEffect, useState } from 'react';
import parse from 'html-react-parser';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';



interface BookingFormOnBannerTwoProps {
    Title: string
    subTitle: string
    buttonName: string
}

const BookingFormOnBannerTwo: React.FC<BookingFormOnBannerTwoProps> = ({
    Title,
    subTitle,
    buttonName,
}) => {

    const [startOption, setStartOption] = useState(null) as any;
    const [endOption, setEndOption] = useState(null) as any;
    const [startSearchValue, setStartSearchValue] = useState('');
    const [endSearchValue, setEndSearchValue] = useState('');
    const [startMapData, setStartMapData] = useState([]) as any;
    const [endMapData, setEndMapData] = useState([]) as any;

    const [stopMapData, setStopMapData] = useState([]);
    const [distance, setDistance] = useState('');
    const [stopMapSearchValue, setStopMapSearchValue] = useState('');

    const [allPlaces, setAllPlaces] = useState([]) as any;

    const [link, setLink] = useState('');

    let timer: NodeJS.Timeout;

    const handleSearchChange = useCallback((inputValue: string, type: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (type === 'start') {
                setStartSearchValue(inputValue);
            } else if (type === 'end') {
                setEndSearchValue(inputValue);
            } else if (type == 'stop') {
                setStopMapSearchValue(inputValue);
            }
        }, 500);
    }, []);

    const [stops, setStops] = useState([]) as any;

    useEffect(() => {
        const updatedStops = [
            ...(startOption ? [startOption] : []),
            ...stops,
            ...(endOption ? [endOption] : []),
        ];
        setAllPlaces(updatedStops);
    }, [startOption, endOption, stops]);

    const handleAddStop = () => {
        setStops([...stops, null]);
    };

    const handleRemoveStop = (index: any) => {

        setStops(stops.filter((_: any, i: any) => i !== index)); // Remove a stop

    };

    const generateLinkFrom = (places: any[]): string => {
        const coordinates = places
            ?.filter((place: any) => place?.latitude && place?.longitude)
            .map((place: any) => `${place?.latitude},${place?.longitude}`);

        return coordinates.join('|');
    };

    useEffect(() => {
        setLink(generateLinkFrom(allPlaces))
    }, [startOption, endOption, allPlaces]);

    const fetchStopData = async (query: any) => {
        try {
            if (query) {
                const response = await fetch(`/api/radar/places?query=${query}`);
                const data = await response.json();
                if (data.addresses) {
                    const apiData = data.addresses.map((item: any) => ({
                        label: item.formattedAddress,
                        value: { latitude: item.latitude, longitude: item.longitude },
                        latitude: item.latitude,
                        longitude: item.longitude,
                    }));
                    setStopMapData(apiData);
                } else {
                    setStopMapData([]);
                }
            }
        } catch (error) {
            console.error('Error fetching stop data:', error);
        }
    };

    useEffect(() => {
        fetchStopData(stopMapSearchValue);
    }, [stopMapSearchValue]);

    const fetchPlaces = async (query: any, setMapData: any) => {
        if (!query) {
            setMapData([]);
            return;
        }
        try {
            const response = await fetch(`/api/radar/places?query=${query}`);
            const data = await response.json();

            if (data.addresses) {
                const apiData = data.addresses.map((item: any) => ({
                    label: item.formattedAddress,
                    value: { latitude: item.latitude, longitude: item.longitude },
                    latitude: item.latitude,
                    longitude: item.longitude,
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

    const calculateAllPlaceDistance = async () => {
        try {
            if (allPlaces?.length >= 2) {
                const response = await fetch(
                    `/api/radar/allplacesdistance?locations=${link}`
                );
                const data = await response.json();

                if (data.routes[0]?.distance?.text) {
                    setDistance(data.routes[0]?.distance?.text);
                } else {
                    setDistance('');
                }
            }
        } catch (error) {
            console.error("Error calculating distance:", error);
            setDistance('');
        }
    };

    useEffect(() => {
        if (startOption && endOption) {
            calculateAllPlaceDistance();
        } else {
            setDistance('');
            setStops([]);
        }
    }, [startOption, endOption, link])

    const selectStopsStyles = {
        placeholder: (provided: any) => ({
            ...provided,
            fontSize: '14px',
            color: '#666',
            textAlign: 'start'
        }),

        menu: (provided: any) => ({
            ...provided,
            textAlign: 'start',
        }),

        menuList: (provided: any) => ({
            ...provided,
            maxHeight: "160px",
            overflowY: "auto",
        }),
        singleValue: (provided: any) => ({
            ...provided,
            textAlign: "start",
            fontSize: '14px'
        }),

        dropdownIndicator: (provided: any) => ({
            ...provided,
            display: 'none',

        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        indicatorsContainer: (provided: any, state: any) => ({
            ...provided,
            height: '30px',
        }),
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: '#f6f6f6',
            minHeight: '30px',
            height: '30px',
            borderRadius: '20px',
            border: 0,
            boxShadow: '0 !important',
            '&:hover': {
                border: 0
            }
        }),
        clearIndicator: (provided: any, state: any) => ({
            ...provided,
            // paddingRight: '40px',
            cursor: 'pointer'
        }),
        input: (provided: any) => ({
            ...provided,
            fontSize: '14px',
        }),
    };

    const selectStyles = {
        placeholder: (provided: any) => ({
            ...provided,
            fontSize: '16px',
            color: '#666',
            textAlign: 'start'
        }),

        menu: (provided: any) => ({
            ...provided,
            textAlign: 'start',
        }),

        menuList: (provided: any) => ({
            ...provided,
            maxHeight: "160px",
            overflowY: "auto",
        }),
        singleValue: (provided: any) => ({
            ...provided,
            textAlign: "start",
        }),

        dropdownIndicator: (provided: any) => ({
            ...provided,
            display: 'none',

        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: '#f6f6f6',
            height: '40px',
            borderRadius: '20px',
            border: 0,
            boxShadow: '0 !important',
            '&:hover': {
                border: 0
            }
        }),
        clearIndicator: (provided: any, state: any) => ({
            ...provided,
            paddingRight: '40px',
            cursor: 'pointer'
        }),
    };

    const [tripType, setTripType] = useState("oneWay");

    const handleDivClick = (type: any) => {
        setTripType(type);
    };

    const [departureDate, setDepartureDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);

    return (
        <>
            <div className='banner-one-form'>
                <h3 className='form-title'>Cab Services</h3>
                <div className='form mt-3'>
                    <div className="trip-options">
                        <div className="d-flex row px-3">
                            <div
                                className={`col-sm-6 col-xs-6 col-md-6 custom-cursor-pointer ${tripType === "roundTrip" ? "selected" : ""}`}
                                onClick={() => handleDivClick("roundTrip")}
                            >
                                <div className="radio-button custom-cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tripType"
                                        value="roundTrip"
                                        className="me-2"
                                        checked={tripType === "roundTrip"}
                                        onChange={() => setTripType("roundTrip")}
                                    />
                                    Round Trip
                                </div>
                            </div>

                            <div
                                className={`col-sm-6 col-xs-6 col-md-6 mt-2 mt-sm-0 ${tripType === "oneWay" ? "selected" : ""}`}
                                onClick={() => handleDivClick("oneWay")}
                            >
                                <div className="radio-button custom-cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tripType"
                                        value="oneWay"
                                        className="me-2"
                                        checked={tripType === "oneWay"}
                                        onChange={() => setTripType("oneWay")}
                                    />
                                    One Way Trip
                                </div>
                            </div>

                            <div className="col-12 mt-2 mb-1 position-relative">
                                <Select
                                    value={startOption}
                                    onChange={setStartOption}
                                    onInputChange={(value) => handleSearchChange(value, 'start')}
                                    options={startMapData}
                                    placeholder="Pickup Address *"
                                    styles={selectStyles}
                                    filterOption={null}
                                    isClearable
                                />
                                <i
                                    className="icon fa-regular fa-location-arrow position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#666',
                                    }}
                                ></i>
                            </div>

                            <div
                                className={`col-12 px-0 stops-section ${stops.length >= 1 ? 'stops-section-border' : ''}`}
                            >
                                <div className="d-flex justify-content-end">
                                    {endOption && startOption && (
                                        <div className="my-1" onClick={() => handleAddStop()}>
                                            <h6 className="font-bold text-end mb-0 custom-cursor-pointer" style={{ fontSize: "15px", color: "#7d7777" }}>
                                            <i className="fa-regular fa-plus me-1"></i> Add Stops
                                            </h6>
                                        </div>
                                    )}
                                </div>
                                <div className=''>
                                    {stops.map((stop: any, index: any) => (
                                        <div key={index} className="my-1 position-relative d-flex align-items-center">
                                            <div style={{ border: '1px solid #ccc', width: "10%" }} />
                                            <Select
                                                value={stop}
                                                onChange={(value) => {
                                                    const updatedStops = [...stops];
                                                    updatedStops[index] = value;
                                                    setStops(updatedStops);
                                                }}
                                                onInputChange={(value) => handleSearchChange(value, 'stop')}
                                                options={stopMapData}
                                                placeholder={`Stop ${index + 1}`}
                                                styles={selectStopsStyles}
                                                filterOption={null}
                                                className='w-100 me-2'
                                                isClearable
                                            />
                                            <div
                                                onClick={() => handleRemoveStop(index)}
                                                className=" custom-cursor-pointer"
                                            >
                                                <i className="fa-sharp fa-solid fa-circle-xmark text-danger "></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-md-12 mt-2 d-flex position-relative">
                                <Select
                                    value={endOption}
                                    onChange={setEndOption}
                                    onInputChange={(value) => handleSearchChange(value, 'end')}
                                    options={endMapData}
                                    placeholder="Destination Address *"
                                    styles={selectStyles}
                                    className='w-100'
                                    filterOption={null}
                                    isClearable
                                />
                                <i
                                    className="icon fa-regular fa-location-dot position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#666',
                                    }}
                                ></i>
                            </div>

                            <div className="col-md-12 mt-2 custom-input position-relative">
                                <input
                                    type="text"
                                    name="phoneNo"
                                    placeholder='Phone Number *'
                                />
                                <i
                                    className="icon fa-regular fa-phone-volume position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#666',
                                    }}
                                ></i>
                            </div>

                            <div className="col-md-12 mt-2 custom-input position-relative">
                                <DatePicker
                                    selected={departureDate}
                                    onChange={(date: any) => setDepartureDate(date)}
                                    showTimeSelect
                                    timeFormat="h:mm aa"
                                    timeIntervals={30}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    placeholderText="Departure Date *"
                                />
                                <i
                                    className="icon fa-light fa-calendar-days position-absolute"
                                    style={{
                                        right: '30px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#666',
                                    }}
                                ></i>
                            </div>

                            {tripType == 'roundTrip' && (
                                <div className="col-md-12 mt-2 custom-input position-relative">
                                    <DatePicker
                                        selected={returnDate}
                                        onChange={(date: any) => setReturnDate(date)}
                                        showTimeSelect
                                        timeFormat="h:mm aa"
                                        timeIntervals={30}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholderText="Return Date *"
                                    />
                                    <i
                                        className="icon fa-light fa-calendar-days position-absolute"
                                        style={{
                                            right: '30px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            pointerEvents: 'none',
                                            color: '#666',
                                        }}
                                    ></i>
                                </div>
                            )}

                            {distance && (
                                <p className='text-start mt-1 mb-0'>Total Distance: {distance}</p>
                            )}

                            <div className="col-lg-12 col-md-12 col-sm-12 mt-3 mb-3">
                                <button
                                    type="submit"
                                    className="form-banner-button w-100"
                                >
                                    <span className="btn-title">{buttonName}</span>
                                </button>

                            </div>


                        </div>
                    </div>
                </div>

            </div>
        </>

    );
};

export default BookingFormOnBannerTwo;
