import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Welcome from "./Pages/Welcome";
import { realTimeDatabase, auth } from "./firebase";
import { ref, onValue, get, set, update } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import AuthForm from "./Pages/AuthForm";
import SignUp from "./Pages/SignUp";
import Profile from "./Pages/Profile";
import Dashboard from "./Pages/Dashboard";
import Error from "./Components/Error";
import MapExpenses from "./Pages/MapExpenses";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import patchQuestionFillSvg from "./Icons/patch-question-fill.svg";
import currencies from "./Components/Currencies";
import ResetPassword from "./Pages/ResetPassword";
import Category from "./Pages/Category";
import { BeatLoader } from "react-spinners";

const DB_USER_FOLDER_NAME = "user";
const DB_EXPENSES_FOLDER_NAME = "expenses";
const DB_CATEGORY_FOLDER_NAME = "categories";
const DB_EXCHANGERATES_FOLDER_NAME = "exchangeRates";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState("");
  const [uid, setUid] = useState("");
  const [profilePhotoURL, setProfilePhotoURL] = useState("");
  const [fileInputFile, setFileInputFile] = useState("");
  const [fileInputValue, setFileInputValue] = useState("");
  const [currenciesList, setCurrenciesList] = useState([]);
  const navigate = useNavigate();
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [expensesCategory, setExpensesCategory] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [displayCurrency, setDisplayCurrency] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const today = new Date().toISOString().substring(0, 10);

  // Fetch the day's exchange rates
  const exchangeRatesApiKey = process.env.REACT_APP_EXCHANGE_API_KEY;
  useEffect(() => {
    async function fetchRatesAndUpdateDB() {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/f251da995575f9ae7cd5d521/latest/USD`
        );
        // Check if response status is ok
        if (!response.ok) {
          console.error(
            "Error fetching exchange rates, status:",
            response.status
          );
          return;
        }

        const data = await response.json();
        // Ensure that data.conversion_rates is an object
        if (
          !data.conversion_rates ||
          typeof data.conversion_rates !== "object"
        ) {
          console.error("conversion_rates is not an object or is undefined.");
          return;
        }

        const dateRef = ref(
          realTimeDatabase,
          `${DB_EXCHANGERATES_FOLDER_NAME}/date`
        );
        const ratesRef = ref(
          realTimeDatabase,
          `${DB_EXCHANGERATES_FOLDER_NAME}/data`
        );

        await update(ratesRef, data.conversion_rates);
        await set(dateRef, today);

        setExchangeRates(data.conversion_rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    }

    // Check date in DB - if date is today, fetch the rates from DB. If date is not today, fetch rates via API and update DB
    const dateRef = ref(realTimeDatabase, `${DB_CATEGORY_FOLDER_NAME}/date`);
    get(dateRef)
      .then((snapshot) => {
        if (snapshot.val() === today) {
          const ratesRef = ref(
            realTimeDatabase,
            `${DB_CATEGORY_FOLDER_NAME}/data`
          );
          get(ratesRef)
            .then((snapshot) => {
              setExchangeRates(snapshot.val());
            })
            .catch((error) => {
              console.error(
                "Error reading exchange rates from database:",
                error
              );
            });
        } else {
          fetchRatesAndUpdateDB();
        }
      })
      .catch((error) => {
        console.error("Error reading date from database:", error);
      });
  }, []);

  // Fetch user data when logged in
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUid(user.uid);

        const userDataRef = ref(
          realTimeDatabase,
          `${DB_USER_FOLDER_NAME}/${uid}`
        );

        get(userDataRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val(); // Retrieve the data of the node
              setUserData(userData);
              setDisplayCurrency(userData.displayCurrency);
              console.log(
                `user Data: ${JSON.stringify(userData)}; displayCurrency: ${
                  userData.displayCurrency
                }`
              );
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
        // set the onValue listener to listen to changes immediately when data is fetched. Should not nest inside get as get only fetches the data once. Even if there are other changes later on, it will not be reflected.
        onValue(userDataRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            // Use UID to find profile url
            if (userData.hasOwnProperty("profileUrl")) {
              setProfilePhotoURL(userData.profileUrl);
            }
          } else {
            console.log("No data available");
          }
        });
      } else {
        setIsLoggedIn(false);
        setUid("");
        setProfilePhotoURL("");
      }
    });
  }, [uid]);

  // Fetches latest category array, triggered with every change to the list of categories
  useEffect(() => {
    setIsLoadingCategories(true);
    const catRef = ref(realTimeDatabase, `${DB_CATEGORY_FOLDER_NAME}/${uid}`);
    const categoryListener = onValue(
      catRef,
      (snapshot) => {
        const catData = snapshot.val();
        if (catData) {
          // console.log(JSON.stringify(catData));
          const catArray = Object.entries(catData).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          // console.log(catArray);
          setCategoriesData((prevCategoriesData) =>
            JSON.stringify(prevCategoriesData) !== JSON.stringify(catArray)
              ? catArray
              : prevCategoriesData
          );
        }
        setIsLoadingCategories(false); // <-- Set isLoadingCategories to false when fetch finishes
      },
      (errorObject) => {
        console.log("The read failed: " + errorObject.name);
        setIsLoadingCategories(false); // <-- Also set isLoadingCategories to false in case of error
      }
    );

    return () => {
      // Remove the listener when the component unmounts
      categoryListener();
    };
  }, [uid]);

  // Fetches latest expenses array, triggered with every change to the list of expenses
  useEffect(() => {
    setIsLoadingExpenses(true); // <-- Set isLoadingExpenses to true when fetch starts

    const expRef = ref(realTimeDatabase, `${DB_EXPENSES_FOLDER_NAME}/${uid}`);
    const expensesListener = onValue(
      expRef,
      (snapshot) => {
        const expensesData = snapshot.val();

        // If the the expenses data has been fetched...
        if (expensesData) {
          // Convert the object of objects into an array of objects
          const expensesArray = Object.entries(expensesData).map(
            ([key, value]) => ({
              id: key,
              ...value,
            })
          );

          console.log(`expensesData: ${JSON.stringify(expensesData)}`);
          console.log(`expensesArray: ${JSON.stringify(expensesArray)}`);

          // Sort expenses array by date, with the latest at the top of the list
          const sortedExpenses = expensesArray.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          // Combine category key-value pairs with expenses key-value pairs AND group the newly created arrays by date
          if (!isLoadingCategories) {
            const joinedExpenses = sortedExpenses.map((expense) => {
              const category = categoriesData.find(
                (category) => category.category === expense.categoryName
              );

              // Ensure a category is found. If not, provide a fallback category
              const fallbackCategory = category
                ? category
                : { category: "Unknown", color: "#000000", emoji: "❓" };

              // Modify the spread sequence so the id from expense is not overwritten.
              // For each expense, get the emoji and color of the identified category, and combine these key-value pairs with the expenses key-value pairs
              return { ...fallbackCategory, ...expense };
            });

            setExpensesCategory(joinedExpenses);
            console.log("joinedExpenses in fetching exp", joinedExpenses);

            // Initialise an empty object to contain objects of dates: [expenses]
            const groupedExpenses = {};
            joinedExpenses.forEach((expense) => {
              const date = expense.date;

              // If the date has not been set as a key yet, create the date:[empty array] pair
              if (!groupedExpenses[date]) {
                groupedExpenses[date] = [];
              }

              // Push the expense to the array belonging to the same date-key
              groupedExpenses[date].push(expense);
            });

            setGroupedExpenses(groupedExpenses);
            console.log("groupedExpenses", groupedExpenses);
          }
        } else {
          setExpensesCategory([]); // Set expensesCategory to an empty array if there are no expenses
        }

        setIsLoadingExpenses(false); // <-- Set isLoadingExpenses to false when fetch is successful
      },
      (error) => {
        console.error(error);
        setIsLoadingExpenses(false); // Also set isLoadingExpenses to false in case of error
      }
    );

    return () => {
      // Remove the listener once the component has been dismounted (unrendered)
      expensesListener();
    };
  }, [uid, isLoadingCategories, categoriesData]);

  // convert currencies from array of objects to array of strings
  useEffect(() => {
    const currencyList = currencies.map((currency) => currency.code);
    setCurrenciesList(currencyList);
  }, []);

  // Update display amounts in the database with every change to the display currency
  useEffect(() => {
    // Fetch expenses data from realtime DB
    const expRef = ref(realTimeDatabase, `${DB_EXPENSES_FOLDER_NAME}/${uid}`);

    if (!isLoadingExpenses) {
      get(expRef).then((snapshot) => {
        const data = snapshot.val();

        // Map through each id in the expenses data and update the indicated keys with new values
        for (let id in data) {
          if (data[id].currency === displayCurrency) {
            data[id].displayAmount = data[id].amount;
            data[id].displayCurrency = displayCurrency;
          } else {
            const rateFrom = exchangeRates[data[id].currency];
            const rateTo = exchangeRates[displayCurrency];
            data[id].displayAmount = (data[id].amount / rateFrom) * rateTo;
            data[id].displayCurrency = displayCurrency;
          }
        }

        // Update the ref with the revised expenses data
        return set(expRef, data);
      });
    }
  }, [displayCurrency]);

  return (
    <>
      <Navbar fixed="top" className="navbar-container">
        <Container>
          <Container className="navbar-container">
            <Navbar.Brand as={Link} to="/mapexpenses">
              <img
                alt="Money Stack Emoji"
                src="https://em-content.zobj.net/thumbs/240/apple/354/dollar-banknote_1f4b5.png"
                width="30"
                height="30"
                className="d-inline-block align-top"
              />{" "}
              Dollar Direction
            </Navbar.Brand>
          </Container>
          <Container className="navbar-main">
            <Nav className="top-nav">
              <Nav.Link as={Link} to="/mapexpenses">
                Expenses
              </Nav.Link>
              {uid ? (
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
              ) : null}
            </Nav>
          </Container>
          <Container className="navbar-profile">
            <Nav>
              <NavDropdown
                title={
                  profilePhotoURL ? (
                    <>
                      <img
                        className="rounded-circle"
                        src={profilePhotoURL}
                        alt="user"
                        width="30"
                        height="30"
                      />{" "}
                      {userData.displayName}
                    </>
                  ) : (
                    <img
                      src={patchQuestionFillSvg}
                      alt=""
                      width="30"
                      height="30"
                    />
                  )
                }
                id="basic-nav-dropdown"
              >
                {isLoggedIn ? (
                  <>
                    <NavDropdown.Item href="/profile">
                      My Account
                    </NavDropdown.Item>
                    <NavDropdown.Item href="/category">
                      My Category
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      onClick={() => {
                        signOut(auth)
                          .then(() => {
                            setProfilePhotoURL("");
                            setUid("");
                            navigate("/mapexpenses");
                          })
                          .catch((error) => {
                            console.error(error);
                          });
                      }}
                    >
                      Log Out
                    </NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item href="/authform">
                      Sign In
                    </NavDropdown.Item>
                    <NavDropdown.Item href="/signup">Sign Up</NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            </Nav>
          </Container>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Welcome isLoggedIn={isLoggedIn} />} />
        <Route
          path="/mapexpenses"
          element={
            <MapExpenses
              isLoggedIn={isLoggedIn}
              uid={uid}
              userData={userData}
              expensesCategory={expensesCategory}
              currenciesList={currenciesList}
              categoriesData={categoriesData}
              isLoadingExpenses={isLoadingExpenses}
              groupedExpenses={groupedExpenses}
              displayCurrency={displayCurrency}
              setDisplayCurrency={setDisplayCurrency}
              exchangeRates={exchangeRates}
            />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile
              userData={userData}
              setUserData={setUserData}
              profilePhotoURL={profilePhotoURL}
              fileInputFile={fileInputFile}
              setFileInputFile={setFileInputFile}
              fileInputValue={fileInputValue}
              setFileInputValue={setFileInputValue}
              uid={uid}
              currenciesList={currenciesList}
              displayCurrency={displayCurrency}
              setDisplayCurrency={setDisplayCurrency}
            />
          }
        />

        <Route
          path="/category"
          element={
            <Category
              uid={uid}
              isLoggedIn={isLoggedIn}
              categoriesData={categoriesData}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            isLoadingCategories ? (
              <div className="temporary-box">
                <BeatLoader color={"#3dd381"} loading={isLoadingCategories} />
              </div>
            ) : (
              <Dashboard
                isLoggedIn={isLoggedIn}
                uid={uid}
                expensesCategory={expensesCategory}
                categoriesData={categoriesData}
              />
            )
          }
        />

        <Route
          path="/signup"
          element={
            <SignUp
              isLoggedIn={isLoggedIn}
              fileInputFile={fileInputFile}
              setFileInputFile={setFileInputFile}
              fileInputValue={fileInputValue}
              setFileInputValue={setFileInputValue}
            />
          }
        />

        <Route
          path="/authform"
          element={<AuthForm isLoggedIn={isLoggedIn} />}
        />

        <Route
          path="/resetpassword"
          element={<ResetPassword isLoggedIn={isLoggedIn} />}
        />

        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
}
