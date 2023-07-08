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
  // isLoading,
  isLoadingExpenses,
  exchangeRates,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const highlightedCardRef = useRef(null); // Create reference for highlighted card
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

  // Display receipt when showReceipt button is clicked
  const handleShowReceiptClick = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  // Hide receipt when button is clicked
  const closeReceiptModal = () => {
    setSelectedExpense(null);
    setShowModal(false);
  };

  // Sum up the totalAmount for all expenses to be displayed
  const totalAmount = expensesCategory.reduce(
    (accumulator, expense) => accumulator + parseFloat(expense.displayAmount),
    0
  );

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

  // useEffect to cause highlighted card to scroll into view
  useEffect(() => {
    if (highlightedCardRef.current) {
      highlightedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isHighlighted]);

  return (
    <div className="list-container">
      <div className="card-header">
        <div className="mini-navbar" style={{ padding: "0 15px" }}>
          <div id="display-currency">
            <DisplayCurrency
              displayCurrency={displayCurrency}
              setDisplayCurrency={setDisplayCurrency}
              totalAmount={formatter.format(totalAmount)}
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
      <div className="allExp-container">
        {isLoadingExpenses ? (
          <div className="temporary-box">
            <BeatLoader color={"#3dd381"} loading={isLoadingExpenses} />
          </div>
        ) : (
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
            />
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
          <Button variant="secondary" onClick={closeReceiptModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
