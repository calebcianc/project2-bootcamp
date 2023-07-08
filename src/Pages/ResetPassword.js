import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Form, Button, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../App.css";

export default function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setResetSent(true);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="reset-container">
      <h1>Password Reset</h1>
      <div>
        {resetSent ? (
          <p>A password reset link has been sent to your email address.</p>
        ) : (
          <div>
            <Form onSubmit={handleResetPassword}>
              <InputGroup
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                />
                <Button
                  type="submit"
                  id="button-addon2"
                  className="reset-pw-button"
                >
                  Reset Password
                </Button>
              </InputGroup>
              {error && <p>{error}</p>}
            </Form>
          </div>
        )}
        <div className="text-center" style={{ marginTop: "5px" }}>
          <Link to="/authform" style={{ color: "#deb887" }}>
            Remembered your password? Sign In here!
          </Link>
        </div>
      </div>
    </div>
  );
}
