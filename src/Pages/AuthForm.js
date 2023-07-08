import "../App.css";
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import GoogleButton from "../Components/SignInWithGoogleButton";

export default function AuthForm({ isLoggedIn, username }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const mainColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--main-green")
    .trim();

  const signIn = async () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        navigate("/mapexpenses");
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === "auth/user-not-found") {
          alert("Oops! Invalid email address. ");
        } else if (errorCode === "auth/wrong-password") {
          alert("Oops! Invalid password.");
        }
      });
  };

  return (
    <>
      <Container
        className="d-flex flex-column align-items-center justify-content-center "
        style={{ height: "100vh" }}
      >
        {isLoggedIn ? (
          <div style={{ textAlign: "center" }}>
            <h1>Welcome </h1>
            <h5>Click on the top navigator to start posting!</h5>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: "left" }}>
              <h1>Sign In</h1>
            </div>
            <Row>
              <Col>
                <Form>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Enter your email address
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder=""
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Enter the password that accompanies your email address
                    </Form.Text>
                  </Form.Group>

                  <Button
                    onClick={signIn}
                    style={{ width: "40%" }}
                    className="add-button"
                  >
                    Sign In
                  </Button>
                  <br />

                  <GoogleButton />

                  <div className="text-left" style={{ marginTop: "5px" }}>
                    <Link to="/signUp" style={{ color: mainColor }}>
                      Don't have an account? Create one here!
                    </Link>
                    <br />
                    <Link to="/resetpassword" style={{ color: mainColor }}>
                      Forgot your password?{" "}
                    </Link>
                  </div>
                </Form>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </>
  );
}
