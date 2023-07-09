import { useScrollTrigger } from "@mui/material";
import "../App.css";
import EditExpenses from "./EditExpenses";
import { useRef, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
export default function AllExpenses({
  uid,
  currenciesList,
  groupedExpenses,
  expensesCategory,
  expenseCounter,
  setExpenseCounter,
  isHighlighted,
  formatter,
  handleOnSelect,
  handleShowReceiptClick,
  handleDeleteExpenses,
  categoriesData,
  filters,
  showCheckboxes,
  setShowCheckboxes,
  selectedExpenses,
  setSelectedExpenses,
  selectedExpensesData,
  setSelectedExpensesData,
  exchangeRates,
  displayCurrency,
  isLoadingExpenses,
  noExpenses,
}) {
  const highlightedCardRef = useRef(null); // Create reference for highlighted card
  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // useEffect to cause highlighted card to scroll into view
  useEffect(() => {
    if (highlightedCardRef.current) {
      highlightedCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isHighlighted]);

  // Triggered when user checks box for expense for export; adds expense id to state
  const handleCheckboxChange = (data, id) => {
    setSelectedExpenses((prev) => {
      if (prev.includes(id)) {
        setSelectedExpensesData((prevData) => {
          return prevData.filter((expenseData) => expenseData.id !== id);
        });
        return prev.filter((expenseId) => expenseId !== id);
      } else {
        setSelectedExpensesData((prevData) => {
          return [...prevData, data];
        });
        return [...prev, id];
      }
    });
  };

  useEffect(() => {
    console.log(JSON.stringify(groupedExpenses));
  }, [isLoadingExpenses]);

  return (
    <div className="allExp-container">
      {noExpenses
        ? null
        : // Map through the object of date-grouped expenses
          Object.entries(groupedExpenses).map(([date, expenses]) => {
            // Filter expenses
            let filteredExpenses = expenses.filter((expense) => {
              let expenseDate = new Date(date);
              let startDate = filters.startDate
                ? new Date(filters.startDate)
                : null;
              let endDate = filters.endDate ? new Date(filters.endDate) : null;
              if (startDate && expenseDate < startDate) return false;
              if (endDate && expenseDate > endDate) return false;
              if (filters.category && expense.category !== filters.category)
                return false;
              if (
                filters.lowerLimit &&
                expense.displayAmount < filters.lowerLimit
              )
                return false;
              if (
                filters.upperLimit &&
                expense.displayAmount > filters.upperLimit
              )
                return false;
              return true;
            });
            if (filteredExpenses.length === 0) return null;
            return (
              <div key={date}>
                {/*overall date header */}
                <div className="expense-date-title">
                  <Card.Header>{date}</Card.Header>
                </div>
                {/* Map through the expenses within each date-group */}
                {filteredExpenses.map(
                  (expense) =>
                    expense.displayAmount !== undefined && (
                      <div
                        key={expense.id}
                        className={`${
                          expense.id === isHighlighted ? "highlighted-card" : ""
                        }`}
                        ref={
                          expense.id === isHighlighted
                            ? highlightedCardRef
                            : null
                        }
                      >
                        <Card onClick={() => handleOnSelect(expense)}>
                          <Card.Body style={{ padding: "5px 15px" }}>
                            <div className="card-content">
                              {/* Additional div wrapper needed to keep the category icon circle round */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  id="for-icon"
                                  style={{ marginRight: "15px" }}
                                >
                                  {showCheckboxes ? (
                                    <div
                                      key={`${expense.id}`}
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: "50%",
                                        width: "3rem",
                                        height: "3rem",
                                        fontSize: "2rem",
                                        backgroundColor: expense.color,
                                      }}
                                      className="mb-3"
                                    >
                                      <Form.Check
                                        className="custom-checkbox"
                                        type="checkbox"
                                        checked={selectedExpenses.includes(
                                          expense.id
                                        )}
                                        onChange={() => [
                                          handleCheckboxChange(
                                            expense,
                                            expense.id
                                          ),
                                        ]}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        borderRadius: "50%",
                                        width: "3rem",
                                        height: "3rem",
                                        fontSize: "2rem",
                                        backgroundColor: expense.color,
                                      }}
                                    >
                                      {expense.emoji}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Card.Subtitle style={{ marginTop: "0px" }}>
                                    {expense.category}
                                  </Card.Subtitle>
                                  <Card.Text
                                    className="text-muted"
                                    style={{ marginBottom: "0px" }}
                                  >
                                    {/* Show description if available */}
                                    {expense.description !== "-"
                                      ? expense.description
                                      : null}
                                  </Card.Text>
                                  <Card.Text className="text-muted ">
                                    {/* Display displayCurrency+Amount, otherwise show input currency+amount */}
                                    {`${
                                      expense.displayCurrency
                                    } ${formatter.format(
                                      expense.displayAmount
                                    )}`}
                                    {/* If the displayCurrency is different from the input currency, show the input currency and amount */}
                                    {expense.displayCurrency !==
                                    expense.currency
                                      ? ` (${
                                          expense.currency
                                        } ${formatter.format(expense.amount)})`
                                      : null}
                                  </Card.Text>
                                </div>
                              </div>
                              {/* Div to contain the emoji-buttons to show receipt, edit expense, delete expense */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "1.5rem",
                                }}
                              >
                                {expense.receiptUrl ? (
                                  <span
                                    variant="info"
                                    onClick={() =>
                                      handleShowReceiptClick(expense)
                                    }
                                    title="Click to view receipt"
                                    style={{ margin: "5px" }}
                                  >
                                    🖼️
                                  </span>
                                ) : (
                                  []
                                )}
                                <EditExpenses
                                  uid={uid}
                                  expense={expense}
                                  currenciesList={currenciesList}
                                  expenseCounter={expenseCounter}
                                  setExpenseCounter={setExpenseCounter}
                                  categoriesData={categoriesData}
                                  exchangeRates={exchangeRates}
                                  displayCurrency={displayCurrency}
                                />
                                <span
                                  id="delete-button"
                                  variant="danger"
                                  onClick={() =>
                                    handleDeleteExpenses(expense.id)
                                  }
                                  title="Click to delete expense"
                                  style={{ margin: "5px" }}
                                >
                                  🗑️
                                </span>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    )
                )}
              </div>
            );
          })}
    </div>
  );
}
