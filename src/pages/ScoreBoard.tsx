import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/loader";
import { BASE_URL } from "../constants";
import { User } from "../interfaces";

function ScoreBoard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${BASE_URL}/players`);
      setUsers(data.data);
    //   console.log(data)

      setLoading(false);
    } catch (error) {
      toast.error("something went wrong");
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="flex flex-col lg:max-w-xl mx-auto">
      <div>
        <table id="users">
          <tr>
            <td>ID</td>
            <td>Username</td>
            <td>Score</td>
          </tr>
          <tbody>
            {users.map((item) => (
              <tr>
                <td>{item.id}</td>
                <td>{item.username}</td>
                <td>{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default ScoreBoard;
