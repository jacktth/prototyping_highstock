import Highcharts from 'highcharts/highstock'
const MyStockChart = () => <HighchartsReact
  highcharts={Highcharts}
  constructorType={'stockChart'}
  options={options}
/>
when using constructorType stockChart, import Highcharts from 'highcharts/highstock' is needed 

Targets feature of the chart:
- click the data, then select the desired timeframe to display the particular data point
- click the data, then select save the date of the, after that, user can select the record the replay the desired data