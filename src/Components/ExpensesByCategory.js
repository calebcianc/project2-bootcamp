import React, { useState } from "react";
import { Card, Collapse } from "react-bootstrap";

export default function ExpensesByCategory({ filteredExpenses }) {
  const [openCardIndex, setOpenCardIndex] = useState(null);
  console.log("filteredExpenses:", filteredExpenses);
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
  console.log("expensesByCategory", expensesByCategory);
  return (
    /*This component maps through each category of expenses and creates a Card for each category. The Card will show the total amount of expenses for that category and will expand to show each individual expense when clicked. */
    <div className="container mt-4" style={{ width: "500px" }}>
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
                  fontSize: "2rem",
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
                {expenses[0].displayCurrency} {total}
              </div>
            </Card.Header>

            <Collapse in={openCardIndex === index}>
              <div id="collapseInfo">
                {expenses.map((expense) => (
                  <Card
                    key={expense.id}
                    className="my-card-body"
                    style={{ margin: "10px", border: "1px solid black" }}
                  >
                    <Card.Body
                      key={expense.id}
                      style={{ backgroundColor: "white", textAlign: "left" }}
                    >
                      {/* Display the individual expense */}
                      <Card.Title>
                        <strong>{expense.date}</strong>
                      </Card.Title>
                      <Card.Text>
                        {expense.displayCurrency}{" "}
                        {parseFloat(expense.displayAmount).toFixed(2)}
                        {" ("}
                        {expense.currency} {expense.amount})
                        <br />
                        {expense.description}
                      </Card.Text>
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
