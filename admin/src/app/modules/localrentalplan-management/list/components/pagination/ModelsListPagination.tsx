// import clsx from 'clsx';
// import {useQueryResponseLoading, useQueryResponsePagination} from '../../../core/QueryResponseProvider';
// import {useQueryRequest} from '../../../core/QueryRequestProvider';

// const mappedLabel = (label: string): string => {
// 	if (label === '&laquo; Previous') {
// 		return 'Previous'
// 	}

// 	if (label === 'Next &raquo;') {
// 		return 'Next'
// 	}

// 	return label
// }

// const ModelsListPagination = () => {
// 	const pagination    = useQueryResponsePagination()
// 	const isLoading     = useQueryResponseLoading()    
// 	const {updateState} = useQueryRequest()        
// 	const updatePage = (page: number | null) => {
// 		if (!page || isLoading || pagination.page === page) {
// 			return
// 		}
// 		updateState({page, items_per_page: pagination.items_per_page || 10})
// 	}

// 	return (
// 		<div className='row'>
// 			<div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'>
// 			<label className='fs-5 fw-semibold mb-2 me-3'> Records per page </label>
// 				<select className="form-select form-select-solid w-100px" onChange={(event:any) => {updateState({items_per_page: event.target.value});updatePage(1)}} name='items_per_page'>
// 					{pagination.items_per_pages?.map((Obj)=>{
// 						return(<option value={Obj} key={Obj}>{Obj}</option> )
// 					})}
// 				</select>
// 			</div>
// 			<div className='col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'>
// 				<div id='kt_table_users_paginate'>
// 					<ul className='pagination'>
// 						{pagination.links
// 							?.map((link) => {
// 								return {...link, label: mappedLabel(link.label)}
// 							})
// 							.map((link) => (
// 								<li
// 									key={link.label}
// 									className={clsx('page-item', {
// 										active: pagination.page === link.page,
// 										disabled: isLoading,
// 										previous: link.label === 'Previous',
// 										next: link.label === 'Next',
// 									})}
// 								>
// 									<a
// 										className={clsx('page-link', {
// 											'page-text': link.label === 'Previous' || link.label === 'Next',
// 											'me-5': link.label === 'Previous',
// 										})}
// 										onClick={() => updatePage(link.label as any)}
// 										style={{cursor: 'pointer'}}
// 									>
// 										{mappedLabel(link.label)}
// 									</a>
// 								</li>
// 							))
// 						}
// 					</ul>
// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// export {ModelsListPagination}


import clsx from 'clsx';
import {
    useQueryResponseLoading,
    useQueryResponsePagination,
} from '../../../core/QueryResponseProvider';
import { useQueryRequest } from '../../../core/QueryRequestProvider';

const mappedLabel = (label: string): string => {
    if (label === '&laquo; Previous') {
        return 'Previous';
    }

    if (label === 'Next &raquo;') {
        return 'Next';
    }

    return label;
};

const getPageFromLabel = (label: string, currentPage: number): number => {
    if (label === 'Previous') {
        return currentPage - 1;
    }

    if (label === 'Next') {
        return currentPage + 1;
    }

    return Number(label);
};

const ModelsListPagination = () => {
    const pagination = useQueryResponsePagination();
    const isLoading = useQueryResponseLoading();
    const { updateState } = useQueryRequest();

    const updatePage = (page: number | null) => {
        if (!page || isLoading || pagination.page === page) {
            return;
        }
        updateState({ page, items_per_page: pagination.items_per_page || 10 });
    };

    const handlePageClick = (label: string) => {
        const newPage = getPageFromLabel(label, pagination.page);
        updatePage(newPage);
    };

    const isFirstPage = pagination.page === 1;
    const isLastPage = pagination.page === pagination.last_page;

    return (
        <div className='row'>
            <div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'>
                <label className='fs-5 fw-semibold mb-2 me-3'> Records per page </label>
                <select
                    className="form-select form-select-solid w-100px"
                    onChange={(event: any) => { updateState({ items_per_page: event.target.value }); updatePage(1); }}
                    name='items_per_page'
                >
                    {pagination.items_per_pages?.map((Obj) => (
                        <option value={Obj} key={Obj}>{Obj}</option>
                    ))}
                </select>
            </div>
            <div className='col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'>
                <div id='kt_table_users_paginate'>
                    <ul className='pagination'>
                        {pagination.links?.map((link) => {
                            const label = mappedLabel(link.label);
                            const page = getPageFromLabel(label, pagination.page);

                            if ((label === 'Previous' && isFirstPage) || (label === 'Next' && isLastPage)) {
                                return null;
                            }
                            return (
                                <li
                                    key={link.label}
                                    className={clsx('page-item', {
                                        disabled: isLoading,
                                        previous: label === 'Previous',
                                        next: label === 'Next',
                                        active: pagination.page === page,
                                    })}
                                >
                                    <a
                                        className={clsx('page-link common-menu-button', {
                                            'page-text': label === 'Previous' || label === 'Next',
                                        })}
                                        onClick={() => handlePageClick(label)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export { ModelsListPagination };