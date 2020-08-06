import React from "react";
import "../Dashboard/dashboard.css"
import { Button } from '@material-ui/core';
import Icon from "@material-ui/core/Icon";
import Select from 'react-select'
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Autocomplete from  'react-autocomplete';
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import {Link} from "react-router-dom";
import Tab from "@material-ui/core/Tab";
import {WorldMap} from "../MapView/WorldMap";


class AutoComplete extends React.Component {


    componentDidMount = async () => {
        this.loadAirports()
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

    state = {
        origin : 'All',
        destination : 'All',
        startLabel: '',
        endLabel: '',
        result: {status: '', value: {heads: {vars: []}, results: {bindings: []}}, h: [], v: [], err: '', xmlOutput: ''},
        airports: [{value:'All', label:'All'}],
        layOver: [],
        layOverTest: [],
        directFlight: '',
        orgLat: '',
        orgLong: '',
        destLat: '',
        destLong: '',
        query: ''
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

    render() {
        return (
            <div>

                <div className={"container-fluid bg-secondary"}>
                    <div className="row align-items-start">
                        <div className="col-sm-3 bg-dark">


                            <ul className="list-group wbdv-module-list">

                                    <span className="list-group-item bg-secondary wbdv-module-item">
                                        <Paper square>
                                            <Tabs
                                                indicatorColor="secondary.dark"
                                                textColor="primary"
                                                aria-label="disabled tabs example"
                                            >

                                             <Link to={`/dashboard`}>
                                                <Tab label="Go to Chart View">
                                                </Tab>
                                             </Link>
                                             <Link to={`/maps`}>
                                                <Tab label="Go to Map View">
                                                x   </Tab>
                                             </Link>
                                             </Tabs>
                                         </Paper>
                                    </span>

                                <span className="list-group-item bg-info wbdv-module-item">

                                        <span className="wbdv-module-item-title text-dark">Origin</span>

                                       <Autocomplete
                                           menuStyle={{
                                               borderRadius: '3px',
                                               boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                               background: 'rgba(255, 255, 255, 0.9)',
                                               padding: '2px 0',
                                               fontSize: '90%',
                                               position: 'fixed',
                                               overflow: 'auto',
                                               maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
                                               zIndex: '998',
                                           }}
                                           items={this.state.airports}
                                           shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                                           getItemValue={item => item.label}
                                           renderItem={(item, highlighted) =>
                                               <div
                                                   key={item.value}
                                                   style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
                                               >
                                                   {item.label}
                                               </div>
                                           }
                                           value={this.state.value}
                                           onChange={e => this.setState({ value: e.target.value, origin : e.target.value.substring(0,3) })}
                                           onSelect={value => this.setState({ value: value, origin : value.substring(0,3) })}
                                       />

                                    </span>

                                <span className="list-group-item bg-info wbdv-module-item">

                                        <span className="wbdv-module-item-title text-dark">Destination</span>

                                       <Autocomplete
                                           menuStyle={{
                                               borderRadius: '3px',
                                               boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                               background: 'rgba(255, 255, 255, 0.9)',
                                               padding: '2px 0',
                                               fontSize: '90%',
                                               position: 'fixed',
                                               overflow: 'auto',
                                               maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
                                               zIndex: '998',
                                           }}
                                           items={this.state.airports}
                                           shouldItemRender={(item1, value1) => item1.label.toLowerCase().indexOf(value1.toLowerCase()) > -1}
                                           getItemValue={item1 => item1.label}
                                           renderItem={(item1, highlighted1) =>
                                               <div
                                                   key={item1.value}
                                                   style={{ backgroundColor: highlighted1 ? '#eee' : 'transparent'}}
                                               >
                                                   {item1.label}
                                               </div>
                                           }
                                           value={this.state.value1}
                                           onChange={e => this.setState({ value1: e.target.value, destination : e.target.value.substring(0,3) })}
                                           onSelect={value1 => this.setState({ value1: value1, destination : value1.substring(0,3) })}
                                       />

                                    </span>
                            </ul>


                        </div>
                        <div className="col-sm-9">
                            <WorldMap
                                origin={this.state.origin}
                                destination={this.state.destination}
                                orgLat={this.state.orgLat}
                                orgLong={this.state.orgLong}
                                destLat={this.state.destLat}
                                destLong={this.state.destLong}
                                directFlight={this.state.directFlight}
                                layOver={this.state.layOver}
                                query={this.state.query}
                            />
                        </div>
                    </div>

                </div>


            </div>

        )
    }
}

export default AutoComplete

