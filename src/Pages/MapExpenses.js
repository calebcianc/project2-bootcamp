import "../App.css";
import Map from "../Components/Map";
import ListExpenses from "../Components/ListExpenses";
import Welcome from "./Welcome";
import { useState, useEffect, useMemo } from "react";
import { realTimeDatabase } from "../firebase";
import { ref, update, remove, off, onValue } from "firebase/database";
import { useLoadScript } from "@react-google-maps/api";
import { Toast } from "react-bootstrap";

const DB_USER_FOLDER_NAME = "user";
const DB_EXPENSES_FOLDER_NAME = "expenses";
// const DB_CATEGORY_FOLDER_NAME = "categories";

export default function MapExpenses({
  isLoggedIn,
  uid,
  userData,
  expensesCategory,
  currenciesList,
  categoriesData,
  groupedExpenses,
  isLoadingExpenses,
  displayCurrency,
  setDisplayCurrency,
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [isHighlighted, setIsHighlighted] = useState(null);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [expenseCounter, setExpenseCounter] = useState(0);

  // not used in current component
  const [mapRef, setMapRef] = useState();

  // Get user's location and assign coordinates to states
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(currentLocation);
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [expenseCounter]);

  // // Group expenses with category by date
  // useEffect(() => {
  //   if (expensesCategory.length > 0) {
  //     const groupedExpenses = {};
  //     expensesCategory.forEach((expense) => {
  //       const date = expense.date;
  //       if (!groupedExpenses[date]) {
  //         groupedExpenses[date] = [];
  //       }
  //       groupedExpenses[date].push(expense);
  //     });
  //     setGroupedExpenses(groupedExpenses);
  //   }
  // }, [expensesCategory]);
  // console.log("Grouped expenses:", groupedExpenses);

  // Fetches displayCurrency from the database and update the client-side state i.e. Database > Client
  useEffect(() => {
    if (userData && userData.displayCurrency) {
      setDisplayCurrency(userData.displayCurrency);
    }
  }, [userData]);
  // console.log("displayCurrency", displayCurrency);

  // Update the displayCurrency in the database whenever there is a change in client-side state i.e., Client > Database
  useEffect(() => {
    if (displayCurrency !== null) {
      const userRef = ref(realTimeDatabase, `${DB_USER_FOLDER_NAME}/${uid}`);
      update(userRef, { displayCurrency: displayCurrency });
    }
  }, [displayCurrency]);

  // For GoogleMap: Create isLoaded variable and assign it the results of useLoadScript + google maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
  });

  // Format numbers to the decimal format i.e., add a comma for every thousand and decimal places if applicable
  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: 2,
  });

  // if expense is 'selected', highlight it. This needs to be used in both map and all expenses
  const handleOnSelect = (expense) => {
    if (isHighlighted === expense.id) {
      setIsHighlighted(null);
    } else {
      setIsHighlighted(expense.id);
      // console.log(highlighted);
    }
  };

  // Deletes the expense in the database; function is passed to ListExpenses component, prefer to keep the function here to use the realtime database imports and ref's
  const handleDeleteExpenses = (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      const expRef = ref(
        realTimeDatabase,
        `${DB_EXPENSES_FOLDER_NAME}/${uid}/${expenseId}`
      );
      remove(expRef)
        .then(() => {
          setShowToast(true);
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
        });
    }
  };

  // console.log("expensesCategory:", expensesCategory[0]["amount"]);

  useEffect(() => {}, [isLoggedIn]);

  return (
    <div>
      {/* Toast to notify user once expense has been successfully deleted */}
      <Toast
        className="center-toast"
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={1500}
        autohide
      >
        <Toast.Header>
          <strong className="mr-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body>Expense deleted successfully!</Toast.Body>
      </Toast>{" "}
      {/* Conditional to render the welcome message if user is not logged in */}
      {isLoggedIn ? (
        <div className="App">
          <Map
            uid={uid}
            expensesCategory={expensesCategory}
            expenseCounter={expenseCounter}
            userLocation={userLocation}
            isLoaded={isLoaded}
            formatter={formatter}
            mapRef={mapRef}
            setMapRef={setMapRef}
            isHighlighted={isHighlighted}
            setIsHighlighted={setIsHighlighted}
            displayCurrency={displayCurrency}
          />
          <ListExpenses
            uid={uid}
            mapRef={mapRef}
            lat={lat}
            setLat={setLat}
            lng={lng}
            setLng={setLng}
            userLocation={userLocation}
            expensesCategory={expensesCategory}
            formatter={formatter}
            isHighlighted={isHighlighted}
            setIsHighlighted={setIsHighlighted}
            handleOnSelect={handleOnSelect}
            // isLoading={isLoading}
            isLoadingExpenses={isLoadingExpenses}
            displayCurrency={displayCurrency}
            setDisplayCurrency={setDisplayCurrency}
            currenciesList={currenciesList}
            handleDeleteExpenses={handleDeleteExpenses}
            groupedExpenses={groupedExpenses}
            categoriesData={categoriesData}
          />
        </div>
      ) : (
        <div className="App">
          <Map
            uid={uid}
            mapRef={mapRef}
            setMapRef={setMapRef}
            isLoaded={isLoaded}
            userLocation={userLocation}
          />
          <Welcome />
        </div>
      )}
    </div>
  );
}
