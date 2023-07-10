import "../App.css";
import { useState } from "react";
import { Button, Form, Modal, InputGroup } from "react-bootstrap";
import { realTimeDatabase, storage } from "../firebase";
import { ref, set, update } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import Geocode from "react-geocode";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

const DB_EXPENSES_FOLDER_NAME = "expenses";
const STORAGE_EXPENSES_FOLDER_NAME = "receiptPhoto";

export default function EditExpenses({
  uid,
  mapRef,
  expenseCounter,
  setExpenseCounter,
  currenciesList,
  expense,
  categoriesData,
  exchangeRates,
  displayCurrency,
}) {
  // State to handle open and close of modal
  const [show, setShow] = useState(false);
  // States to store expense data
  const [date, setDate] = useState(expense.date);
  const [category, setCategory] = useState(expense.categoryName);
  // to display emoji with category
  const [categoryDisplay, setCategoryDisplay] = useState(
    `${expense.emoji} ${expense.categoryName}`
  );

  const [currency, setCurrency] = useState(expense.currency);
  const [amount, setAmount] = useState(expense.amount);
  const [description, setDescription] = useState(expense.description);
  const [lat, setLat] = useState(expense.lat);
  const [lng, setLng] = useState(expense.lng);
  const [address, setAddress] = useState("");
  const [receiptFile, setReceiptFile] = useState("");
  const [receiptFileValue, setReceiptFileValue] = useState("");

  // Get lat and lng coordinates on 'look up' button press
  const getLatLng = () =>
    Geocode.fromAddress(address, process.env.REACT_APP_API_KEY).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        setLat(lat);
        setLng(lng);
      },
      (error) => {
        console.error(error);
        setLat(null);
        setLng(null);
      }
    );

  // Show / hide modal
  const handleClose = () => {
    setShow(false);
    setReceiptFile("");
    setReceiptFileValue("");
  };

  const handleShow = () => {
    setShow(true);
  };

  // Update data in db
  const handleUpdate = (e) => {
    e.preventDefault();

    const expRef = ref(
      realTimeDatabase,
      `${DB_EXPENSES_FOLDER_NAME}/${uid}/${expense.id}`
    );

    let displayAmount = amount;
    if (currency !== displayCurrency) {
      const rateFrom = exchangeRates[currency];
      const rateTo = exchangeRates[displayCurrency];
      displayAmount = (amount / rateFrom) * rateTo;
    }

    // Update data at expense reference location
    update(expRef, {
      categoryName: category,
      currency: currency,
      amount: amount,
      displayAmount: displayAmount,
      lat: lat,
      lng: lng,
      description: description,
      date: date,
    });
    console.log(`expRef: ${expRef}`);
    if (receiptFile) {
      const expFileRef = storageRef(
        storage,
        ` ${STORAGE_EXPENSES_FOLDER_NAME}/${uid}/${receiptFile.name}`
      );
      uploadBytes(expFileRef, receiptFile).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((receiptUrl) => {
          // update expenses db with expenses photo url
          const currExpRef = ref(
            realTimeDatabase,
            `${DB_EXPENSES_FOLDER_NAME}/${uid}/${expense.id}/receiptUrl`
          );
          set(currExpRef, receiptUrl);
        });
      });
    }
    handleClose();
    // Increase expense counter so map in the main page will pan to latest expense location
    // setExpenseCounter((prevExpenseCounter) => prevExpenseCounter + 1);
    setReceiptFile("");
    setReceiptFileValue("");
  };

  return (
    <>
      <span
        id="edit-button"
        title="Click to edit expense"
        onClick={handleShow}
        style={{ margin: "5px", cursor: "pointer" }}
      >
        ✏️
      </span>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-2"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
            <Form.Select
              className="mb-2"
              aria-label="Default select example"
              value={categoryDisplay}
              onChange={(e) => {
                const selectedCategory = categoriesData.find(
                  (categoryObj) =>
                    `${categoryObj.emoji} ${categoryObj.category}` ===
                    e.target.value
                );
                setCategory(selectedCategory.category); // only set the category name for database
                setCategoryDisplay(e.target.value);
              }} // update display state with new selected value
              required
            >
              <option value="" disabled>
                Category
              </option>
              {categoriesData.map((categoryObj, index) => (
                <option
                  key={index}
                  value={`${categoryObj.emoji} ${categoryObj.category}`}
                >
                  {categoryObj.emoji} {categoryObj.category}
                </option>
              ))}
            </Form.Select>

            <InputGroup className="mb-2">
              <Typeahead
                id="currency-typeahead"
                labelKey="currency"
                placeholder={currency}
                onChange={(selected) => setCurrency(selected[0])}
                options={currenciesList}
              ></Typeahead>
              <Form.Control
                type="number"
                placeholder={amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </InputGroup>
            <Form.Group className="form-group">
              <Form.Label className="compact-label">Location</Form.Label>
              {lat && lng ? (
                <div className="coordinates-display green">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </div>
              ) : (
                <div
                  className="coordinates-display grey-italics"
                  style={{ color: "red" }}
                >
                  <em>Please input address</em>
                </div>
              )}
              <div id="address-look-up">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Form.Control
                    type="text"
                    size="sm"
                    value={address}
                    placeholder="Enter address, click on map, ignore to use current location"
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    id="look-up-btn"
                    onClick={getLatLng}
                    style={{
                      flexShrink: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      minWidth: 0,
                    }}
                  >
                    Look up
                  </Button>
                </div>
              </div>
              <div id="loc-option-2">
                <GoogleMap
                  onClick={(e) => {
                    setLat(e.latLng.lat());
                    setLng(e.latLng.lng());
                  }}
                  mapContainerStyle={{
                    width: "100%",
                    height: "20vh",
                  }}
                  center={
                    lat && lng
                      ? { lat: lat, lng: lng }
                      : {
                          lat: 1.365,
                          lng: 103.815,
                        }
                  }
                  zoom={11}
                >
                  <MarkerF position={{ lat: lat, lng: lng }} />
                </GoogleMap>
                <br />
              </div>
            </Form.Group>
            <Form.Group
              className="mb-2"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                type="text"
                placeholder={description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formFile" className="mb-2">
              <Form.Label>Upload receipt</Form.Label>
              <Form.Control
                type="file"
                value={receiptFileValue}
                onChange={(e) => {
                  setReceiptFile(e.target.files[0]);
                  setReceiptFileValue(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="close-button" onClick={handleClose}>
            Close
          </Button>
          <Button
            className="add-button"
            onClick={handleUpdate}
            disabled={category === "" || amount === 0}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
