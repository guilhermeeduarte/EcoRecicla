import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./styles/app.css";
import {useEffect} from "react";

export default function Root() {

  useEffect(() => {
    const daltonicoMode = typeof window !== "undefined" && localStorage.getItem("daltonicMode")==="true";
      if(daltonicoMode){''
        document.body.classList.add("daltonic-mode");
      }else{
        document.body.classList.remove("daltonic-mode");
      }

  },[]);

  return (
    <html lang="pt-br">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
                <title>EcoRecicla</title>

        <link rel= "preconnect" href= "https://fonts.googleapis.com" />
        <link rel= "preconnect" href="https://fonts.gstatic.com" crossOrigin= ""/>
        <link rel = "stylesheet" href = "https://fonts.googleapis.com/css2?family=Inter:wght400;500;600&family=Sora:wght@400;600;700;800&display=swap" />

      </head>
      <body>
        <div className="app-wrapper">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  
    
  );}


