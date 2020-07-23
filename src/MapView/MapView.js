import React from "react";
import "../Dashboard/dashboard.css"
import { Button } from '@material-ui/core';
import Icon from "@material-ui/core/Icon";
import Select from 'react-select'
import {WorldMap} from "./WorldMap";


class MapView extends React.Component {


    componentDidMount = async () => {
        this.loadAirports()
        await this.loadDate()

        this.setState({
            endDate : [...this.state.endDate,{
                value : this.state.date[this.state.date.length-1].value,
                label: this.month[this.state.date[this.state.date.length-1].value] + ", " + this.state.date[this.state.date.length-1].year,
            }]
        })
    }

    componentDidUpdate= async (prevProps, prevState, snapshot) => {
        if(prevState.end !== this.state.end || prevState.start !== this.state.start || prevState.endDate !== this.state.endDate) {
            if(parseInt(this.state.end) < parseInt(this.state.start)) {
                await this.setState({
                    end : this.state.start,
                    endLabel: this.state.startLabel
                })
            }
        }
    }

    changeOrigin = (selectedItem) => {
        this.setState({
            origin: selectedItem.value
        });
    }

    changeDestination = (selectedItem) => {
        this.setState({
            destination: selectedItem.value
        });
    }

    changeStartDate = (selectedItem) => {
        this.setState({
            start: selectedItem.value,
            startLabel: selectedItem.label
        });
    }

    changeEndDate = (selectedItem) => {
        this.setState({
            end: selectedItem.value,
            endLabel: selectedItem.label
        });
    }

    state = {
        origin : 'All',
        destination : 'All',
        start : '',
        end : '',
        startLabel: '',
        endLabel: '',
        date: [],
        gChart1  : '',
        gChart2  : '',
        gChart3  : '',
        gChart4  : '',
        showBar: false,
        showPie: false,
        showArea: false,
        showVerBar: false,
        result: {status: '', value: {heads: {vars: []}, results: {bindings: []}}, h: [], v: [], err: '', xmlOutput: ''},
        endDate: [],
        titleOfGraph1: '',
        titleOfGraph2: '',
        titleOfGraph3: '',
        titleOfGraph4: '',
        airports: [{value:'All', label:'All'}]
    }

    month = {
        1 : 'Jan',
        2 : 'Feb',
        3 : 'Mar',
        4 : 'Apr',
        5 : 'May',
        6 : 'Jun',
        7 : 'Jul',
        8 : 'Aug',
        9 : 'Sep',
        10 : 'Oct',
        11 : 'Nov',
        12 : 'Dec',
    }

