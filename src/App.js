import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Search from "./search";
import Login from "./login";
import ProtectedRoute from "./route";
import AlgorithmVideos from "./Algorithm";
import Deep from "./dl";
import Db from "./db";
import P from "./programmingLanguages";
import VideoDetail from './components/VideoDetail';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/home" element={<Search />} />
          <Route path="/" element={<Login />} />
          <Route path="/PrRou" element={<ProtectedRoute />} />
          <Route path="/alg" element={<AlgorithmVideos />} />
          <Route path="/dl" element={<Deep />} />
          <Route path="/db" element={<Db />} />
          <Route path="/p" element={<P />} />
          <Route path="/videos/:videoId" element={<VideoDetail />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
