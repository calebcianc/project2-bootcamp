import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Welcome from "./Pages/Welcome";
import { realTimeDatabase, auth } from "./firebase";
import { ref, onValue, get, off } from "firebase/database";
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
              // setDisplayCurrency(userData.displayCurrency);
              console.log(
                `user Data: ${JSON.stringify(userData)}`
                // ; displayCurrency: ${userData.displayCurrency}`
              );

              // use uid to find profile url
              if (userData.hasOwnProperty("profileUrl")) {
                const profilePhotoRef = ref(
                  realTimeDatabase,
                  `${DB_USER_FOLDER_NAME}/${uid}/profileUrl`
                );
                onValue(profilePhotoRef, (snapshot) => {
                  if (snapshot.val() !== null) {
                    setProfilePhotoURL(snapshot.val());
                  }
                });
              }
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        setIsLoggedIn(false);
        setUid("");
        setProfilePhotoURL("");
      }
    });
  }, [uid]);

  // Fetches latest category array, triggered with every change
  useEffect(() => {
    setIsLoadingCategories(true);
    const catRef = ref(realTimeDatabase, `${DB_CATEGORY_FOLDER_NAME}/${uid}`);
    const unsubscribe = onValue(
      catRef,
      (snapshot) => {
        const catData = snapshot.val();
        if (catData) {
          const catArray = Object.entries(catData).map(([key, value]) => ({
            id: key,
            ...value,
          }));
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
      unsubscribe();
    };
  }, [uid]);

  // Fetches latest expenses array, triggered with every change
  useEffect(() => {
    setIsLoadingExpenses(true); // <-- Set isLoadingExpenses to true when fetch starts

    const expRef = ref(realTimeDatabase, `${DB_EXPENSES_FOLDER_NAME}/${uid}`);
    const listener = onValue(
      expRef,
      (snapshot) => {
        const expensesData = snapshot.val();
        if (expensesData) {
          const expensesArray = Object.entries(expensesData).map(
            ([key, value]) => ({
              id: key,
              ...value,
            })
          );
          // Sort expenses by date, with the latest at the top of the list
          const sortedExpenses = expensesArray.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          // Join expenses with categories
          if (!isLoadingCategories) {
            const joinedExpenses = sortedExpenses.map((expense, index) => {
              const category = categoriesData.find(
                (category) => category.category === expense.categoryName
              );
              // Ensure a category is found. If not, provide a fallback category
              const fallbackCategory = category
                ? category
                : { category: "Unknown", color: "#000000", emoji: "❓" };
              // Modify the spread sequence so the id from expense is not overwritten.
              return { ...fallbackCategory, ...expense };
            });

            setExpensesCategory(joinedExpenses);
            console.log("joinedExpenses in fetching exp", joinedExpenses);

            const groupedExpenses = {};
            joinedExpenses.forEach((expense) => {
              const date = expense.date;
              if (!groupedExpenses[date]) {
                groupedExpenses[date] = [];
              }
              groupedExpenses[date].push(expense);
            });
            setGroupedExpenses(groupedExpenses);
            console.log("groupedExpenses", groupedExpenses);
          }
        } else {
          setExpensesCategory([]); // Set expensesCategory to an empty array if there are no expenses
        }
        setIsLoadingExpenses(false);
      },
      (error) => {
        console.error(error);
        setIsLoadingExpenses(false); // Also set isLoadingExpenses to false in case of error
      }
    );

    return () => {
      off(expRef, listener);
    };
  }, [uid, isLoadingCategories, categoriesData, displayCurrency]);

  // convert currencies from array of objects to array of strings
  useEffect(() => {
    const currencyList = currencies.map((currency) => currency.code);
    setCurrenciesList(currencyList);
  }, []);
  // console.log(currenciesList);
  // console.log("app isLoadingExpenses", isLoadingExpenses);
  return (
    <>
      <Navbar bg="light" fixed="top">
        <Container
          style={{
            maxWidth: "1025px",
            paddingLeft: "0",
            paddingRight: "0",
          }}
        >
          <Container>
            <Navbar.Brand href="#home">
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
          <Container className="navbar-home-container">
            <Nav>
              <Nav.Link as={Link} to="/mapexpenses">
                Home
              </Nav.Link>
              {uid ? (
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
              ) : null}
              <NavDropdown
                title={
                  profilePhotoURL ? (
                    <img
                      className="rounded-circle"
                      src={profilePhotoURL}
                      alt="user"
                      width="30"
                      height="30"
                    />
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
                    <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                    <NavDropdown.Item href="/category">
                      Category
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
          element={<Category uid={uid} isLoggedIn={isLoggedIn} />}
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
