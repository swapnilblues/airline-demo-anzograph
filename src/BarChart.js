import React from "react";
import Chart from "react-google-charts";
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";

class BarChart extends React.Component {

render() {
return (
    <div>
        {
            this.props.gChart && this.props.gChart[0] &&
            <Chart
                width={'720px'}
                height={'500px'}
                chartType="BarChart"
                loader={<div>Loading Chart</div>}
                data={
                    this.props.gChart
                }

                options={{
                    backgroundColor: "#6c757d",
                    title: this.props.title,
                    hAxis: {
                        minValue: 0,
                    }
                }}
                // For tests
                rootProps={{ 'data-testid': '2' }}
            />
        }
    </div>

    )

    }
}

export default BarChart

