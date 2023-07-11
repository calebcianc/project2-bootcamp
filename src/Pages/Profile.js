// File to contain 'Profile' items like edit and update name, profile picture, email address, bio, etc
import "../App.css";
import patchQuestionFillSvg from "../Icons/patch-question-fill.svg";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { realTimeDatabase, storage } from "../firebase";
import { ref, get, set, update, onValue } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { Link } from "react-router-dom";

const DB_USER_FOLDER_NAME = "user";
const STORAGE_PROFILE_FOLDER_NAME = "profilePhoto";

export default function Profile({
  // userData,
  // setUserData,
  profilePhotoURL,
  fileInputFile,
  setFileInputFile,
  fileInputValue,
  setFileInputValue,
  uid,
  currenciesList,
  displayCurrency,
  setDisplayCurrency,
}) {
  const [userData, setUserData] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch and listen to user data when uid changes
  useEffect(() => {
    if (uid) {
      const userDataRef = ref(
        realTimeDatabase,
        `${DB_USER_FOLDER_NAME}/${uid}`
      );
      const unsubscribe = onValue(
        userDataRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData(data);
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setDisplayName(data.displayName);
            setEmail(data.email);
            setDisplayCurrency(data.displayCurrency);
          } else {
            console.log("No data available");
          }
        },
        console.error
      );

      return () => unsubscribe(); // Clean up listener
    }
  }, [uid]); // Add uid to the dependency array

  // states to handle open and close of update picture modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // states to handle open and close of update profile modal
  const [show2, setShow2] = useState(false);
  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  // function to upload new profile picture on click
  const handleUpload = () => {
    // checks if a file was input / selected
    if (fileInputFile) {
      // Store images in an images folder in Firebase Storage
      const fileRef = storageRef(
        storage,
        ` ${STORAGE_PROFILE_FOLDER_NAME}/${uid}/${fileInputFile.name}`
      );

      uploadBytes(fileRef, fileInputFile).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((profileUrl) => {
          // update user db with profile photo url
          const currUserRef = ref(
            realTimeDatabase,
            `${DB_USER_FOLDER_NAME}/${uid}/profileUrl`
          );
          set(currUserRef, profileUrl);
        });
      });
    } else {
      // if no file was input, set the value of the profileUrl to null
      const currUserRef = ref(
        realTimeDatabase,
        `${DB_USER_FOLDER_NAME}/${uid}/profileUrl`
      );
      set(currUserRef, null);
    }
    // closes the modal
    handleClose();
  };

  // function to allow user to update details of profile e.g., display name
  const handleUpdate = () => {
    const userRef = ref(realTimeDatabase, `${DB_USER_FOLDER_NAME}/${uid}`);
    update(userRef, {
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      displayCurrency: displayCurrency,
    });

    // closes the modal
    handleClose2();
    // setCounter(counter + 1);
    setDisplayName(displayName);
    setFirstName(firstName);
    setLastName(lastName);
    setDisplayCurrency(displayCurrency);
  };

  return (
    <div>
      {" "}
      <div className="profile-container">
        <div>
          <h1>My Account</h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            {profilePhotoURL ? (
              <div>
                <img
                  src={profilePhotoURL}
                  alt="user"
                  className="profile-picture"
                />
                <br /> <br />
              </div>
            ) : (
              <>
                <img
                  src={patchQuestionFillSvg}
                  alt="user"
                  className="profile-picture"
                />
              </>
            )}
            <Button onClick={handleShow} className="add-button">
              Update picture
            </Button>
          </div>

          <p>
            Display Name: {userData.displayName} <br />
            First Name: {userData.firstName}
            <br />
            Last Name:{userData.lastName}
            <br />
            Email: {userData.email}
            <br />
            Display Currency:{displayCurrency}
            <br />
          </p>

          {/* {userInfo} */}
          <br />
          <div style={{ display: "flex" }}>
            <Button
              onClick={handleShow2}
              style={{ marginRight: "10px" }}
              className="add-button "
            >
              Update profile
            </Button>
            <Button className="close-button">
              <Link to="/resetpassword" style={{ color: "white" }}>
                Reset password
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div>
        {/* Modal for user to upload new profile picture */}
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Update Picture</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Control
                type="file"
                value={fileInputValue}
                onChange={(e) => {
                  setFileInputFile(e.target.files[0]);
                  setFileInputValue(e.target.value);
                }}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={handleClose} className="close-button">
              Close
            </Button>
            <Button onClick={handleUpload} className="add-button">
              Upload
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal for user to update profile  */}
        <Modal show={show2} onHide={handleClose2}>
          <Modal.Header closeButton>
            <Modal.Title>Update Profile</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Row>
                <Col>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={firstName}
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    required
                  />
                </Col>
                <Col>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={lastName}
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    required
                  />
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Row>
                <Col>
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={displayName}
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                    }}
                    required
                  />
                </Col>
                <Col>
                  {" "}
                  <Form.Label>Display Currency</Form.Label>
                  <Typeahead
                    id="currency-typeahead"
                    labelKey="currency"
                    placeholder={displayCurrency}
                    onChange={(selected) => setDisplayCurrency(selected[0])}
                    options={currenciesList}
                  ></Typeahead>
                </Col>
              </Row>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={handleClose2} className="close-button">
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              className="add-button"
            >
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
