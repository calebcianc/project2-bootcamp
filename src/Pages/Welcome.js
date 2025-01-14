import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { AlignCenter, Justify } from "react-bootstrap-icons";

export default function Welcome({ isLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      {isLoggedIn ? (
        navigate("/mapexpenses")
      ) : (
        <div>
          <h2 style={{ marginBottom: "0" }}>Welcome to </h2>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              alt="DollarDirection"
              src="https://i.imgur.com/6LTVryw.jpg"
              width="40"
              height="40"
              style={{ margin: "0 10px 0 0" }}
            />
            <h1 style={{ marginBottom: "0" }}>
              <b>Dollar Direction!</b>
            </h1>
          </div>
          <br />
          <p>
            Keep track of where you've been and how much you've spent so you
            will never have to ask: <br />
            <b style={{ color: "red" }}>
              <em>"Where'd my money go?!" 💸</em>
            </b>
          </p>{" "}
          <p>
            <Link to="/authform" style={{ color: "var(--main-color)" }}>
              Sign Up / Log In here
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
