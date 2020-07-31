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
        width: 2
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

                let simpleMarkerSymbol = {
                    type: "simple-marker",//row.get('policyID'),
                    color: [0,0,0], // black
                    outline: {
                        color: [255, 255, 255], // white
                        width: 1
                    }
                };

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

                //newline
                let polyline = new Polyline({
                    paths: [
                        // [-122.431297, 37.7749],
                        [this.state.longitude,this.state.latitude],
                        // [-93.258133,44.986656],
                        // [-87.623177,41.881832],
                        [-71.0589, 42.3601]
                    ]
                })

                polyline = geometryEngine.geodesicDensify(polyline,100000);

                let orginGraphic = new Graphic({
                    geometry: origin,
                    symbol: simpleMarkerSymbol
                });

                let destGraphic = new Graphic({
                    geometry: dest,
                    symbol: simpleMarkerSymbol
                });

                graphicsLayer.add(orginGraphic);
                graphicsLayer.add(destGraphic);

                let simpleLineSymbol = {
                    type: "simple-line",
                    color: [0, 0, 0], // black
                    width: this.state.width
                };

                // let polyline = {
                //     type: "polyline",
                //     paths: [
                //         [-122.431297, 37.7749],
                //         // [-93.258133,44.986656],
                //         // [-87.623177,41.881832],
                //         [-71.0589, 42.3601]
                //     ]
                // };


                let polylineGraphic = new Graphic({
                    geometry: polyline,
                    symbol: simpleLineSymbol
                });

                // graphicsLayer.add(polylineGraphic);

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