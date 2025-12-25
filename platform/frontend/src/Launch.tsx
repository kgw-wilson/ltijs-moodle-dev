import { useState, useEffect } from "react";
import { ltiRoutes } from "shared-constants";
import { LaunchInfo } from "shared-models";

export default function Launch() {
  const [info, setInfo] = useState<LaunchInfo | null>(null);

  const errorPrompt = async (message: string): Promise<void> => {
    console.error(message);
  };

  const getLtik = (): string => {
    const searchParams = new URLSearchParams(window.location.search);
    const ltik = searchParams.get("ltik");
    if (!ltik) throw new Error("Missing LTI key.");
    return ltik;
  };

  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await fetch(ltiRoutes.API.INFO_FULL, {
          headers: {
            Authorization: "Bearer " + getLtik(),
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const launchInfo: LaunchInfo = await res.json();
        console.log("Launch Info:", launchInfo);
        setInfo(launchInfo);
      } catch (err) {
        console.error(err);
        errorPrompt("Failed trying to retrieve custom parameters! " + err);
      }
    };

    getInfo();
  }, []);

  return (
    <div>
      <p>Welcome to the LTI-launched React app!</p>
      {info ? (
        <>
          <p>The following token and context info is available to this app:</p>
          <pre>{JSON.stringify(info, null, 2)}</pre>
        </>
      ) : (
        <p>Oops, no info available to show!</p>
      )}
    </div>
  );
}
