import React, { useState } from "react";
import { Card, Collapse } from "react-bootstrap";

export default function ExpensesByCategory({ filteredExpenses }) {
  const [openCardIndex, setOpenCardIndex] = useState(null);

  const toggleCollapse = (index) => {
    if (openCardIndex === index) {
      setOpenCardIndex(null); // if it's already open, close it
    } else {
      setOpenCardIndex(index); // otherwise, open this one
    }
  };
  // Group expenses by category and sum them up
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    (acc[expense.category] = acc[expense.category] || []).push(expense);
    return acc;
  }, {});

  // Format numbers to the decimal format i.e., add a comma for every thousand and decimal places if applicable
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    /*This component maps through each category of expenses and creates a Card for each category. The Card will show the total amount of expenses for that category and will expand to show each individual expense when clicked. */
    <div className="container" style={{ padding: "0", width: "500px" }}>
      {Object.entries(expensesByCategory).map(([category, expenses], index) => {
        const total = expenses
          .reduce((sum, expense) => sum + parseFloat(expense.displayAmount), 0)
          .toFixed(2);
        return (
          <Card
            // style={{ backgroundColor: " #cac8c8" }}
            onClick={() => toggleCollapse(index)}
            aria-controls="collapseInfo"
          >
            <Card.Header style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%",
                  width: "3rem",
                  height: "3rem",
                  fontSize: "1.2rem",
                  backgroundColor: expenses[0].color,
                }}
              >
                {expenses[0].emoji}
              </div>
              <div style={{ marginLeft: "10px" }}>
                <span style={{ fontWeight: "bold" }}>{category}</span>
                <div style={{ fontSize: "smaller" }}>
                  {expenses.length} Expenses
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                {expenses[0].displayCurrency} {formatter.format(total)}
              </div>
            </Card.Header>

            <Collapse in={openCardIndex === index}>
              <div id="collapseInfo">
                {expenses.map((expense) => (
                  <Card
                    key={expense.id}
                    className="my-card-body"
                    // style={{ margin: "10px" }}
                  >
                    <Card.Body
                      key={expense.id}
                      style={{
                        padding: "5px 15px",
                        marginLeft: "57px",
                        backgroundColor: "white",
                        textAlign: "left",
                        fontSize: "0.9rem",
                        display: "flex",
                      }}
                    >
                      {/* Display the individual expense */}
                      <div>
                        <Card.Title
                          style={{ fontSize: "1rem", marginBottom: "5px" }}
                        >
                          <b>{expense.date}</b>
                        </Card.Title>
                        <Card.Text>
                          {`${expense.description} (${
                            expense.currency
                          } ${formatter.format(expense.amount)})`}
                        </Card.Text>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <Card.Text>{`${
                          expense.displayCurrency
                        } ${formatter.format(
                          expense.displayAmount
                        )}`}</Card.Text>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Collapse>
          </Card>
        );
      })}
    </div>
  );
}
