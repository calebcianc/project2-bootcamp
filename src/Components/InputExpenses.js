import "../App.css";
import { useEffect, useState } from "react";
import { Button, Form, Modal, InputGroup } from "react-bootstrap";
import { realTimeDatabase, storage } from "../firebase";
import { push, ref, set } from "firebase/database";
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

export default function InputExpenses({
  uid,
  lat,
  setLat,
  lng,
  setLng,
  expenseCounter,
  setExpenseCounter,
  userLocation,
  currenciesList,
  displayCurrency,
  categoriesData,
  exchangeRates,
}) {
  const [show, setShow] = useState(false);
  const [category, setCategory] = useState({ category: "initial", emoji: "" });
  const [currency, setCurrency] = useState("SGD"); // inputCurrency
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("-");
  const currentDate = new Date().toISOString().substring(0, 10); // Get current date in yyyy-MM-dd format
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(currentDate);
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

  // functions to show / hide inputExpenses modal
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  // reset to prepare states for next input
  const handleNewInput = () => {
    setCategory({ category: "", color: "", emoji: "" });
    setAmount(0);
    setAddress("");
    setDescription("-");
    setDate(currentDate);
    setReceiptFile("");
    setReceiptFileValue("");
  };

  // add to expenses db and receipt storage
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("category:", category);
    console.log("category:", category.category);
    const expRef = ref(realTimeDatabase, `${DB_EXPENSES_FOLDER_NAME}/${uid}`);
    const newExpRef = push(expRef);
    const newExpenseKey = newExpRef.key;
    let displayAmount = amount;
    if (currency !== displayCurrency) {
      const rateFrom = exchangeRates[currency];
      const rateTo = exchangeRates[displayCurrency];
      displayAmount = (amount / rateFrom) * rateTo;
    }
    set(newExpRef, {
      categoryName: category.category, // save the category name
      currency: currency,
      displayCurrency: displayCurrency,
      amount: amount,
      displayAmount: displayAmount,
      lat: lat,
      lng: lng,
      description: description,
      date: date,
    });

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
            `${DB_EXPENSES_FOLDER_NAME}/${uid}/${newExpenseKey}/receiptUrl`
          );
          set(currExpRef, receiptUrl);
        });
      });
    }

    handleClose();
    handleNewInput();
    setExpenseCounter((prevExpenseCounter) => prevExpenseCounter + 1);
  };

  // to ensure that selection of the first element in the category will be shown. eg Food will be saved to db as category
  useEffect(() => {
    if (categoriesData.length > 0) {
      setCategory(categoriesData[0]);
    }
  }, [categoriesData]);

  return (
    <div>
      <div>
        <Button
          className="add-button"
          onClick={handleShow}
          title="Click to add new expenses"
          style={{ width: "100%" }}
        >
          + Add Expense
        </Button>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Input Expenses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
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
              aria-label="Default select example"
              onChange={(e) => {
                const selectedCategory = categoriesData.find(
                  (categoryObj) =>
                    `${categoryObj.emoji} ${categoryObj.category}` ===
                    e.target.value
                );
                setCategory(selectedCategory);
              }}
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
            <br />

            <InputGroup className="mb-3">
              <Typeahead
                id="currency-typeahead"
                labelKey="currency"
                placeholder={currency}
                onChange={(selected) => setCurrency(selected[0])}
                options={currenciesList}
              ></Typeahead>

              <Form.Control
                type="number"
                placeholder="0"
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
                    size="sm"
                    id="look-up-btn"
                    onClick={getLatLng}
                    variant="outline-secondary"
                  >
                    Search
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
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Description of item</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formFile" className="mb-3">
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
          <Button onClick={handleClose} className="close-button">
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={category === "" || amount === 0}
            className="add-button"
          >
            Add item
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
