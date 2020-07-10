import React from "react";
import Chart from "react-google-charts";
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";

class PieChart extends React.Component {

    render() {
return (
    <div>
        {
            this.props.gChart && this.props.gChart[0] &&
            <Chart
                width={'500px'}
                height={'500px'}
                chartType="PieChart"
                loader={<div>Loading Chart</div>}
                data={
                    this.props.gChart
                }
                options={{
                    backgroundColor: "#6c757d",
                    title: this.props.title,
                    // Just add this option
                    is3D: true,
                    chartArea: { width: '90%', height: '70%' }
                }}
            />

        }
    </div>

    )

    }
}

export default PieChart

