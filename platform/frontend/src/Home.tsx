import React from "react";
import { Link } from "react-router-dom";
import { ltiRoutes } from "shared-constants";

export default function Home() {
  return (
    <div>
      <h1>Welcome to the Vite App</h1>
      <p>This is a basic homepage.</p>
      <Link to={ltiRoutes.FRONTEND.LAUNCH}>Go to Launch</Link>
    </div>
  );
}
