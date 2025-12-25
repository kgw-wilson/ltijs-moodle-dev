import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "@/Home";
import Launch from "@/Launch";
import { ltiRoutes } from "shared-constants";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path={ltiRoutes.FRONTEND.LAUNCH} element={<Launch />} />
      </Routes>
    </Router>
  );
}
