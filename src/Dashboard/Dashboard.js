import React from "react";
import "./dashboard.css"
import BarChart from "../BarChart";
import PieChart from "../PieChart";
import { Button } from '@material-ui/core';
import Icon from "@material-ui/core/Icon";
import LineChart from "../LineChart";
import ReactTableComponent from "../ReactTableComponent";
import Select from 'react-select'


class Dashboard extends React.Component {


    componentDidMount = async () => {
        this.loadAirports()
        await this.loadDate()
        this.runQueryForDiffDelays()
        this.runQueryForWeatherDelay()
        this.runQueryForAvgAirlineDelay()
        this.runQueryForCancellation()

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
                    end : this.state.start
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
            start: selectedItem.value
        });
    }

    changeEndDate = (selectedItem) => {
        this.setState({
            end: selectedItem.value
        });
    }

    state = {
        origin : 'All',
        destination : 'All',
        start : 1,
        end : 12,
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
        endDate1: {value: 123,label:'123a'},
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

    date = {

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
                    console.log("Date", minmm," ",minyy," ",maxmm," ",maxyy)




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
            })
    }

    createDataForDistance = () => {

    const f1 = new URLSearchParams()
    let query = "prefix : <https://ontologies.semanticarts.com/raw_data#>\n" +
        "prefix fl: <https://ontologies.semanticarts.com/flights/>\n" +
        "prefix owl: <http://www.w3.org/2002/07/owl#>\n" +
        "prefix skos: <http://www.w3.org/2004/02/skos/core#>\n" +
        `SELECT ?leg  ?dist
            from <airline_flight_network>
            WHERE {
            ?origin a fl:Airport .
             <<?origin fl:hasRouteTo ?dest>> fl:distanceMiles ?dist .
             ?origin fl:terminalCode ?orgName .
             ?dest fl:terminalCode ?destName .
             BIND(CONCAT(?orgName,' --> ',?destName) AS ?leg)
             FILTER(?destName =  '${this.state.destination}')
             }
        ORDER BY DESC(?dist)
        LIMIT 15`
     f1.append('query', query)
     f1.append('output', 'json')
     return f1;
     }

    createDataForDiffDelays = () => {

        let originFilter = ''
        let destFilter = ''

        if(this.state.origin !== 'All') {
            originFilter = `FILTER (?origCode = '${this.state.origin}')`
        }

        if(this.state.destination !== 'All') {
            destFilter = `FILTER (?destCode = '${this.state.destination}')`
        }


        const f1 = new URLSearchParams()
        let query = "prefix : <https://ontologies.semanticarts.com/raw_data#>\n" +
            "prefix fl: <https://ontologies.semanticarts.com/flights/>\n" +
            "prefix owl: <http://www.w3.org/2002/07/owl#>\n" +
            "prefix skos:    <http://www.w3.org/2004/02/skos/core#>\n" +
    `SELECT  (sum(?airSystemDelay) as ?airSum) (sum(?securityDelay) as ?securitySum)  (sum(?airlineDelay) as ?airlineSum) (sum(?lateAircraftDelay) as ?lateAircraftSum) (sum(?weatherDelay) as ?weatherSum)
    from <airline_flight_network>
            where {
                ?flightIRI a fl:Flight ;

            :month         ?month;
            :day           ?day ;
            fl:operatedBy  ?airlineIRI;
            fl:departsFrom ?originIRI;
            fl:arrivesAt ?destinationIRI ;
            :airSystemDelay   ?airSystemDelay;
            :securityDelay   ?securityDelay;
            :airlineDelay   ?airlineDelay;
            :lateAircraftDelay   ?lateAircraftDelay;
            :weatherDelay   ?weatherDelay .
            ?airlineIRI skos:prefLabel ?airlineName .
            ?originIRI skos:prefLabel ?originName ;
            fl:terminalCode ?origCode .
            ?destinationIRI skos:prefLabel ?destinationName ;
            fl:terminalCode ?destCode .` +

            originFilter +
            destFilter +
            
            `FILTER(?month >= ${this.state.start} && ?month <= ${this.state.end})

        } `
        f1.append('query', query)
        f1.append('output', 'json')
        return f1;
    }

    createDataForWeatherDelay = () => {
        let originFilter = ''
        let destFilter = ''
        let selectOrigin = ''
        let selectDest = ''

        if(this.state.origin !== 'All') {
            originFilter = `FILTER (?origCode = '${this.state.origin}')`
            selectOrigin = '?origCode'
        }

        if(this.state.destination !== 'All') {
            destFilter = `FILTER (?destCode = '${this.state.destination}')`
            selectDest = '?destCode'
        }


        const f1 = new URLSearchParams()
        let query = "prefix : <https://ontologies.semanticarts.com/raw_data#>" +
            "prefix fl: <https://ontologies.semanticarts.com/flights/>" +
            "prefix owl: <http://www.w3.org/2002/07/owl#>" +
            "prefix skos:    <http://www.w3.org/2004/02/skos/core#>" +
            `select ?month` + selectOrigin + selectDest + `(sum(?weatherCnt) as ?weatherCount) (sum(?nonWeatherCnt) as ?nonWeatherCount)
            from <airline_flight_network>
                where {
                ?flightIRI a fl:Flight ;
                :month         ?month;
                :day           ?day ;
                fl:departsFrom ?originIRI;
                fl:arrivesAt   ?destinationIRI ;
                fl:arrivesAt   ?destinationIRI ;
                :airSystemDelay   ?airSystemDelay;
                :securityDelay   ?securityDelay;
                :airlineDelay   ?airlineDelay ;
                :lateAircraftDelay   ?lateAircraftDelay;
                :weatherDelay   ?weatherDelay .
                ?originIRI skos:prefLabel ?originName ;
                fl:terminalCode ?origCode .
                ?destinationIRI skos:prefLabel ?destinationName ;
                fl:terminalCode ?destCode .
                BIND(IF(?weatherDelay > 0,  1 , 0) as ?weatherCnt)
                BIND(IF(((?airSystemDelay > 0) || (?securityDelay > 0) || (?airlineDelay > 0) || (?lateAircraftDelay > 0)),  1 , 0) as ?nonWeatherCnt)` +
           
                 originFilter +
                 destFilter

                 + `FILTER(?month >= ${this.state.start} && ?month <= ${this.state.end  } )
                 }
            group by` + selectOrigin + selectDest + `?month
            order by ASC(?month)`

        f1.append('query', query)
        f1.append('output', 'json')
        return f1;
    }

    createDataForAirlineDelay = () => {
        let originFilter = ''
        let destFilter = ''
        let selectOrigin = ''
        let selectDest = ''

        if(this.state.origin !== 'All') {
            originFilter = `FILTER (?origCode = '${this.state.origin}')`
            selectOrigin = '?origCode'
        }

        if(this.state.destination !== 'All') {
            destFilter = `FILTER (?destCode = '${this.state.destination}')`
            selectDest = '?destCode'
        }


        const f1 = new URLSearchParams()
        let query = "prefix : <https://ontologies.semanticarts.com/raw_data#>" +
                "prefix fl: <https://ontologies.semanticarts.com/flights/>" +
                "prefix owl: <http://www.w3.org/2002/07/owl#>" +
                "prefix skos:    <http://www.w3.org/2004/02/skos/core#>" +
                `select   
                ?airlineName
                (AVG(xsd:integer(?airlineDelay)) as ?Average_Airline_Delay)
                from <airline_flight_network>
                where {
                    ?flightIRI a fl:Flight ;
                    :month         ?month;
                    fl:operatedBy  ?airlineIRI;
                    fl:departsFrom ?originIRI;
                    fl:arrivesAt ?destinationIRI ;
                    :airlineDelay   ?airlineDelay.
                    ?airlineIRI skos:prefLabel ?airlineName .
                    ?originIRI skos:prefLabel ?originName ;
                    fl:terminalCode ?origCode .
                    ?destinationIRI skos:prefLabel ?destinationName ;
                    fl:terminalCode ?destCode .` +

                    originFilter +
                    destFilter

                    + `FILTER(?month >= ${this.state.start} && ?month <= ${this.state.end  } )
                } 
                group by` + selectOrigin + selectDest  + `?airlineName
                order by desc(?Average_Airline_Delay)
                limit 10`

        f1.append('query', query)
        f1.append('output', 'json')
        return f1;
    }

    createDataForCancellation = () => {
        let originFilter = ''
        let destFilter = ''
        let selectOrigin = ''
        let selectDest = ''

        if(this.state.origin !== 'All') {
            originFilter = `FILTER (?origCode = '${this.state.origin}')`
            selectOrigin = '?origCode'
        }

        if(this.state.destination !== 'All') {
            destFilter = `FILTER (?destCode = '${this.state.destination}')`
            selectDest = '?destCode'
        }


        const f1 = new URLSearchParams()
        let query = "prefix : <https://ontologies.semanticarts.com/raw_data#>" +
            "prefix fl: <https://ontologies.semanticarts.com/flights/>" +
            "prefix owl: <http://www.w3.org/2002/07/owl#>" +
            "prefix skos:    <http://www.w3.org/2004/02/skos/core#>" +
            `select   
(( CASE
    WHEN (?cancelReason = 'A') then "Carrier"
    WHEN (?cancelReason = 'B') then "Weather"
    WHEN (?cancelReason = 'C') then "National Air System"
    WHEN (?cancelReason = 'D') then "Security"
    END ) as ?cancelReasonDescription)
    (count(?cancelReason) as ?cancelReasonCount)
    from <airline_flight_network>
            where {
                ?flightIRI a fl:Flight ;
            :month         ?month;
            fl:operatedBy  ?airlineIRI;
            fl:departsFrom ?originIRI;
            fl:arrivesAt ?destinationIRI ;
            # :airlineDelay   ?airlineDelay.
            :cancellationReason ?cancelReason .
            ?airlineIRI skos:prefLabel ?airlineName .
            ?originIRI skos:prefLabel ?originName ;
            fl:terminalCode ?origCode .
            ?destinationIRI skos:prefLabel ?destinationName ;
            fl:terminalCode ?destCode .` +

            originFilter +
            destFilter
            + `FILTER(?month >= ${this.state.start} && ?month <= ${this.state.end  } )
            
        } group by ?cancelReason
            order by desc(?cancelReasonCount)
            limit 10`

        f1.append('query', query)
        f1.append('output', 'json')
        return f1;
    }



    creatGChartForDistance = (h,v) => {
         let data = []
         data.push(h)

         { v && v.map( (vEle) =>
            {   let currRow = []
                h && h.map( (hEle) =>
                {
                    // console.log("Values", vEle[hEle])
                    if (vEle[hEle].type === 'uri') {
                        currRow.push('<' + vEle[hEle].value + '>')
                    } else if(vEle[hEle].type !== 'uri' && vEle[hEle].datatype.substring(33) === 'string') {
                        currRow.push("\"" + vEle[hEle].value + "\"")
                    } else if(vEle[hEle].type !== 'uri') {
                        currRow.push(vEle[hEle].value)
                    }
                })
                // console.log("Curr Row",currRow)
                data.push(currRow)
            })
         }
            // console.log("Data",data)

            return data
    }

    createGChartForDiffDelays = (h,v) => {
        let data = []
        // console.log("H",h)
        // console.log("V",v)
        let header = ['Delay Type','Value']
        data.push(header)

        for(let i=0; i<h.length; i++) {
            let currRow = []
            currRow.push(h[i])
            currRow.push(parseFloat(v[0][h[i]].value))
            data.push(currRow)
        }
        // console.log("Data",data)

        return data
    }

    createGChartForWeatherDelay = (h,v) => {
        let data = []
        let header = ['Month','Weather Delay','Non Weather Delay']
        data.push(header)

        for(let i=0; i<v.length;i++) {
            let currRow = []
            currRow.push(this.month[v[i].month.value])
            currRow.push(parseFloat(v[i].weatherCount.value))
            currRow.push(parseFloat(v[i].nonWeatherCount.value))
            data.push(currRow)
        }
        return data
    }

    createGChartForFlightDelay = (h,v) => {
        let data = []
        let header = ['Airline Name', 'Average Airline Delay']
        data.push(header)
        for(let i=0; i<v.length;i++) {
            let currRow = []
            currRow.push(v[i].airlineName.value)
            currRow.push(parseFloat(v[i].Average_Airline_Delay.value))
            data.push(currRow)
        }
        return data
    }

    createGChartForCancellation = (h,v) => {
        let data = []
        console.log("H",h)
        console.log("V",v)
        let header = ['Cancellation Reason', 'Number of flights cancelled']
        data.push(header)
        for(let i=0; i<v.length;i++) {
            let currRow = []
            currRow.push(v[i].cancelReasonDescription.value)
            currRow.push(parseFloat(v[i].cancelReasonCount.value))
            data.push(currRow)
        }
        return data
    }

    runQueryForDiffDelays = async () => {

        if(parseInt(this.state.end) < parseInt(this.state.start)) {
                await this.setState({
                    end : this.state.start
                })
            }
            this.setState({
                showBar: true,
                showPie: true,
                showArea: true,
                titleOfGraph1: `Flight delay reasons from ${this.state.origin} to ${this.state.destination} between ${this.month[this.state.start]} and ${this.month[this.state.end]}`,
                gChart: ''
            })
            const formData = await this.createDataForDiffDelays()
            await fetch(`http://localhost:7070/sparql`, {
                    method: "POST",
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                }
            )
                .then(async (response) => {
                    if (response.status === 200) {
                            let c = await response.json()
                            // console.log("AA",c)
                            await this.setState({
                                result: {
                                    status: 200,
                                    err: '',
                                    value: c,
                                    h: c.head.vars,
                                    v: c.results.bindings
                                }
                            })
                            let d1 = await this.createGChartForDiffDelays(c.head.vars,c.results.bindings)
                            // console.log("d1",d1)
                            await this.setState({
                                gChart1 : d1
                            })

                            // console.log("gChart after setState",this.state.gChart)
                        }
                })

        }

    runQueryForWeatherDelay = async () => {

        if(parseInt(this.state.end) < parseInt(this.state.start)) {
            await this.setState({
                end : this.state.start
            })
        }
        this.setState({
            showBar: true,
            showPie: false,
            showArea: true,
            titleOfGraph2: `Weather vs Non-weather delay:\n For flights from ${this.state.origin} to ${this.state.destination} between ${this.month[this.state.start]} and ${this.month[this.state.end]}`,
            gChart: ''
        })
        const formData = await this.createDataForWeatherDelay()
        await fetch(`http://localhost:7070/sparql`, {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    let c = await response.json()
                    // console.log("AA",c)
                    await this.setState({
                        result: {
                            status: 200,
                            err: '',
                            value: c,
                            h: c.head.vars,
                            v: c.results.bindings
                        }
                    })
                    let d1 = await this.createGChartForWeatherDelay(c.head.vars,c.results.bindings)
                    // console.log("d1",d1)
                    await this.setState({
                        gChart2 : d1
                    })

                    // console.log("gChart after setState",this.state.gChart)
                }
            })

    }

    runQueryForDistance = async () => {

        this.setState({
            showBar: true,
            showPie: true,
            showArea: false,
        })
        const formData = await this.createDataForDistance()
        await fetch(`http://localhost:7070/sparql`, {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    let c = await response.json()
                    // console.log("AA",c)
                    await this.setState({
                        result: {
                            status: 200,
                            err: '',
                            value: c,
                            h: c.head.vars,
                            v: c.results.bindings
                        }
                    })
                    let d1 = await this.creatGChartForDistance(c.head.vars,c.results.bindings)
                    // console.log("d1",d1)
                    await this.setState({
                        gChart : d1
                    })

                    // console.log("gChart after setState",this.state.gChart)
                }
            })

    }

    runQueryForAvgAirlineDelay = async () => {
        if(parseInt(this.state.end) < parseInt(this.state.start)) {
            await this.setState({
                end : this.state.start
            })
        }
        this.setState({
            showBar: true,
            showPie: true,
            showArea: true,
            titleOfGraph3: `Average flight delay:\n For flights from ${this.state.origin} to ${this.state.destination} between ${this.month[this.state.start]} and ${this.month[this.state.end]}`,
            gChart: ''
        })
        const formData = await this.createDataForAirlineDelay()
        await fetch(`http://localhost:7070/sparql`, {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    let c = await response.json()
                    // console.log("AA",c)
                    await this.setState({
                        result: {
                            status: 200,
                            err: '',
                            value: c,
                            h: c.head.vars,
                            v: c.results.bindings
                        }
                    })
                    let d1 = await this.createGChartForFlightDelay(c.head.vars,c.results.bindings)
                    // console.log("d1",d1)
                    await this.setState({
                        gChart3 : d1
                    })

                    // console.log("gChart after setState",this.state.gChart)
                }
            })

    }

    runQueryForCancellation = async () => {
        if(parseInt(this.state.end) < parseInt(this.state.start)) {
            await this.setState({
                end : this.state.start
            })
        }
        this.setState({
            showBar: true,
            showPie: true,
            showArea: true,
            titleOfGraph4: `Flight Cancellation Reason:\n For flights from ${this.state.origin} to ${this.state.destination} between ${this.month[this.state.start]} and ${this.month[this.state.end]}`,
            gChart: ''
        })
        const formData = await this.createDataForCancellation()
        await fetch(`http://localhost:7070/sparql`, {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    let c = await response.json()
                    // console.log("AA",c)
                    await this.setState({
                        result: {
                            status: 200,
                            err: '',
                            value: c,
                            h: c.head.vars,
                            v: c.results.bindings
                        }
                    })
                    let d1 = await this.createGChartForCancellation(c.head.vars,c.results.bindings)
                    // console.log("d1",d1)
                    await this.setState({
                        gChart4 : d1
                    })

                    // console.log("gChart after setState",this.state.gChart)
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

                                        <select className="input-flight"
                                                onChange={async (e) =>
                                                    await this.setState({
                                                        start: e.target.value
                                                    })
                                                }

                                                value={this.state.start}
                                        >
                                            <option value={"1"}>January, 2015</option>
                                            <option value={"2"}>February, 2015</option>
                                            <option value={"3"}>March, 2015</option>
                                            <option value={"4"}>April, 2015</option>
                                            <option value={"5"}>May, 2015</option>
                                            <option value={"6"}>June, 2015</option>
                                            <option value={"7"}>July, 2015</option>
                                            <option value={"8"}>August, 2015</option>
                                            <option value={"9"}>September, 2015</option>
                                            <option value={"10"}>October, 2015</option>
                                            <option value={"11"}>November, 2015</option>
                                            <option value={"12"}>December, 2015</option>
                                        </select>

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

                                        <select className="input-flight"
                                                onChange={async (e) =>
                                                    await this.setState({
                                                        end: e.target.value
                                                    })
                                                }

                                                value={this.state.end}
                                        >
                                            <option value={"1"}>January, 2015</option>
                                            <option value={"2"}>February, 2015</option>
                                            <option value={"3"}>March, 2015</option>
                                            <option value={"4"}>April, 2015</option>
                                            <option value={"5"}>May, 2015</option>
                                            <option value={"6"}>June, 2015</option>
                                            <option value={"7"}>July, 2015</option>
                                            <option value={"8"}>August, 2015</option>
                                            <option value={"9"}>September, 2015</option>
                                            <option value={"10"}>October, 2015</option>
                                            <option value={"11"}>November, 2015</option>
                                            <option value={"12"}>December, 2015</option>
                                        </select>
                                    </span>

                                    <div className="wbdv-module-item">
                                        <div className="d-flex justify-content-center">
                                            <Button variant="contained" size="large" endIcon={<Icon>send</Icon>}
                                                    onClick = {  () => {
                                                         this.runQueryForDiffDelays()
                                                         this.runQueryForWeatherDelay()
                                                         this.runQueryForAvgAirlineDelay()
                                                         this.runQueryForCancellation()
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
                                <table className={"graph-container"}>
                                    <tr>
                                        {
                                        <td>
                                            <BarChart
                                                gChart={this.state.gChart3}
                                                title={this.state.titleOfGraph3}
                                            />

                                        </td>
                                        }
                                        {
                                        <td>
                                            <PieChart
                                                gChart={this.state.gChart1}
                                                title = {this.state.titleOfGraph1}
                                            />
                                        </td>
                                        }
                                    </tr>
                                    <tr>
                                        {
                                        <td>
                                            <LineChart
                                                gChart={this.state.gChart2}
                                                title = {this.state.titleOfGraph2}
                                            />
                                        </td>
                                        }
                                        <td>
                                            <PieChart
                                                gChart={this.state.gChart4}
                                                title = {this.state.titleOfGraph4}
                                            />
                                        </td>
                                    </tr>
                                </table>

                            </div>
                        </div>

                    </div>


                </div>

            )
        }
        }

        export default Dashboard

