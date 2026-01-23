import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { importPincodesReq } from '../../../core/_requests'
import { ToastComponent } from '../../../../../../_metronic/helpers/components/ToastComponent'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { ID } from '../../../../../../_metronic/helpers'



const ImportPincodes = () => {
    const [file, setFile] = useState<File | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [showToast, setShowToast] = useState(false)
    const [message, setMessage] = useState('')
    const [toastText, setToastText] = useState({
        status: 'danger',
        text: 'error',
    })
    const API_URL = process.env.REACT_APP_BACKEND_BASE_URL

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }
    useEffect(() => {
        setStatusMessage('')
        setFile(null)
    }, [showModal])


    const params = useParams();

    const handleImport = async () => {
        if (!file) {
            setStatusMessage('Please select a file to import.')
            return
        }

        try {

            const response = await importPincodesReq(file, params.id as ID)
            if (response.status) {
                setStatusMessage(`Success: ${response.message}`)
                setMessage('Pincode Imported Successfully')
                setShowToast(true)
                setToastText({
                    status: 'success',
                    text: response.message,
                })
                setShowModal(false)
                if (response.errorFile) {
                    window.open(API_URL + response.errorFile, '_blank')
                }
            } else {
                setStatusMessage(`Failed: ${response.message}`)
                setToastText({
                    status: 'danger',
                    text: response.message,
                })
                if (response.errorFile) {
                    window.open(API_URL + response.errorFile, '_blank')
                }
            }
        } catch (error) {
            setStatusMessage('An error occurred while importing Pincodes.')
            setToastText({
                status: 'danger',
                text: 'An error occurred while importing Pincodes.',
            })
            console.error(error)
        }
    }

    return (
        <>
            <ToastComponent bg={toastText.status} title={toastText.text} msg={message} show={showToast} onChange={() => setShowToast(false)} />

            {/* Button to Open Modal */}
            <Button variant="primary" className="mx-2" onClick={() => setShowModal(true)}>
                Import Pincodes
            </Button>

            {/* Modal Design */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title> + Import Pincode</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="mb-3">
                            <label className="form-label required fw-semibold fs-6 mb-2">Please Select File</label>
                            <input type="file" accept=".xls,.xlsx" className="form-control" onChange={handleFileChange} />
                            {statusMessage && <p className="text-danger mt-2">{statusMessage}</p>}
                        </div>
                    </form>
                    {/* Download Button */}
                    <a
                        href={process.env.REACT_APP_BACKEND_BASE_URL +
                            "/sample_import/sample_citywise_pincode_import.xlsx"}
                        download="sample_citywise_pincode_importxlsx"
                        className="btn btn-primary"
                        target='_blank'
                    >
                        Download Sample Sheet
                    </a>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleImport}>
                        Import
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ImportPincodes
