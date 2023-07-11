import { useEffect } from "react";
import jwt_decode from "jwt-decode";
import { auth, realTimeDatabase } from "../firebase";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { ref, set, push, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import categoriesData from "../Reference/categories.json";

const DB_USER_FOLDER_NAME = "user";
const DB_CATEGORY_FOLDER_NAME = "categories";

export default function GoogleButton() {
  // const [user, setUser] = useState({});
  const navigate = useNavigate();

  function handleCallbackResponse(response) {
    const credential = GoogleAuthProvider.credential(response.credential);

    signInWithCredential(auth, credential)
      .then((userCredential) => {
        const userObject = jwt_decode(response.credential);
        const userRef = ref(
          realTimeDatabase,
          `${DB_USER_FOLDER_NAME}/${userCredential.user.uid}`
        );
        get(userRef).then((snapshot) => {
          if (!snapshot.exists()) {
            set(userRef, {
              firstName: userObject.given_name,
              lastName: userObject.family_name,
              UID: userCredential.user.uid,
              email: userObject.email,
              displayName: userObject.name,
              profileUrl: userObject.picture,
              displayCurrency: "SGD",
            });

            const catRef = ref(
              realTimeDatabase,
              `${DB_CATEGORY_FOLDER_NAME}/${userCredential.user.uid}`
            );
            categoriesData.forEach((category) => {
              push(catRef, category)
                .then(() => {
                  console.log("Category saved successfully.");
                })
                .catch((error) => {
                  console.error("Error saving category: ", error);
                });
            });
          } else {
            console.log("User data already exists");
          }
        });

        navigate("/mapexpenses");
      })
      .catch((error) => {
        console.error("Error signing in to Firebase:", error);
      });
  }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id:
        "695375358500-4p002o3a01v4qfkvkjguk5ds4n2p1snt.apps.googleusercontent.com",
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(document.getElementById("signInDiv"), {
      theme: "outline",
      size: "large",
    });
  }, []);

  return (
    <div>
      <br />
      <h4>Or sign in/up with Google:</h4>
      <div id="signInDiv"></div>
      <br />
    </div>
  );
}