    loadAirports = async () => {
        const f1 = new URLSearchParams()
        let query = 'PREFIX : <https://ontologies.semanticarts.com/raw_data#> \n' +
            'PREFIX fl: <https://ontologies.semanticarts.com/flights/> \n' +
            'PREFIX owl: <http://www.w3.org/2002/07/owl#> \n' +
            'PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>\n' +
            'SELECT DISTINCT\n' +
            ' ?airport_code ?airport_city ?lat ?lng # ?airport_country\n' +
            'FROM <airline_flight_network>\n' +
            'WHERE {\n' +
            ' [ a fl:Airport ;\n' +
            '  fl:terminalCode ?airport_code ;\n' +
            '  :lat ?lat ;\n' +
            '  :long ?lng ;\t\n' +
            '  fl:locatedIn [ a fl:City;\n' +
            '   skos:prefLabel ?airport_city;\n' +
            '   fl:locatedIn [ a fl:Country;\n' +
            '    skos:prefLabel ?airport_country\n' +
            '   ]\n' +
            '  ]\n' +
            ' ]\n' +
            ' filter(?airport_country = "United States")\n' +
            ' filter(strlen(?airport_code) = 3)\n' +
            '}\n' +
            'ORDER BY\n' +
            ' ?airport_city\n' +
            ' ?airport_code\n'
        await f1.append('query', query)
        await f1.append('output', 'json')
        await fetch(`http://localhost:7070/sparql`, {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: f1
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    let c = await response.json()
                    console.log("AANew",c)
                    let datas = c.results.bindings
                    for(let i=0; i<datas.length;i++) {
                        let curr = datas[i].airport_code.value
                        await this.setState({
                            airports: [...this.state.airports, {
                                value: curr,
                                label: curr + " - " + datas[i].airport_city.value
                            }],
                        })
                    }
                }
            })
    }

    loadDate = async () => {
        const f1 = new URLSearchParams()
        let query = 'PREFIX fl: <https://ontologies.semanticarts.com/flights/>\n' +
            'PREFIX : <https://ontologies.semanticarts.com/raw_data#>\n' +
            'SELECT \n' +
            '  (MIN(?year) as ?minyy) (MIN(?month) as ?minmm) (MIN(?day) as ?mindd)\n' +
            '  (MAX(?year) as ?maxyy) (MAX(?month) as ?maxmm) (MAX(?day) as ?maxdd)\n' +
            'FROM <airline_flight_network>\n' +
            'WHERE {\n' +
            ' [ a fl:Flight ;\n' +
            '   :year ?year ;\n' +
            '   :month ?month ;\n' +
            '   :day ?day\n' +
            ' ]\n' +
            '}'
        await f1.append('query', query)
        await f1.append('output', 'json')
        await fetch(`http://localhost:7070/sparql`, {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: f1
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    let c = await response.json()
                    // console.log("Date",c)
                    let data = c.results.bindings[0]

                    let maxmm = parseInt(data.maxmm.value)
                    let minmm = parseInt(data.minmm.value)
                    let maxyy = parseInt(data.maxyy.value)
                    let minyy = parseInt(data.minyy.value)
                    // console.log("Date", minmm," ",minyy," ",maxmm," ",maxyy)




                    if(minyy !== maxyy) {
                        for(let j = minmm; j <= 12; j++) {
                            await this.setState({
                                date: [...this.state.date, {
                                    month: j,
                                    year: minyy,
                                    label: this.month[j] + ", " + minyy,
                                    value: j
                                }]
                            })
                        }

                        for(let j = 1; j <= maxmm; j++) {
                            await this.setState({
                                date: [...this.state.date, {
                                    month: j,
                                    year: maxyy,
                                    label: this.month[j] + ", " + maxyy,
                                    value: j
                                }]
                            })
                        }
                        for(let i=minyy+1; i<=maxyy-1;i++) {
                            for(let j=1;j<=12;j++) {
                                await this.setState({
                                    date: [...this.state.date, {
                                        month: j,
                                        year: i,
                                        label: this.month[j] + ", " + i,
                                        value: j
                                    }]
                                })
                            }
                        }
                    } else {
                        for(let j = minmm; j <= maxmm; j++) {
                            await this.setState({
                                date: [...this.state.date, {
                                    month: j,
                                    year: maxyy,
                                    label: this.month[j] + ", " + maxyy,
                                    value: j
                                }]
                            })
                        }
                    }
                }
            }).then(async () => {
                await this.setState({
                    start: this.state.date[0].month,
                    end: this.state.date[this.state.date.length-1].month,
                    startLabel: this.state.date[0].label,
                    endLabel: this.state.date[this.state.date.length-1].label
                })
            })
    }



    render() {
        return (
            <div>

                <div className={"container-fluid bg-secondary"}>
                    <div className="row align-items-start">
                        <div className="col-sm-3 bg-dark">


                            <ul className="list-group wbdv-module-list">

                                    <span className="list-group-item bg-info wbdv-module-item">

                                        <span className="wbdv-module-item-title text-dark">Origin</span>

                                        <Select
                                            defaultValue={this.state.airports[0]}
                                            options={this.state.airports}
                                            onChange={this.changeOrigin}
                                        />

                                        {/*<input type="text" className="input-flight"*/}
                                        {/*       onChange={async (e) =>*/}
                                        {/*           await this.setState({*/}
                                        {/*               origin: e.target.value*/}
                                        {/*           })*/}
                                        {/*       }*/}

                                        {/*       value={this.state.origin}*/}
                                        {/*/>*/}
                                    </span>

                                <span className="list-group-item bg-info wbdv-module-item">
                                        <span className="wbdv-module-item-title text-dark">Destination</span>

                                        <Select
                                            defaultValue={this.state.airports[0]}
                                            options={this.state.airports}
                                            onChange={this.changeDestination}
                                        />
                                    {/*<input type="text" className="input-flight"*/}
                                    {/*       onChange={async (e) =>*/}
                                    {/*           await this.setState({*/}
                                    {/*               destination: e.target.value*/}
                                    {/*           })*/}
                                    {/*       }*/}

                                    {/*       value={this.state.destination}*/}
                                    {/*/>*/}
                                    </span>

                                <span className="list-group-item bg-info wbdv-module-item">
                                        <span className="wbdv-module-item-title text-dark">Start Date</span>

                                    {  this.state.date.length > 0 &&
                                    <Select
                                        defaultValue={this.state.date[0]}
                                        options={this.state.date}
                                        onChange={this.changeStartDate}
                                    />
                                    }
                                    </span>

                                <span className="list-group-item bg-info wbdv-module-item">
                                        <span className="wbdv-module-item-title text-dark">End Date</span>

                                    { this.state.date.length > 0 && this.state.endDate.length > 0 &&
                                    <Select
                                        defaultValue={this.state.endDate[0]}
                                        options={this.state.date}
                                        onChange={this.changeEndDate}
                                    />
                                    }

                                    </span>

                                <div className="wbdv-module-item">
                                    <div className="d-flex justify-content-center">
                                        <Button variant="contained" size="large" endIcon={<Icon>send</Icon>}
                                                onClick = {  () => {
                                                }
                                                }
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </div>

                            </ul>


                        </div>
                        <div className="col-sm-9">
                           <WorldMap/>
                        </div>
                    </div>

                </div>


            </div>

        )
    }
}

export default MapView

