import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import "./App.less";

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<Boolean>(false);
  const [user, setUser] = useState<Object>({});
  const [loading, setLoading] = useState<Boolean>(true);

  const authenticateUser = async () => {
    await fetch("http://localhost:3001/auth/login/success", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 200) return response.json();
        throw new Error("failed to authenticate the user");
      })
      .then((responseJson) => {
        console.log('success1')
        setAuthenticated(true);
        setUser(responseJson.user);
      })
      .catch((error) => {
        console.log('failure1')
        setAuthenticated(false);
      })
      .finally(() => {
        console.log('should be in both')
        setLoading(false);
      });
  };
console.log(loading);
  useEffect(() => {
    authenticateUser();
  },[]);

 // if (loading) return null;
  return (
    <div className="App">{!authenticated ? <Login /> : <h1> Welcome</h1>}</div>
  );
};

export default App;
