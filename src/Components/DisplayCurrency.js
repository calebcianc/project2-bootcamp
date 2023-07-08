import React, { useEffect, useState } from "react";
import { Button, Form, Modal, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

export default function DisplayCurrency({
  displayCurrency,
  setDisplayCurrency,
  totalAmount,
  currenciesList,
}) {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [interimCurrency, setInterimCurrency] = useState(displayCurrency);

  const handleShow = () => {
    setShowCurrencyModal(true);
  };
  const handleClose = () => {
    setShowCurrencyModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Interim currency: ${interimCurrency}`);
    setDisplayCurrency(interimCurrency);
    handleClose();
  };

  useEffect(() => {
    console.log(`Display currency: ${displayCurrency}`);
  }, [displayCurrency]);

  return (
    <div>
      <div>
        <div
          title="Click to change display currency"
          onClick={handleShow}
          style={{ cursor: "pointer", fontSize: "25px", fontWeight: "bold" }}
        >
          {displayCurrency} {totalAmount}
        </div>
      </div>
      <Modal show={showCurrencyModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Currency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <InputGroup className="mb-3">
              <Form.Label></Form.Label>
              <Typeahead
                id="currency-typeahead"
                labelKey="currency"
                placeholder="Search currency"
                onChange={(selected) => setInterimCurrency(selected[0])}
                options={currenciesList}
              ></Typeahead>
            </InputGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSubmit}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
