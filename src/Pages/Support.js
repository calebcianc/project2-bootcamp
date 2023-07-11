import "../App.css";
import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";

export default function Support() {
  const [openCardIndex, setOpenCardIndex] = useState(null);
  const info = [
    {
      title: "Map Legend",
      markerImages: [
        "https://i.imgur.com/ovmoJoo.png",
        "https://i.imgur.com/QSmFBIk.png",
        "https://i.imgur.com/DGO3ZQK.png",
        "https://i.imgur.com/6nLIyt6.png",
      ],
      info: [
        "This represent expenses below 10",
        "This represent expenses below 100",
        "This represent expenses below 1000",
        "This represent expenses above 1000",
      ],
    },
    {
      title: "Currencies",
      info: `Displayed currencies can be changed at:
    <br/>
    <ul>
      <li>Expenses page. Click on the total amount</li>
      <li>My Account page. Click on update profile</li>
    </ul>
    
    <br/>
    Click <a href="https://knowledgecenter.zuora.com/Quick_References/Country%2C_State%2C_and_Province_Codes/D_Currencies_and_Their_3-Letter_Codes" target="_blank" >here</a> for list of all the three-letter country codes`,
    },
    {
      title: "How to extract expenses",
      info: `You can extract expenses into an excel file. <br/><br/>Here's how you can do it:
          <ul>
            <li>Go to Expenses page</li>
            <li>Find the 📤 icon located next to the total expenses amount. </li>
            <li>Click once to start your selection of expenses.</li>
            <li>After selecting the required expenses, click the 📤 icon again to download the expenses.</li>
          </ul>`,
    },
    {
      title: "How to filter expenses",
      info: `You can filter for expenses in Expenses page. <br/><br/>Here's how you can do it:
          <ul>
            <li>Go to Expenses page</li>
            <li>Find the 🗄 icon located next to the total expenses amount. </li>
            <li>Click to show popup.</li>
            <li>Select filters by date/categories/min amount/max amount</li>
          </ul>`,
    },
  ];

  const toggleCollapse = (index) => {
    if (openCardIndex === index) {
      setOpenCardIndex(null); // if it's already open, close it
    } else {
      setOpenCardIndex(index); // otherwise, open this one
    }
  };

  return (
    <div className="support-container">
      <h1>Support and FAQs</h1>
      {info.map((item, index) => (
        <Card onClick={() => toggleCollapse(index)}>
          <Card.Header style={{ display: "flex", alignItems: "center" }}>
            {item.title}
          </Card.Header>
          <Collapse in={openCardIndex === index}>
            <div id="card-content">
              <Card.Body>
                {Array.isArray(item.info) ? (
                  item.info.map((desc, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <img
                        src={item.markerImages[i]}
                        alt="Map Marker Images"
                        style={{ width: "50px" }}
                      />

                      <p dangerouslySetInnerHTML={{ __html: desc }}></p>
                    </div>
                  ))
                ) : (
                  <p dangerouslySetInnerHTML={{ __html: item.info }}></p>
                )}
              </Card.Body>
            </div>
          </Collapse>
        </Card>
      ))}
    </div>
  );
}
