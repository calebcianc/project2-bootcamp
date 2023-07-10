import "../App.css";
import AllExpenses from "./AllExpenses";
import DisplayCurrency from "./DisplayCurrency";
import Filter from "./Filter";
import Export from "./Export";
import InputExpenses from "./InputExpenses";
import { useState, useRef, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { BeatLoader } from "react-spinners";

export default function ListExpenses({
  uid,
  groupedExpenses,
  expensesCategory,
  categoriesData,
  currenciesList,
  mapRef,
  lat,
  lng,
  setLat,
  setLng,
  expenseCounter,
  setExpenseCounter,
  displayCurrency,
  setDisplayCurrency,
  handleOnSelect,
  handleDeleteExpenses,
  formatter,
  isHighlighted,
  isLoadingExpenses,
  exchangeRates,
  noExpenses,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: null,
    startDate: null,
    endDate: null,
    upperLimit: null,
    lowerLimit: null,
  });
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [selectedExpensesData, setSelectedExpensesData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleShowReceiptClick = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const closeReceiptModal = () => {
    setSelectedExpense(null);
    setShowModal(false);
  };

  // Filter the expenses based on the selected start date and end date
  useEffect(() => {
    const filteredExpenses = expensesCategory.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate >= new Date(filters.startDate) &&
        expenseDate <= new Date(filters.endDate)
      );
    });

    // Sum up the totalAmount for the filtered expenses
    const calculatedTotalAmount = filteredExpenses.reduce(
      (accumulator, expense) => accumulator + parseFloat(expense.displayAmount),
      0
    );

    // update the totalAmount state. use toFixed(2) to show 2 dp even when there's only 1 decimal place.
    setTotalAmount(formatter.format(calculatedTotalAmount));
  }, [filters, expensesCategory]);

  // Pan to latest expense location whenever there's a change in expenses
  useEffect(() => {
    // map to pan to most recently added expense
    const getLatestExpLocation = () => {
      const expensesArray = Object.values(expensesCategory);
      // console.log(expensesArray[0]);
      const lastExpense = expensesArray[0];
      if (lastExpense && !isNaN(lastExpense.lat) && !isNaN(lastExpense.lng)) {
        return { lat: lastExpense.lat, lng: lastExpense.lng };
      } else {
        return null;
      }
    };

    // Pan to latest expense location once extracted
    const fetchAndPanToLatestLocation = async () => {
      const location = await getLatestExpLocation();
      if (location !== null && isLoadingExpenses === false) {
        mapRef.panTo(location);
      }
    };

    fetchAndPanToLatestLocation();
  }, [expensesCategory, groupedExpenses]);

  return (
    <div className="list-container">
      <div className="card-header">
        <div className="mini-navbar" style={{ padding: "0 5px 0 15px" }}>
          <div id="display-currency">
            <DisplayCurrency
              displayCurrency={displayCurrency}
              setDisplayCurrency={setDisplayCurrency}
              totalAmount={totalAmount}
              currenciesList={currenciesList}
            />
          </div>
          <div
            id="add-sort-buttons"
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "10px",
              fontSize: "1.5rem",
            }}
          >
            <Filter
              style={{ cursor: "pointer" }}
              setFilters={setFilters}
              categoriesData={categoriesData}
            />
            <Export
              showCheckboxes={showCheckboxes}
              setShowCheckboxes={setShowCheckboxes}
              selectedExpenses={selectedExpenses}
              setSelectedExpenses={setSelectedExpenses}
              selectedExpensesData={selectedExpensesData}
              setSelectedExpensesData={setSelectedExpensesData}
            />
          </div>
        </div>
      </div>
      <div
      // className="allExp-container"
      >
        {isLoadingExpenses ? (
          <div className="temporary-box">
            <BeatLoader color={"#3dd381"} loading={isLoadingExpenses} />
          </div>
        ) : (
          <div>
            <div>
              <InputExpenses
                uid={uid}
                mapRef={mapRef}
                lat={lat}
                setLat={setLat}
                lng={lng}
                setLng={setLng}
                expensesCategory={expensesCategory}
                setExpenseCounter={setExpenseCounter}
                currenciesList={currenciesList}
                displayCurrency={displayCurrency}
                categoriesData={categoriesData}
                exchangeRates={exchangeRates}
              />
            </div>
            <div className="allExp-container">
              <AllExpenses
                uid={uid}
                currenciesList={currenciesList}
                groupedExpenses={groupedExpenses}
                expensesCategory={expensesCategory}
                expenseCounter={expenseCounter}
                setExpenseCounter={setExpenseCounter}
                isHighlighted={isHighlighted}
                formatter={formatter}
                handleOnSelect={handleOnSelect}
                handleShowReceiptClick={handleShowReceiptClick}
                handleDeleteExpenses={handleDeleteExpenses}
                categoriesData={categoriesData}
                filters={filters}
                showCheckboxes={showCheckboxes}
                setShowCheckboxes={setShowCheckboxes}
                selectedExpenses={selectedExpenses}
                setSelectedExpenses={setSelectedExpenses}
                selectedExpensesData={selectedExpensesData}
                setSelectedExpensesData={setSelectedExpensesData}
                exchangeRates={exchangeRates}
                displayCurrency={displayCurrency}
                isLoadingExpenses={isLoadingExpenses}
                noExpenses={noExpenses}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal to display receipt */}
      <Modal show={showModal} onHide={closeReceiptModal}>
        <Modal.Header closeButton>
          <Modal.Title>Receipt Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExpense && (
            <img
              src={selectedExpense.receiptUrl}
              alt="Expense"
              style={{ width: "100%" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="close-button" onClick={closeReceiptModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
