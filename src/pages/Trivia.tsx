import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useHistory } from "react-router-dom";
import Loader from "../components/loader";
import { BASE_URL } from "../constants";
import { ChallengeType } from "../interfaces";

function Trivia({ match }: any) {
  const { artistId } = match.params;
  const history = useHistory();
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const renderPoint = () => {
    switch (currentChallenge?.attempts) {
      case 0:
        return 5;

      case 1:
        return 3;

      case 2:
        return 1;

      default:
        break;
    }
  };

  const onSubmitAnswer = async (e: any) => {
    try {
      e.preventDefault();
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const { data } = await axios.post(`${BASE_URL}/submit-answer`, {
        challengeId: currentChallenge?.id,
        answer,
        playerId: userId,
      });
      await setupQuiz();
      setLoading(false);
      setAnswer("");
    } catch (error) {
      toast.error("something went wrong");
      console.log(error);
      setLoading(false);
    }
  };

  const onSubmitUsername = async (e: any) => {
    try {
      e.preventDefault();
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const { data } = await axios.post(`${BASE_URL}/update-user`, {
        playerId: userId,
        username,
      });
      setLoading(false);
      setUsername("");
      toast.success("Your username has been successfully updated");
    } catch (error) {
      toast.error("something went wrong");
      console.log(error);
      setLoading(false);
    }
  };

  const onRestart = async () => {
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/restart`, {
        artistId,
      });
      await setupQuiz();
      setLoading(false);
      setAnswer("");
    } catch (error) {
      toast.error("something went wrong");
      console.log(error);
      setLoading(false);
    }
  };

  const setupQuiz = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const { data } = await axios.post(`${BASE_URL}/setup-challenge`, {
        artistId,
        playerId: userId,
      });
      setChallenges(data.challenges);
      let c = [...data.challenges];
      // c = c.sort((s) => s.round);
      // c = c.reverse();
      console.log(c);
      setCurrentChallenge(c.find((item: ChallengeType) => !item.answered)); //select first question not answered
      setLoading(false);
    } catch (error) {
      toast.error("something went wrong");
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    setupQuiz();
  }, []);

  useEffect(() => {
    if (currentChallenge?.attempts == 2) {
      toast.success("Round over");
    }
  }, [currentChallenge]);

  return (
    <div className="flex flex-col lg:max-w-xl mx-auto">
      {currentChallenge ? (
        <div>
          <h3 className="text-center">Guess the artist</h3>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
            <div>
              <p>Round {currentChallenge?.round}</p>
              <div className=" bg-white shadow-lg mt-4">
                <p>{currentChallenge?.albumName}</p>
              </div>
            </div>

            <div>
              <p>For {renderPoint()} points</p>
              <p>Who is the artist? (Enter full name)</p>
              <form onSubmit={onSubmitAnswer} className="flex items-center">
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  type={"text"}
                  className="border px-3 py-2 bg-white border-black"
                />
                <button type="submit" className="px-4 py-2 bg-green-600">
                  Submit
                </button>
              </form>
              {currentChallenge?.attempts == 2 && (
                <div>
                  <p>Hint</p>
                  <img src={currentChallenge?.artworkUrl100} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <form onSubmit={onSubmitUsername} className="flex items-center">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type={"text"}
              placeholder="enter you username"
              className="border px-3 py-2 bg-white border-black"
            />
            <button type="submit" className="px-4 py-2 bg-green-600">
              Submit
            </button>
          </form>
        </div>
      )}

      <div className="mt-4 flex items-center space-4">
        {/* Actions */}
        <button onClick={onRestart} className="px-4 py-2 bg-red-600">
          Restart
        </button>

        <button
          onClick={() => history.push("/scoreboard")}
          className="px-4 py-2 bg-blue-600 ml-5"
        >
          View scoreboard
        </button>
      </div>
      {loading && <Loader />}
      <p>
        Your total score{" "}
        {challenges.reduce((acc, currentOrder) => {
          return acc + currentOrder?.score;
        }, 0)}
      </p>
    </div>
  );
}

export default Trivia;
