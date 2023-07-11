import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

export default function ExpPieChart({ filteredExpenses, categoriesData }) {
  // Calculate the sum of amounts by category
  const displayAmountByCategory = {};
  filteredExpenses.forEach((expense) => {
    const categoryName = expense.categoryName;
    const displayAmount = parseFloat(expense.displayAmount);
    if (!displayAmountByCategory[categoryName]) {
      displayAmountByCategory[categoryName] = 0;
    }
    displayAmountByCategory[categoryName] += displayAmount;
    displayAmountByCategory[categoryName] = parseFloat(
      displayAmountByCategory[categoryName].toFixed(2)
    );
  });

  // convert object into array of arrays.map convert each inner array to an object
  const pieChartData = Object.entries(displayAmountByCategory).map(
    ([categoryName, displayAmount]) => ({
      categoryName,
      displayAmount,
    })
  );

  // merge piechart with category to append the color and emoji
  const joinedPieChartData = useMemo(() => {
    return pieChartData.map((expense) => {
      const category = categoriesData.find(
        (category) => category.category === expense.categoryName
      );
      // Ensure a category is found. If not, provide a fallback category
      const fallbackCategory = category
        ? category
        : { category: "Unknown", color: "#000000", emoji: "❓" };
      return { ...expense, ...fallbackCategory };
    });
  }, [pieChartData, categoriesData]);

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={joinedPieChartData}
          cx={200}
          cy={190}
          innerRadius={60}
          outerRadius={80}
          // fill="#8884d8"
          paddingAngle={3}
          dataKey="displayAmount"
          label
        >
          {joinedPieChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>
              {entry.payload.emoji}
              {entry.payload.category}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
