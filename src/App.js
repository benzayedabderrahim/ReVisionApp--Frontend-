import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VideoList from "./search";
import Login from "./login";
import ProtectedRoute from "./route";
import AlgorithmVideos from "./Algorithm";
import Deep from "./dl";
import Db from "./db";
import P from "./programmingLanguages";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/home" element={<VideoList />} />
          <Route path="/" element={<Login />} />
          <Route path="/PrRou" element={<ProtectedRoute />} />
          <Route path="/alg" element={<AlgorithmVideos />} />
          <Route path="/dl" element={<Deep />} />
          <Route path="/db" element={<Db />} />
          <Route path="/p" element={<P />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
