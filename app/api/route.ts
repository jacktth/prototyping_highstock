export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get('timeframe')
  const res = await fetch(
    `https://raw.githubusercontent.com/jacktth/sample/main/HK.00700_${timeframe}.txt`,
    {
      
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  //[[1656682200000,136.04,139.04,135.66,138.93,71051600]]
  const data = (await res.text()) as string;

  const rows = data.trim().split('\n');

  // Convert the data into the desired format
  const result = rows.map(row => {
    const [date, time, open, high, low, close, volume] = row.split(',');
    const [year, month, day] = date.split('-');
    const [hour, minute, second] = time.split(':');

    // Convert the date and time to a Unix timestamp (in milliseconds)
    const timestamp = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second))).getTime();
    return [
      timestamp,
      parseFloat(open),
      parseFloat(high),
      parseFloat(low),
      parseFloat(close),
      parseInt(volume)
    ];
  });
  
  return Response.json({result});
}
export interface APIResponse {
  result: number[][];
}

