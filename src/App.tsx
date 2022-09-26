import "./App.css";
import { Toaster } from "react-hot-toast";
import {
  Redirect,
  Switch,
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import Artists from "./pages/ArtistList";
import Scoreboard from "./pages/ScoreBoard";
import Trivia from "./pages/Trivia";
import axios from "axios";
import { BASE_URL } from "./constants";
import { useEffect } from "react";
function App() {
  const createUser = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/create-player`, {});
      localStorage.setItem("userId", data.data.id);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      createUser();
    }
  }, []);

  return (
    <div className=" ">
      <Toaster position="top-right" />
      <Router>
        <Switch>
          <Redirect exact from="/" to="/artists" />
          <Route path="/artists" component={Artists} />
          <Route path="/trivia/:artistId" component={Trivia} />
          <Route path="/scoreboard" component={Scoreboard} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
