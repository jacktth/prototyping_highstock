"use client";

import Highcharts from "highcharts/highstock";
import HighchartsReact, {
  HighchartsReactRefObject,
} from "highcharts-react-official";
import HighchartsExporting from "highcharts/modules/exporting";
import { useEffect, useRef, useState } from "react";
import { APIResponse } from "./api/route";
import Chart from "./chart";
if (typeof Highcharts === "object") {
  HighchartsExporting(Highcharts);
}

export default function Home() {
  const [data, setData] = useState<number[][] | null>(null);
  const [date, setDate] = useState<number>(0);
  const [timeframe, setTimeframe] = useState<string>("daily");
  const [savedDataPoints, setSavedDataPoints] = useState<number[]>([]);
  const [dataPointForChecking, setDataPointForChecking] = useState<number|null>(null);

  const updateData = (timeframe: string) => {
    fetch(`/api?timeframe=${timeframe}`, {
      headers: {
        "Content-Type": "application/json",
        method: "GET",
      },
    })
      .then((res) => {
        if (res.ok) {
          setTimeframe(timeframe);
          return res.json() as Promise<APIResponse>;
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        setData(data.result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const saveDatapoint = () => {
    savedDataPoints.some((time) => time === date)
      ? null
      : setSavedDataPoints([...savedDataPoints, date]);
  };
  const checkDataPoint = (pt: number) => {
    setDataPointForChecking(pt);
  };
  useEffect(() => {
    fetch("/api?timeframe=day", {
      headers: {
        "Content-Type": "application/json",
        method: "GET",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json() as Promise<APIResponse>;
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        setData(data.result);
        setDate(data.result[data.result.length - 1][0]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return data ? (
    <div>
      <Chart data={data} setDate={setDate} date={date} timeframe={timeframe} dataPointForChecking={dataPointForChecking} />
      <button onClick={() => updateData("day")}>Daily</button>
      <button onClick={() => updateData("week")}>Week</button>
      <button onClick={() => updateData("30M")}>30Min</button>
      <button onClick={saveDatapoint}>Save</button>
      <br />
      <div>
        {savedDataPoints.map((pt, i) => (
          <button
            key={i}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mb-2"
            onClick={() => checkDataPoint(pt)}
          >
            {getDateFromUnixTimestamp(pt)}
          </button>
        ))}
      </div>
      <div>{getDateFromUnixTimestamp(date)}</div>
    </div>
  ) : null;
}

function getDateFromUnixTimestamp(unixTimestamp: number): string {
  const date = new Date(unixTimestamp);
  const [year, month, day] = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ];
  return `${year}-${month}-${day}`;
}
