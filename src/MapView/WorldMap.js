import React from 'react';
import { loadModules } from 'esri-loader';

export class WorldMap extends React.Component {
    constructor(props) {
        super(props);
        this.mapRef = React.createRef();
    }

    state = {
        a : 1,
        point1 : {
            type: "point",
            longitude: -71.0589,
            latitude: 42.3601
        },
        longitude: -122.431297,
        latitude: 37.7749,
        width: 1,
        lineColor: [0,0,0]
    }

    load = () => {
        // lazy load the required ArcGIS API for JavaScript modules and CSS
        loadModules(['esri/Map', 'esri/views/MapView','esri/Graphic',
            'esri/layers/GraphicsLayer','esri/geometry/Polyline','esri/geometry/geometryEngine'], { css: true })
            .then(([ArcGISMap, MapView,Graphic, GraphicsLayer, Polyline, geometryEngine]) => {
                const map = new ArcGISMap({
                    basemap: 'topo-vector'
                });

                let graphicsLayer = new GraphicsLayer();
                graphicsLayer.when(function(){
                    map.extent = graphicsLayer.fullExtent;
                });
                map.add(graphicsLayer);


                let simpleMarkerSymbolForOrigin = {
                    type: "simple-marker",//row.get('policyID'),
                    color: [0,0,255], // blue
                    outline: {
                        color: [255, 255, 255], // white
                        width: 1
                    }
                };

                let simpleMarkerSymbolForDest = {
                    type: "simple-marker",//row.get('policyID'),
                    color: [255,0,0], // red
                    outline: {
                        color: [255, 255, 255], // white
                        width: 1
                    }
                };

                let simpleMarkerSymbol = {
                    type: "simple-marker",//row.get('policyID'),
                    color: [0,0,0], // black
                    outline: {
                        color: [255, 255, 255], // white
                        width: 1
                    }
                };

                let origin = {
                    type: "point",
                    longitude: this.props.orgLong,
                    latitude: this.props.orgLat
                }


                let dest = {
                    type: "point",
                    longitude: this.props.destLong,
                    latitude: this.props.destLat
                }

                let orginGraphic = new Graphic({
                    geometry: origin,
                    symbol: simpleMarkerSymbolForOrigin
                });

                let destGraphic = new Graphic({
                    geometry: dest,
                    symbol: simpleMarkerSymbolForDest
                });


                //experimentation
                let long = -93.258133
                let lat = 44.986656

                for(let i=1; i<this.state.a; i++, lat += 10, long += 10) {

                    let point3 = {
                        type: "point",
                        longitude: long,
                        latitude: lat
                    }
                    let pointGraphic3 = new Graphic({
                        geometry: point3,
                        symbol: simpleMarkerSymbol
                    });
                    graphicsLayer.add(pointGraphic3)
                }



                let simpleLineSymbol = {
                    type: "simple-line",
                    color: this.state.lineColor,//[169,169,169], // dark-grey
                    width: this.state.width
                };

                let simpleLineSymbolDirect = {
                    type: "simple-line",
                    color: [0, 128, 0], // green
                    width: this.state.width
                };



                //layOver points

                for(let i=0;i<this.props.layOver.length;i++) {
                    let currLayOver = this.props.layOver[i]
                    console.log("WN")
                    // console.log("Curr Layover", currLayOver)
                    let currLayOverPoint = {
                        type: "point",
                        longitude: currLayOver.long,
                        latitude: currLayOver.lat
                    }

                    let currLayOverPointGraphic = new Graphic({
                        geometry: currLayOverPoint,
                        symbol: simpleMarkerSymbol
                    });

                    graphicsLayer.add(currLayOverPointGraphic)

                    let originToLayOver = new Polyline({
                        paths: [
                            [this.props.orgLong,this.props.orgLat],
                            [currLayOver.long,currLayOver.lat]
                        ]
                    })

                    let layOverToDest = new Polyline({
                        paths: [
                            [currLayOver.long,currLayOver.lat],
                            [this.props.destLong,this.props.destLat]
                        ]
                    })

                    originToLayOver = geometryEngine.geodesicDensify(originToLayOver,10000);
                    layOverToDest = geometryEngine.geodesicDensify(layOverToDest,10000);

                    let originToLayOverGraphic = new Graphic({
                        geometry: originToLayOver,
                        symbol: simpleLineSymbol
                    })

                    let layOverToDestGraphic = new Graphic({
                        geometry: layOverToDest,
                        symbol: simpleLineSymbol
                    })

                    graphicsLayer.add(originToLayOverGraphic)
                    graphicsLayer.add(layOverToDestGraphic)
                }





                // let polyline = {
                //     type: "polyline",
                //     paths: [
                //         [-122.431297, 37.7749],
                //         // [-93.258133,44.986656],
                //         // [-87.623177,41.881832],
                //         [-71.0589, 42.3601]
                //     ]
                // };

                graphicsLayer.add(orginGraphic);
                graphicsLayer.add(destGraphic);

                //source-destination line

                if(this.props.directFlight === true) {
                    let directRoute = new Polyline({
                        paths: [
                            [this.props.orgLong,this.props.orgLat],
                            [this.props.destLong,this.props.destLat]
                        ]
                    })
                    directRoute = geometryEngine.geodesicDensify(directRoute,10000);

                    let directRouteGraphic = new Graphic({
                        geometry: directRoute,
                        symbol: simpleLineSymbolDirect
                    });

                    graphicsLayer.add(directRouteGraphic);


                }


                this.view = new MapView({
                    container: this.mapRef.current,
                    map: map,
                    center: [-98,39],
                    zoom: 4
                });

            });

}
    componentDidMount() {
        this.load()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(    prevProps.orgLat !== this.props.orgLat
            || prevProps.orgLong !== this.props.orgLong
            || prevProps.destLat !== this.props.destLat
            || prevProps.destLong !== this.props.destLong
            || prevProps.directFlight !== this.props.directFlight
            || prevProps.query !== this.props.query
        )
            this.load()

    }

    render() {
        return (
            <div>
                {/*<div style={{ width: '100vw', height: '100vh' }}>*/}
                {/*    <WebMap id="6627e1dd5f594160ac60f9dfc411673f" />*/}
                {/*</div>*/}

                <input type="text"
                       onChange={async (e) =>
                           await this.setState({
                               longitude: e.target.value
                           })
                       }

                       value={this.state.longitude}
                />
                <input type="text"
                       onChange={async (e) =>
                           await this.setState({
                               latitude: e.target.value
                           })
                       }

                       value={this.state.latitude}
                />
                -73.935242
                40.730610
                <input type="text"
                       onChange={async (e) =>
                           await this.setState({
                               a: e.target.value
                           })
                       }

                       value={this.state.a}
                />
                Width:
                <input type="text"
                       onChange={async (e) =>
                           await this.setState({
                               width: e.target.value
                           })
                       }

                       value={this.state.width}
                />
                <button onClick={this.load}>Change</button>
                <div className="webmap" ref={this.mapRef} />
            </div>

        );
    }
}