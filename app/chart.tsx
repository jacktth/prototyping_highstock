"use client";
import Highcharts from "highcharts/highstock";
import HighchartsReact, {
  HighchartsReactRefObject,
} from "highcharts-react-official";
import HighchartsExporting from "highcharts/modules/exporting";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
if (typeof Highcharts === "object") {
  HighchartsExporting(Highcharts);
}

export default function Chart({
  data,
  setDate,
  date,
  dataPointForChecking,
  timeframe,
}: {
  data: number[][];
  date: number;
  timeframe: string;
  dataPointForChecking: number | null;
  setDate: Dispatch<SetStateAction<number>>;
}) {
  const chartComponent = useRef<HighchartsReactRefObject | null>(null);
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
    title: {
      text: "My chart",
    },

    series: [
      {
        allowPointSelect: true,
        cursor: "pointer",
        type: "candlestick",
        data: data,
        events: {
          click: (e) => {
            setDate(e.point.x);
          },
        },
      },
    ],
  });
  useEffect(() => {
    if (chartOptions.series)
      if (chartOptions.series[0])
        setChartOptions({
          ...chartOptions,
          series: [
            {
              ...chartOptions.series[0],
              //@ts-ignore
              data: data,
            },
          ],
          xAxis: {
            //affect the display of the minimum data point
            min: data[0][0],
          },
        });
    setExtremesForChart(date, data, chartComponent, timeframe);
  }, [data]);
  useEffect(() => {
    if (dataPointForChecking) {
      setExtremesForChart(dataPointForChecking, data, chartComponent, timeframe);
    } else {
      return;
    }
  }, [dataPointForChecking]);
  return (
    <div>
      <HighchartsReact
        ref={chartComponent}
        highcharts={Highcharts}
        constructorType={"stockChart"}
        options={chartOptions}
      />
    </div>
  );
}

function findClosestDateIndex(
  data: number[][],
  timestamp: number
): number | null {
  const targetMonth = new Date(timestamp).getMonth();
  const targetDay = new Date(timestamp).getDate();
  const targetYear = new Date(timestamp).getDate();
  let cacheIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const [t] = data[i];
    const currentMonth = new Date(t).getMonth();
    const currentDay = new Date(t).getDate();
    const currentYear = new Date(t).getDate();
    const diff = t - timestamp;
    console.log(diff, i, data.length);

    if (
      currentYear === targetYear &&
      currentMonth === targetMonth &&
      currentDay === targetDay
    ) {
      //for dealing with intraday data
      cacheIndex = i;
    } else if (diff >= 0 && i > 0) {
      //in case the looped time just exceed the selected time, return cacheIndex for last time
      return i - 1;
    } else if (data.length - 1 === i && diff < 0) {
      // exceed the limit of timeframe date, return the lastest date
      return i;
    } else if (diff > 0 && i === 0) {
      // lower than the first array of the timeframe date, return the first index
      return cacheIndex;
    }
  }
  console.log("return last index");

  return cacheIndex;
}

function setExtremesForChart(
  date: number,
  data: number[][],
  chartComponent: MutableRefObject<HighchartsReactRefObject | null>,
  timeframe: string
) {
  if (chartComponent.current !== null) {
    const chart = chartComponent.current.chart;
    const closestIndex = findClosestDateIndex(data, date);

    if (closestIndex === null) {
      chart.xAxis[0].setExtremes(0, date);
      console.log("error check tje closet index");
    } else if (closestIndex - 100 >= 0) {
      //can display the past 100 data point
      chart.xAxis[0].setExtremes(
        data[closestIndex - 100][0],
        data[closestIndex][0]
      );
      console.log("display the normal number of data points");
    } else {
      //can not display the past 100 data point

      if (closestIndex === 0 || closestIndex === data.length - 1) {
        //
        chart.xAxis[0].setExtremes(data[0][0], data[closestIndex][0]);
        console.log(
          "display the minimum number of data points wile selected date is extreme in the selected timeframe of dataset"
        );
      } else if (closestIndex > 0) {
        if (timeframe === "30M") {
          //+1 is to display the correct number of data point for intrday data
          chart.xAxis[0].setExtremes(data[0][0], data[closestIndex + 1][0]);
        } else {
          chart.xAxis[0].setExtremes(data[0][0], data[closestIndex][0]);
        }

        console.log("display the minimum number of data points");
      }
    }
  }
}
