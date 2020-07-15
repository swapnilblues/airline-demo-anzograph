import React from 'react';
import { loadModules } from 'esri-loader';

export class WebMapView extends React.Component {
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
        latitude: 37.7749
    }

    load = () => {
        // lazy load the required ArcGIS API for JavaScript modules and CSS
        loadModules(['esri/Map', 'esri/views/MapView','esri/Graphic',
            'esri/layers/GraphicsLayer'], { css: true })
            .then(([ArcGISMap, MapView,Graphic, GraphicsLayer]) => {
                const map = new ArcGISMap({
                    basemap: 'topo-vector'
                });

                let graphicsLayer = new GraphicsLayer();
                graphicsLayer.when(function(){
                    map.extent = graphicsLayer.fullExtent;
                });
                map.add(graphicsLayer);

                let point = {
                    type: "point",
                    longitude: this.state.longitude,
                    latitude: this.state.latitude
                }


                let point1 = this.state.point1

                let simpleMarkerSymbol = {
                    type: "simple-marker",//row.get('policyID'),
                    color: [0,0,0], // black
                    outline: {
                        color: [255, 255, 255], // white
                        width: 1
                    }
                };

                let pointGraphic = new Graphic({
                    geometry: point,
                    symbol: simpleMarkerSymbol
                });

                let pointGraphic1 = new Graphic({
                    geometry: point1,
                    symbol: simpleMarkerSymbol
                });

                graphicsLayer.add(pointGraphic);
                graphicsLayer.add(pointGraphic1);

                this.view = new MapView({
                    container: this.mapRef.current,
                    map: map,
                    center: [-98,39],
                    zoom: 5
                });
            });
}
    componentDidMount() {
        this.load()
    }

    render() {
        return (
            <div>

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
                <button onClick={this.load}>Change</button>
                <div className="webmap" ref={this.mapRef} />
            </div>

        );
    }
}