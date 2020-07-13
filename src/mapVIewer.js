import React from 'react';
import { loadModules } from 'esri-loader';

export class WebMapView extends React.Component {
    constructor(props) {
        super(props);
        this.mapRef = React.createRef();
    }

    componentDidMount() {
        // lazy load the required ArcGIS API for JavaScript modules and CSS
        loadModules(['esri/Map', 'esri/views/MapView'], { css: true })
            .then(([ArcGISMap, MapView]) => {
                const map = new ArcGISMap({
                    basemap: 'topo-vector'
                });

                this.view = new MapView({
                    container: this.mapRef.current,
                    map: map,
                    center: [-118, 34],
                    zoom: 8
                });
            });
    }

    componentWillUnmount() {
        if (this.view) {
            // destroy the map view
            this.view.container = null;
        }
    }

    render() {
        return (
            <div>
                <div className="webmap" ref={this.mapRef} />
            </div>

        );
    }
}