  import React, { useRef, useState, useEffect } from 'react';
  import styled from 'styled-components';
  //components import
  import Yongdammeuncontrol from '../controls/Yongdammeuncontrol';
  import YongdamMapcontrol from '../controls/YongdamMapcontrol';
  //openlayers
  import Map from 'ol/Map';
  import View from 'ol/View';
  import { Tile as TileLayer } from 'ol/layer';
  import { TileWMS, XYZ, OSM } from 'ol/source';
  import { fromLonLat } from 'ol/proj';
  import {ScaleLine, defaults as defaultControls} from 'ol/control.js';
  import Draw from 'ol/interaction/Draw';
  import Overlay from 'ol/Overlay';
  import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
  import { LineString, Polygon } from 'ol/geom';
  import { Vector as VectorSource } from 'ol/source';
  import { Vector as VectorLayer } from 'ol/layer';
  import { getArea, getLength } from 'ol/sphere';
  import { unByKey } from 'ol/Observable';
  import { Feature } from 'ol';
  import Point from 'ol/geom/Point';
  import { Cluster } from 'ol/source';
  import { GeoJSON } from 'ol/format';
  import { Select } from 'ol/interaction';
  import 'ol/ol.css';
  //react-screenshot import
  import html2canvas from "html2canvas";
  import saveAs from "file-saver";
  // img
  import pin from '../../assets/pin.png'
  import panopin from '../../assets/panopin.png'

  const geoserverUrl = process.env.REACT_APP_GEOSERVER_URI;

  //k워터 중분류 레이어 임시 데이터
  const layerConfigurations = [
    { name: '전', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_field' } },
    { name: '답', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_ricepaddy' } },
    { name: '과수원', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_orchard' } },
    { name: '목장용지', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_pasture' } },
    { name: '임야', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_forest' } },
    { name: '광천지', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_gwangcheonki' } },
    { name: '대지', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_earth' } },
    { name: '공장용지', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_factory' } },
    { name: '학교용지', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_school' } },
    { name: '주차장, 도로', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_road' } },
    { name: '주유소', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_gasstation' } },
    { name: '체육용지', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_athletic' } },
    { name: '유원지', url: 'http://localhost:8080/geoserver/yeongju/wms', params: { 'LAYERS': 'yeongju:K_water_amusementpark' } },
  ];
  //용담댐 대상지 임시 데이터
  const Area = [
    {
      name: "호계리 306",
      acode: "p_1",
      image:'',
      coordinate: [127.4633, 35.9392],
      description: "간접지",
      indirectLand:'true',//간접지
      reservoirArea:'false',//저수구역
      floodcontrolarea:'false',//홍수조절지
    },
    {
      name: "호계리 516-2",
      acode: "p_2",
      image:'',
      coordinate: [127.4594, 35.9234],
      description: "간접지",
      indirectLand:'true',//간접지
      reservoirArea:'false',//저수구역
      floodcontrolarea:'false',//홍수조절지
    },
    {
      name: "월포리 1091-2",
      acode: "p_3",
      coordinate: [127.4811, 35.8635],
      image:'',
      description: "간접지+저수구역",
      indirectLand:'true',//간접지
      reservoirArea:'true',//저수구역
      floodcontrolarea:'false',//홍수조절지
    },
    {
      name: "노성리 1091-2",
      acode: "p_4",
      coordinate: [127.5484, 35.893],
      image:'',
      description: "간접지+저수구역",
      indirectLand:'true',//간접지
      reservoirArea:'false',//저수구역
      floodcontrolarea:'false',//홍수조절지
    },
    {
      name: "갈현리 621-3",
      acode: "p_5",
      coordinate: [127.474645, 35.825242],
      image:'',
      description: "간접지+저수구역",
      indirectLand:'false',//간접지
      reservoirArea:'false',//저수구역
      floodcontrolarea:'true',//홍수조절지
    },
    {
      name: "상전면 용평리 140",
      acode: "p_6",
      coordinate: [127.5071, 35.8759],
      image:'',
      description: "간접지+저수구역",
      indirectLand:'true',//간접지
      reservoirArea:'true',//저수구역
      floodcontrolarea:'false',//홍수조절지
    },
    {
      name: "상전면 용평리 1078",
      acode: "p_7",
      coordinate: [127.5016, 35.8798],
      image:'',
      description: "간접지+저수구역",
      indirectLand:'true',//간접지
      reservoirArea:'true',//저수구역
      floodcontrolarea:'false',//홍수조절지
    },
    {
      name: "안천면 노성리 1505",
      acode: "p_8",
      coordinate: [127.5418, 35.898],
      image:'',
      description: "간접지+저수구역",
      indirectLand:'true',//간접지
      reservoirArea:'true',//저수구역
      floodcontrolarea:'false',//홍수조절지
    }
  ];





  const YongdamMap = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const popupRef = useRef();
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [popupContent, setPopupContent] = useState('');
    const [mapType, setMapType] = useState('4');
    //레이어 on/off
    const [visibleLayers, setVisibleLayers] = useState({
      wmsLayer1: true,
      wmsLayer2: true,
      clusterLayer: true,
      cadastralvectorLayer: true,
    });
    const [additionalLayers, setAdditionalLayers] = useState(() => {
      const initialState = {};
      layerConfigurations.forEach((layer) => {
        initialState[layer.name] = false;
      });
      return initialState;
    });

    const jinanClusterData = [
      {
        coordinate: [127.5285, 35.945],  // 진안군 안천면 안용로 747의 좌표
        name: 'Jinan Cluster',
        image: 'url/to/image.jpg',  // 필요시 이미지 경로 추가
        description: 'Jinan Cluster description',
        page: 'url/to/page'  // 필요시 페이지 링크 추가
      }
    ];

    const jinanVectorSource = new VectorSource({
      features: jinanClusterData.map(area => new Feature({
        geometry: new Point(fromLonLat(area.coordinate)),
        name: area.name,
        image: area.image,
        description: area.description,
        page: area.page
      }))
    });
    
    const jinanClusterSource = new Cluster({
      distance: 40,
      source: jinanVectorSource
    });
    
    // 새로운 클러스터 레이어 생성
    const jinanClusterLayer = new VectorLayer({
      source: jinanClusterSource,
      style: (feature) => {
        const size = feature.get('features').length;
        return new Style({
          image: new Icon({
            src: pin,  // Replace with the path to your custom image
            scale: 0.4 + Math.min(size / 300, 0.5),  // Adjust scale based on cluster size
            anchor: [0.5, 0.5]
          }),
        });
      }
    });
    



    ///////////////////////////////////////////거리 계산,면적 계산 코드////////////////////////////////////
    const raster = new TileLayer({
      source: new OSM(),
    });

    const source = new VectorSource();
    const vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      }),
      visible: visibleLayers.vector,
    });

    let sketch;
    let helpTooltipElement;
    let helpTooltip;
    let measureTooltipElement;
    let measureTooltip;
    const continuePolygonMsg = 'Click to continue drawing the polygon';
    const continueLineMsg = 'Click to continue drawing the line';

    const pointerMoveHandler = function (evt) {
      if (evt.dragging) {
        return;
      }
      let helpMsg = 'Click to start drawing';

      if (sketch) {
        const geom = sketch.getGeometry();
        if (geom instanceof Polygon) {
          helpMsg = continuePolygonMsg;
        } else if (geom instanceof LineString) {
          helpMsg = continueLineMsg;
        }
      }

      helpTooltipElement.innerHTML = helpMsg;
      helpTooltip.setPosition(evt.coordinate);

      helpTooltipElement.classList.remove('hidden');
    };

    const formatLength = function (line) {
      const length = getLength(line);
      let output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' km';
      } else {
        output = Math.round(length * 100) / 100 + ' m';
      }
      return output;
    };

    const formatArea = function (polygon) {
      const area = getArea(polygon);
      let output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' km²';
      } else {
        output = Math.round(area * 100) / 100 + ' m²';
      }
      return output;
    };

    const createHelpTooltip = () => {
      if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
      }
      helpTooltipElement = document.createElement('div');
      helpTooltipElement.className = 'ol-tooltip hidden';
      helpTooltip = new Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left',
      });
      mapInstance.current.map.addOverlay(helpTooltip);
    };

    const createMeasureTooltip = () => {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
      measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
        stopEvent: false,
        insertFirst: false,
      });
      mapInstance.current.map.addOverlay(measureTooltip);
    };

    const addInteraction = (type) => {
      const draw = new Draw({
        source: source,
        type: type,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 125, 5, 0.4)',
          }),
          stroke: new Stroke({
            color: '#FF9900',
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: '#FF9900',
            }),
          }),
        }),
      });
      mapInstance.current.map.addInteraction(draw);

      createMeasureTooltip();
      createHelpTooltip();

      let listener;
      draw.on('drawstart', (evt) => {
        sketch = evt.feature;

        let tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', (evt) => {
          const geom = evt.target;
          let output;
          if (geom instanceof Polygon) {
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(tooltipCoord);
        });
      });

      draw.on('drawend', () => {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
        unByKey(listener);
      });

      mapInstance.current.draw = draw;
    };

    const clearMeasurements = () => {
      source.clear();
      mapInstance.current.map.getOverlays().clear();
    };

    const scaleLineControl = new ScaleLine({
      units: 'metric',
    });
  ///////////////////////////////////지도 생성 코드
    const createMap = () => {
      const osmLayer = new TileLayer({
        source: new OSM(),
      });
  ///vworld 지도
      const vworldLayer = new TileLayer({

        source: new XYZ({
          url: `http://api.vworld.kr/req/wmts/1.0.0/{apikey}/Satellite/{z}/{y}/{x}.jpeg`.replace(
            '{apikey}',
            '9D1DA041-8CBA-3E86-9C6D-90178C0E1CE6'
          ),
        }),
        visible: mapType === '3',
      });
  // 지역 AOI
      const wmsLayer1 = new TileLayer({
        source: new TileWMS({
          url: `${geoserverUrl}/yongdamAOI/wms`,
          params: {
            'LAYERS': 'yongdamAOI:yongdamCommonAOI',
            'TILED': true,
          },
          serverType: 'geoserver',
          transition: 0,
        }),
        visible: visibleLayers.wmsLayer1,
      });
  // 하천 레이어
      const wmsLayer2 = new TileLayer({
        source: new TileWMS({
          url: `${geoserverUrl}/yongdamAOI/wms`,
          params: {
            'LAYERS': 'yongdamAOI:yongdam_waterline',
          },
          serverType: 'geoserver',
          transition: 0,
        }),
        visible: visibleLayers.wmsLayer2,
      });
  
      const additionalLayersConfig = layerConfigurations.reduce((acc, layerConfig) => {
        acc[layerConfig.name] = new TileLayer({
          source: new TileWMS({
            url: layerConfig.url,
            params: layerConfig.params,
            serverType: 'geoserver',
            transition: 0,
          }),
          visible: additionalLayers[layerConfig.name],
        });
        return acc;
      }, {});
      //야간 지도 설정
      osmLayer.on('prerender', (evt) => {
        if (evt.context) {
          const context = evt.context;
          if (mapType === '4') {
            context.filter = 'grayscale(80%) invert(100%)';
          } else {
            context.filter = 'grayscale(0%) invert(0%)';
          }
          
        }
      });
      osmLayer.on('postrender', (evt) => {
        if (evt.context) {
          const context = evt.context;
          context.filter = 'none'; // 다른 레이어에 영향을 주지 않도록 필터 초기화
        }
      });

      /// 지도위 파노라마 촬영지 클러스터(마커 생성)
      const vectorSources = new VectorSource({
        features: Area.map(area => new Feature({
          geometry: new Point(fromLonLat(area.coordinate)),
          name: area.name,
          image: area.image,
          description: area.description,
          page: area.page
        })) 
      });

      const clusterSource = new Cluster({
        distance: 40,
        source: vectorSources
        
      });
      
      //클러스터 스타일 및 설정 
      const clusterLayer = new VectorLayer({
        source: clusterSource,
        style: (feature) => {
          const size = feature.get('features').length;
          return new Style({
            image: new Icon({
              src: panopin,  // Replace with the path to your custom image
              scale: 0.05 + Math.min(size / 300, 0.5),  // Adjust scale based on cluster size
              anchor: [0.5, 0.5]
            }),
          });
        },
        visible: visibleLayers.clusterLayer,
      });

      //////////////////////////지적도 레이어 Source
      const defaultStyle = new Style({
        fill: new Fill({
          color: 'rgba(193, 140, 1, 0.5)',
        }),
        stroke: new Stroke({
          color: '#bfbfbf',
          width: 0.5,
        }),
      });
      
      const selectStyle = new Style({
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
        stroke: new Stroke({
          color: '#0000ff',
          width: 2,
        }),
      });
      
      // Create VectorSource using GeoJSON data
      const cadastralvectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geojsonData, {
          featureProjection: 'EPSG:3857',
        }),
      });
      
      // Create VectorLayer with styles and source
      const cadastralvectorLayer = new VectorLayer({
        source: cadastralvectorSource,
        style: (feature) => {
          return feature.get('selected') ? selectStyle : defaultStyle;
        },
        visible: visibleLayers.cadastralvectorLayer, // Controlled by visibleLayers state
      });



      

      //openlayers 지도 
      const map = new Map({
        controls: defaultControls().extend([scaleLineControl]),
        target: mapRef.current,
        layers: [osmLayer,vworldLayer, wmsLayer1, wmsLayer2, vector, jinanClusterLayer,cadastralvectorLayer,clusterLayer,  ...Object.values(additionalLayersConfig)],
        view: new View({
          center: fromLonLat([127.5256, 35.8848]),
          zoom: 11,
          minZoom: 11.5,
          maxZoom: 21,
        }),
        
      });
      mapInstance.current = { map, layers: { wmsLayer1, wmsLayer2, vworldLayer,  jinanClusterLayer,cadastralvectorLayer,clusterLayer,  ...additionalLayersConfig }
    };
    };

    useEffect(() => {
      if (mapRef.current) {
        createMap();
      }
      return () => mapInstance.current?.map.setTarget(null);
    }, [mapType]);

    //지역AOI, 하천, 지적도, 파노라마 포인트 visible 관리
    useEffect(() => {
      if (mapInstance.current) {
        const { wmsLayer1, wmsLayer2, clusterLayer, cadastralvectorLayer } = mapInstance.current.layers;
        wmsLayer1.setVisible(visibleLayers.wmsLayer1);
        wmsLayer2.setVisible(visibleLayers.wmsLayer2);    
        cadastralvectorLayer.setVisible(visibleLayers.cadastralvectorLayer);
        clusterLayer.setVisible(visibleLayers.clusterLayer);
      }
    }, [visibleLayers]);

    useEffect(() => {
      if (mapInstance.current) {
        Object.entries(additionalLayers).forEach(([layerName, visibility]) => {
          if (mapInstance.current.layers[layerName]) {
            mapInstance.current.layers[layerName].setVisible(visibility);
          }
        });
      }
    }, [additionalLayers]);

    //맵 변경 시에도 지적도 레이어 선택 및 정보 표시 
    useEffect(() => {
      if (mapInstance.current) {
        const map = mapInstance.current.map;
        
        // Remove old select interaction if it exists
        if (mapInstance.current.selectInteraction) {
          map.removeInteraction(mapInstance.current.selectInteraction);
        }
    
        // Create a new select interaction
        mapInstance.current.selectInteraction = new Select({
          layers: [mapInstance.current.layers.cadastralvectorLayer],
         
        });
    
        // Add the new select interaction to the map
        map.addInteraction(mapInstance.current.selectInteraction);
    
        // Remove old popup overlay if it exists
        if (mapInstance.current.popupOverlay) {
          map.removeOverlay(mapInstance.current.popupOverlay);
        }
    
        // Create and add a new popup overlay
        mapInstance.current.popupOverlay = new Overlay({
          element: popupRef.current,
          positioning: 'bottom-center',
          stopEvent: false,
          offset: [0, -10],
        });
        map.addOverlay(mapInstance.current.popupOverlay);
    
        // Handle feature selection
        const handleSelect = (event) => {
          const selected = event.selected[0];
          if (selected) {
            const properties = selected.getProperties();
            setSelectedFeature(selected);
            setPopupContent(`PNU: ${properties.PNU}, 지번: ${properties.JIBUN}`);
    
            // Set popup position to the clicked coordinates
            const coordinates = selected.getGeometry().getCoordinates();
            mapInstance.current.popupOverlay.setPosition(coordinates);
          } else {
            setSelectedFeature(null);
            setPopupContent('');
            mapInstance.current.popupOverlay.setPosition(undefined);
          }
        };
    
        mapInstance.current.selectInteraction.on('select', handleSelect);
    
        // Cleanup function
        return () => {
          map.removeInteraction(mapInstance.current.selectInteraction);
          if (mapInstance.current.popupOverlay) {
            map.removeOverlay(mapInstance.current.popupOverlay);
            mapInstance.current.popupOverlay = null;
          }
        };
      }
    }, [mapType]); // Depend on mapType to re-create the interaction on mode change
    //지적도 레이어 선택 
    useEffect(() => {
      if (mapInstance.current) {
        const map = mapInstance.current.map;
    
        // Ensure that the popup is positioned correctly when the selected feature changes
        if (selectedFeature) {
          const coordinates = selectedFeature.getGeometry().getCoordinates();
          mapInstance.current.popupOverlay.setPosition(coordinates);
        }
      }
    }, [selectedFeature]); // Ensure popup position updates when selectedFeature changes
    
    
    

    const handleLayerVisibility = (layer) => {
      setVisibleLayers((prevState) => ({
        ...prevState,
        [layer]: !prevState[layer],
      }));
    };

    const handleAdditionalLayerVisibility = (layerName) => {
      setAdditionalLayers((prevState) => ({
        ...prevState,
        [layerName]: !prevState[layerName],
      }));
    };
    //지도 위 거리,면적 측정 버튼 이벤트
    const handleMeasureButtonClick = (type) => {
      if (mapInstance.current.draw) {
        mapInstance.current.map.removeInteraction(mapInstance.current.draw);
      }
      addInteraction(type);
    };


    /////현재 화면 screenshot 코드
    //screenshot을 할 영역 = divRef
    const divRef = useRef(null);
    // screenshot버튼 이벤트
    const handleDownload = async () => {
      if (!divRef.current) return;

      try {
        const div = divRef.current;
        const canvas = await html2canvas(div, { scale: 2 });
        canvas.toBlob((blob) => {
          if (blob !== null) {
            saveAs(blob, "result.png");
          }
        });
      } catch (error) {
        console.error("Error converting div to image:", error);
      }
    };
   
    return (
      <>
      <Container ref={divRef}>
        <Yongdammeuncontrol onLayerToggle={handleAdditionalLayerVisibility} />
        <YongdamMapcontrol onSelectMapType={setMapType} onLayerToggle={handleLayerVisibility} onMeasureDistance={() => handleMeasureButtonClick('LineString')} onMeasureArea={() => handleMeasureButtonClick('Polygon')} onClearMeasurements={clearMeasurements} onCapture= {handleDownload}/>
          <div ref={mapRef} style={{ width: '100%', height: '100vh' }} ></div>
          {selectedFeature && (
            <div id="popup" class="ol-popup" ref={popupRef}>
              {/* <a href="#" id="popup-closer" class="ol-popup-closer"></a> */}
              <div id="popup-content"> {popupContent}</div>
            </div>
          )}
        </Container>
      </>
    );
  };

  export default YongdamMap;
  
 

  const Container = styled.div`
  display:flex;
  .ol-tooltip {
          position: relative;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          color: white;
          padding: 4px 8px;
          opacity: 0.7;
          white-space: nowrap;
          font-size: 12px;
          cursor: default;
          user-select: none;
        }
        .ol-tooltip-measure {
          opacity: 1;
          font-weight: bold;
        }
        .ol-tooltip-static {
          background-color: #ffcc33;
          color: black;
          border: 1px solid white;
        }
        .ol-tooltip-measure:before,
        .ol-tooltip-static:before {
          border-top: 6px solid rgba(0, 0, 0, 0.5);
          border-right: 6px solid transparent;
          border-left: 6px solid transparent;
          content: "";
          position: absolute;
          bottom: -6px;
          margin-left: -7px;
          left: 50%;
        }
        .ol-tooltip-static:before {
          border-top-color: #ffcc33;
        }

        .ol-popup {
          position: absolute;
          background-color: white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid #cccccc;
          top:10px;
          right:30px;
          min-width: 280px;
          z-index:100000;
        }
        .ol-popup:after, .ol-popup:before {
          top: 100%;
          border: solid transparent;
          content: " ";
          height: 0;
          width: 0;
          position: absolute;
          pointer-events: none;
        }
        .ol-popup:after {
          border-top-color: white;
          border-width: 10px;
          left: 48px;
          margin-left: -10px;
        }
        .ol-popup:before {
          border-top-color: #cccccc;
          border-width: 11px;
          left: 48px;
          margin-left: -11px;
        }
        .ol-popup-closer {
          text-decoration: none;
          position: absolute;
          top: 2px;
          right: 8px;
        }
        .ol-popup-closer:after {
          content: "✖";
        }
  `

  const geojsonData = {
    "type": "FeatureCollection",
    "features": [
{ "type": "Feature", "properties": { "PNU": "5272032021113880000", "JIBUN": "1388답", "BCHK": "1", "SGG_OID": "575606", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.54596149962623, 35.89017585648476 ], [ 127.545998087194562, 35.890139470123025 ], [ 127.54594255680496, 35.890134837182458 ], [ 127.545841356226802, 35.890151914597162 ], [ 127.545735133513304, 35.890173124299771 ], [ 127.54561997121256, 35.890181135316404 ], [ 127.545606316632188, 35.890186189998857 ], [ 127.545589074872282, 35.890193045368662 ], [ 127.545659379539501, 35.890196016355851 ], [ 127.545805984812588, 35.890196091053113 ], [ 127.54596149962623, 35.89017585648476 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113830020", "JIBUN": "1383-20답", "BCHK": "1", "SGG_OID": "575630", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.545243693073061, 35.890002457893353 ], [ 127.545311417891597, 35.88997154544267 ], [ 127.545340977810341, 35.889909974637028 ], [ 127.545355481294692, 35.889875202533148 ], [ 127.545384249445306, 35.889806371374206 ], [ 127.545402228162558, 35.889761534793941 ], [ 127.545413704066647, 35.889716466302538 ], [ 127.545421864366816, 35.889682137482048 ], [ 127.545470723074018, 35.889650562356245 ], [ 127.545614539392759, 35.889615465838098 ], [ 127.545637129545341, 35.889616580158844 ], [ 127.545680457571393, 35.889598990083073 ], [ 127.545749572367896, 35.889562492463519 ], [ 127.54577097906261, 35.889539567260613 ], [ 127.545800172939522, 35.889529773758838 ], [ 127.545743863871778, 35.889529434115794 ], [ 127.545716050996006, 35.889529019403739 ], [ 127.545604420266486, 35.889559346921651 ], [ 127.545505658447425, 35.889558838986318 ], [ 127.545187555576632, 35.889636829994089 ], [ 127.545046111866171, 35.889701493688641 ], [ 127.54504094231514, 35.889718081722151 ], [ 127.544979834828652, 35.889785418899564 ], [ 127.544953611185889, 35.889814989810382 ], [ 127.544966953500833, 35.88986958913955 ], [ 127.545087647491741, 35.889930434850363 ], [ 127.545197638654685, 35.889977702266464 ], [ 127.545243693073061, 35.890002457893353 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113830019", "JIBUN": "1383-19답", "BCHK": "1", "SGG_OID": "575619", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.545350692825821, 35.890099748053451 ], [ 127.545414545668493, 35.890088905481164 ], [ 127.545491227063522, 35.8900834031489 ], [ 127.545602497531803, 35.890027824857761 ], [ 127.545707466987409, 35.889985342872713 ], [ 127.545745791122442, 35.889955095117685 ], [ 127.545803939607396, 35.889918304692053 ], [ 127.545889143536513, 35.889873199414609 ], [ 127.545949785005291, 35.889820400757202 ], [ 127.545981497792326, 35.889766002851644 ], [ 127.545958354418602, 35.889687322095888 ], [ 127.545919993351632, 35.889631250118583 ], [ 127.545905874418168, 35.88963317065371 ], [ 127.545879490988966, 35.889623160395459 ], [ 127.545842464049386, 35.889592091524442 ], [ 127.545820552332984, 35.889549319239542 ], [ 127.545820484852555, 35.889524896166776 ], [ 127.545807992402587, 35.88952981943298 ], [ 127.545800172939522, 35.889529773758838 ], [ 127.54577097906261, 35.889539567260613 ], [ 127.545749572367896, 35.889562492463519 ], [ 127.545680457571393, 35.889598990083073 ], [ 127.545637129545341, 35.889616580158844 ], [ 127.545614539392759, 35.889615465838098 ], [ 127.545470723074018, 35.889650562356245 ], [ 127.545421864366816, 35.889682137482048 ], [ 127.545413704066647, 35.889716466302538 ], [ 127.545402228162558, 35.889761534793941 ], [ 127.545384249445306, 35.889806371374206 ], [ 127.545355481294692, 35.889875202533148 ], [ 127.545340977810341, 35.889909974637028 ], [ 127.545311417891597, 35.88997154544267 ], [ 127.545243693073061, 35.890002457893353 ], [ 127.545282048074185, 35.890023670472402 ], [ 127.545342633155855, 35.890082399790337 ], [ 127.545350692825821, 35.890099748053451 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113830013", "JIBUN": "1383-13답", "BCHK": "1", "SGG_OID": "575667", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.547192576840175, 35.889556792109332 ], [ 127.54729865537081, 35.889451812296798 ], [ 127.547378773638243, 35.889398527867549 ], [ 127.547421402324048, 35.889316240924622 ], [ 127.547395430715355, 35.889241998347835 ], [ 127.547406335794037, 35.889178484049474 ], [ 127.547335056587229, 35.889201221636846 ], [ 127.547294088218152, 35.889222046019398 ], [ 127.547219786056431, 35.889225510917974 ], [ 127.547158831083578, 35.889208213842018 ], [ 127.547095317320171, 35.889231213414206 ], [ 127.547038650556118, 35.889249738781018 ], [ 127.547020616253874, 35.889255642650319 ], [ 127.546971877533693, 35.889293283149335 ], [ 127.546964084097439, 35.889318021303431 ], [ 127.546961363447068, 35.889326658446215 ], [ 127.546960572223483, 35.889329176475883 ], [ 127.546808301298228, 35.889436186213445 ], [ 127.546819703609103, 35.889454807963681 ], [ 127.546839720370272, 35.889487657096225 ], [ 127.546904373024915, 35.88951440948604 ], [ 127.546977793739131, 35.889530947114636 ], [ 127.547021725212176, 35.889544869885505 ], [ 127.547080880354628, 35.889593601151326 ], [ 127.547117972763488, 35.889567954835776 ], [ 127.547167216659531, 35.889553888202762 ], [ 127.547192576840175, 35.889556792109332 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113830009", "JIBUN": "1383-9답", "BCHK": "1", "SGG_OID": "575680", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548045472048727, 35.88936156452629 ], [ 127.548068223236953, 35.88932326679911 ], [ 127.548124664739149, 35.889180146701626 ], [ 127.5481377866504, 35.889097642311206 ], [ 127.548154765436223, 35.888901132583996 ], [ 127.548173736010639, 35.888831669425763 ], [ 127.548205951583824, 35.888779801104427 ], [ 127.548290515638385, 35.888714491423777 ], [ 127.548290408064616, 35.888710120939812 ], [ 127.548256772789856, 35.88872462166885 ], [ 127.548191620200299, 35.888744339784388 ], [ 127.548021436991533, 35.888823007741657 ], [ 127.54787152021558, 35.888843516909581 ], [ 127.547795306934916, 35.888844413333942 ], [ 127.54777316923024, 35.8888930183127 ], [ 127.547745803701019, 35.888951254193039 ], [ 127.54772735967623, 35.889020038965562 ], [ 127.547739469777568, 35.889109440144864 ], [ 127.547623666897834, 35.889199711403272 ], [ 127.547606258511593, 35.88923385711405 ], [ 127.547623439903404, 35.889289231774271 ], [ 127.547620456607689, 35.889330575821866 ], [ 127.547609427985307, 35.889382527897482 ], [ 127.547540573376736, 35.88939224980988 ], [ 127.547536257718676, 35.889470216952667 ], [ 127.547678001759976, 35.889464156058963 ], [ 127.547993680753166, 35.889393307248994 ], [ 127.548035277302233, 35.889378490985123 ], [ 127.548044530444386, 35.889363145966364 ], [ 127.548045472048727, 35.88936156452629 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113830006", "JIBUN": "1383-6답", "BCHK": "1", "SGG_OID": "752093", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548646459918501, 35.888556641940085 ], [ 127.548630194988846, 35.888560510218944 ], [ 127.548542729938788, 35.888590432970659 ], [ 127.548521404022111, 35.888728003981505 ], [ 127.548450836676594, 35.888953993764012 ], [ 127.548437301249066, 35.889056840870147 ], [ 127.548427534799146, 35.88914569270807 ], [ 127.548419490119187, 35.889206301117511 ], [ 127.548400856423669, 35.889290912478906 ], [ 127.548399814755626, 35.889295657700309 ], [ 127.548406254891248, 35.889354424724289 ], [ 127.548502463195874, 35.889294487290115 ], [ 127.54849637068564, 35.889268559567277 ], [ 127.548509859723183, 35.889062359427541 ], [ 127.548564989186929, 35.888842955837262 ], [ 127.54861071907942, 35.888781842301917 ], [ 127.548625703536118, 35.888664280470913 ], [ 127.54867871134428, 35.888577655935315 ], [ 127.548646459918501, 35.888556641940085 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113150000", "JIBUN": "1315답", "BCHK": "1", "SGG_OID": "575491", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.549369201332752, 35.891601519325746 ], [ 127.549430838512578, 35.89155514016646 ], [ 127.549462078459214, 35.891504699926784 ], [ 127.549418782425121, 35.89142086665435 ], [ 127.549410290761671, 35.89136668732241 ], [ 127.549429089871396, 35.891310995592164 ], [ 127.549498311053597, 35.891259435767168 ], [ 127.549507335567611, 35.891217352152651 ], [ 127.549482413910482, 35.891178523659377 ], [ 127.54938332338385, 35.891182039912472 ], [ 127.549329348457704, 35.891165388033954 ], [ 127.54930977296992, 35.891206456307827 ], [ 127.549359570134087, 35.891287078622113 ], [ 127.549376011229938, 35.891389086087081 ], [ 127.549355728651747, 35.891454526885042 ], [ 127.549345379342782, 35.891531007513265 ], [ 127.549350864296954, 35.891565139156818 ], [ 127.549369201332752, 35.891601519325746 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113140000", "JIBUN": "1314답", "BCHK": "1", "SGG_OID": "575472", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.549218601436721, 35.891734209549732 ], [ 127.549270613551684, 35.891703826158817 ], [ 127.549355715432114, 35.891614982151005 ], [ 127.549329831059723, 35.891579501588069 ], [ 127.54931637192108, 35.891535754129478 ], [ 127.549329719099703, 35.891458746127689 ], [ 127.549354305155944, 35.891389374360209 ], [ 127.549342023329004, 35.891294656905544 ], [ 127.549295821942906, 35.891221525440137 ], [ 127.549241592179641, 35.89124506058689 ], [ 127.54919546754347, 35.891265070983593 ], [ 127.549186673805721, 35.891326214563747 ], [ 127.54922976216524, 35.891413707868345 ], [ 127.549195018426786, 35.891474852629244 ], [ 127.549218601436721, 35.891734209549732 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114230000", "JIBUN": "1423답", "BCHK": "1", "SGG_OID": "575273", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546750270728765, 35.893009922236402 ], [ 127.546735249343797, 35.892998229365212 ], [ 127.546714421704422, 35.892968394030952 ], [ 127.54672004757569, 35.89294245809662 ], [ 127.546750512138104, 35.892907829678556 ], [ 127.546767159198467, 35.89286747808174 ], [ 127.546806669535684, 35.892824327995569 ], [ 127.546815323861495, 35.892787788839975 ], [ 127.546809432090086, 35.892731335434796 ], [ 127.546786295760711, 35.892684621521873 ], [ 127.546754425406746, 35.892635360722721 ], [ 127.546712858795004, 35.892622517622371 ], [ 127.546582183376103, 35.892638071201311 ], [ 127.546499345640555, 35.892629633090763 ], [ 127.546417977759234, 35.892609409162382 ], [ 127.546369731206724, 35.892593135522731 ], [ 127.546280322725138, 35.892561637526789 ], [ 127.546128401156381, 35.892563822588066 ], [ 127.546023760658684, 35.892641866028022 ], [ 127.545969889021109, 35.89271313629304 ], [ 127.545905825656419, 35.892827801951839 ], [ 127.545938081138118, 35.892855729088637 ], [ 127.545982385228882, 35.892818685912872 ], [ 127.546042720149444, 35.892801676505464 ], [ 127.546265649254693, 35.892815734119552 ], [ 127.546363669119472, 35.892828600658191 ], [ 127.5465250325596, 35.892836817719278 ], [ 127.546563061084996, 35.892842467091768 ], [ 127.546607238152802, 35.892898422305272 ], [ 127.546627971907668, 35.892948499736093 ], [ 127.546606167115144, 35.892979691177821 ], [ 127.546681016078097, 35.892994077552849 ], [ 127.546736464106232, 35.89303324569164 ], [ 127.546750270728765, 35.893009922236402 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114210002", "JIBUN": "1421-2전", "BCHK": "1", "SGG_OID": "575437", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546003552264793, 35.891849973635352 ], [ 127.546001543605698, 35.891904390076803 ], [ 127.546014334424655, 35.892006072089906 ], [ 127.546035964615371, 35.892038346250573 ], [ 127.546159028756961, 35.892050072006953 ], [ 127.546256189280243, 35.892039492497958 ], [ 127.546261244737934, 35.891844587311134 ], [ 127.546263079172746, 35.89176961456927 ], [ 127.546263774956429, 35.891593096243199 ], [ 127.546274267795056, 35.891563001596019 ], [ 127.546248401015305, 35.891547671816362 ], [ 127.54615754766472, 35.891602581322665 ], [ 127.546135929157259, 35.891615666102552 ], [ 127.546092307293975, 35.891676210359442 ], [ 127.546060252868728, 35.891743893978806 ], [ 127.546004942261135, 35.891811962408447 ], [ 127.546003552264793, 35.891849973635352 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114210001", "JIBUN": "1421-1전", "BCHK": "1", "SGG_OID": "575405", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546562585762345, 35.892186562193544 ], [ 127.546603985389538, 35.892078136428125 ], [ 127.54665397992953, 35.892031153631834 ], [ 127.546612108139158, 35.892010903758113 ], [ 127.546550747128421, 35.892008992250652 ], [ 127.546493234296349, 35.891983559138104 ], [ 127.546442004954017, 35.89193440411718 ], [ 127.546418283027037, 35.891905609260583 ], [ 127.546361849491319, 35.891845320572664 ], [ 127.546324985032896, 35.891805815604705 ], [ 127.546263079172746, 35.89176961456927 ], [ 127.546261244737934, 35.891844587311134 ], [ 127.546256189280243, 35.892039492497958 ], [ 127.546258058354141, 35.892087600758472 ], [ 127.546239577988729, 35.892133584288651 ], [ 127.546229583360756, 35.892241272682405 ], [ 127.546215841805804, 35.892272481559218 ], [ 127.546213652550151, 35.892323149696942 ], [ 127.546380244943052, 35.892252494520584 ], [ 127.54649334918885, 35.892226575627397 ], [ 127.546562585762345, 35.892186562193544 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114200000", "JIBUN": "1420답", "BCHK": "1", "SGG_OID": "575415", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.547007509208811, 35.89224356380047 ], [ 127.54700151154556, 35.892218509776896 ], [ 127.546959270436645, 35.892197729976623 ], [ 127.546937929238524, 35.892170510579611 ], [ 127.546918662809304, 35.892113135571506 ], [ 127.546940240185819, 35.892042381050949 ], [ 127.546991220208497, 35.892035759787312 ], [ 127.547052268276431, 35.891958147845159 ], [ 127.547070856020994, 35.891890759460281 ], [ 127.547094097245775, 35.891852685010569 ], [ 127.54706726653805, 35.89177760815388 ], [ 127.547019590503737, 35.891742730766005 ], [ 127.54689837054444, 35.891738234402155 ], [ 127.546737583437064, 35.891768524829438 ], [ 127.546713664869031, 35.891832215279585 ], [ 127.54671184463507, 35.891863964908779 ], [ 127.546727742803341, 35.891887261664692 ], [ 127.546721253305904, 35.891927765421684 ], [ 127.546749121064551, 35.891945753658071 ], [ 127.546718999352294, 35.892004488459918 ], [ 127.54665397992953, 35.892031153631834 ], [ 127.546603985389538, 35.892078136428125 ], [ 127.546562585762345, 35.892186562193544 ], [ 127.546638714969063, 35.892161622070482 ], [ 127.546700522957977, 35.892156015234811 ], [ 127.54682511432226, 35.892185289359027 ], [ 127.546885069018373, 35.892214676639682 ], [ 127.546961494886247, 35.892239455892081 ], [ 127.547007509208811, 35.89224356380047 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114190000", "JIBUN": "1419전", "BCHK": "1", "SGG_OID": "575465", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546737583437064, 35.891768524829438 ], [ 127.54689837054444, 35.891738234402155 ], [ 127.547019590503737, 35.891742730766005 ], [ 127.54706726653805, 35.89177760815388 ], [ 127.547094299037653, 35.89175618024823 ], [ 127.547093526481504, 35.891706534925802 ], [ 127.5471279173683, 35.891669581419194 ], [ 127.547141066795206, 35.891618322730345 ], [ 127.54713885405566, 35.891570243080245 ], [ 127.547139461713016, 35.89151029942456 ], [ 127.547098024128587, 35.891500042400644 ], [ 127.547088782401147, 35.891497741181581 ], [ 127.546808981149297, 35.891572119783248 ], [ 127.546775843666353, 35.891612591323522 ], [ 127.546754632918748, 35.891696439046306 ], [ 127.546747569878576, 35.891724364220622 ], [ 127.546737583437064, 35.891768524829438 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114150001", "JIBUN": "1415-1답", "BCHK": "1", "SGG_OID": "575428", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.547562903392262, 35.892115282102402 ], [ 127.547587589829007, 35.892095757339227 ], [ 127.547649553785021, 35.892083849700207 ], [ 127.547651686076307, 35.892065337727075 ], [ 127.547764651929867, 35.891998412247553 ], [ 127.54783530514851, 35.891980940443766 ], [ 127.547941530632201, 35.892035621550214 ], [ 127.548038402522181, 35.892012091221297 ], [ 127.548028599003302, 35.891971571415944 ], [ 127.548006960540164, 35.891957547586856 ], [ 127.547961961148516, 35.891928660596591 ], [ 127.547967912321326, 35.891885662814069 ], [ 127.547952890338195, 35.891860983353503 ], [ 127.547926678239463, 35.89183092037824 ], [ 127.547823597133217, 35.891780875305791 ], [ 127.547672497597887, 35.891725136441693 ], [ 127.547548257983749, 35.891709929813601 ], [ 127.54749614806866, 35.891779399306095 ], [ 127.547458203080055, 35.891806825033996 ], [ 127.547446178687693, 35.891829951213609 ], [ 127.547437147148869, 35.891845367272836 ], [ 127.547447664550788, 35.891885054750794 ], [ 127.547429592908841, 35.891937228063355 ], [ 127.547405424849032, 35.891962887823084 ], [ 127.547390489586718, 35.89199922125286 ], [ 127.547420042371385, 35.892041607015635 ], [ 127.5474426091412, 35.892121488708646 ], [ 127.547491155516099, 35.892126594301132 ], [ 127.547562903392262, 35.892115282102402 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114140005", "JIBUN": "1414-5전", "BCHK": "1", "SGG_OID": "575497", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.547317209479502, 35.891543621400274 ], [ 127.54737663810343, 35.89154804672355 ], [ 127.547418332393249, 35.891561808273934 ], [ 127.547414393639727, 35.891557572365365 ], [ 127.547390619128976, 35.891474361592302 ], [ 127.547396867134083, 35.891309993660961 ], [ 127.547436897584049, 35.891255647703524 ], [ 127.547383873029446, 35.891261224006904 ], [ 127.547365961398114, 35.89128667507827 ], [ 127.547328778708888, 35.891299272046467 ], [ 127.547324162546332, 35.891351249012111 ], [ 127.547318732761951, 35.891492848117693 ], [ 127.547317209479502, 35.891543621400274 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112860000", "JIBUN": "1286답", "BCHK": "1", "SGG_OID": "575212", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.550747157306986, 35.893254788510284 ], [ 127.550938065028802, 35.893196236520701 ], [ 127.551044666199957, 35.893165305215327 ], [ 127.55116529915702, 35.893155037907732 ], [ 127.551288650127262, 35.893134204623166 ], [ 127.551362379545566, 35.893100269201128 ], [ 127.551437037814267, 35.893029288891171 ], [ 127.551488105562015, 35.89298247041912 ], [ 127.551537194871543, 35.892912237994835 ], [ 127.551544063597845, 35.892882069375901 ], [ 127.551529821451069, 35.892872644640093 ], [ 127.551511757314955, 35.892834271843988 ], [ 127.551405872525265, 35.89283897446316 ], [ 127.551289379318277, 35.892851998851583 ], [ 127.551155772690819, 35.892853610755125 ], [ 127.551079458834934, 35.892866144630439 ], [ 127.550947056643608, 35.892876970382964 ], [ 127.550850753876318, 35.892859458395094 ], [ 127.550748809926532, 35.892867071410159 ], [ 127.550724448050985, 35.892872572180579 ], [ 127.550707396187121, 35.89287967975897 ], [ 127.55066734344787, 35.892917759669245 ], [ 127.550752830340215, 35.892990530675128 ], [ 127.550803707178545, 35.89307796072405 ], [ 127.550795551706287, 35.893120716369509 ], [ 127.550775180821859, 35.893181282130001 ], [ 127.550744583416673, 35.893222094612007 ], [ 127.550747157306986, 35.893254788510284 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114140002", "JIBUN": "1414-2전", "BCHK": "1", "SGG_OID": "575453", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.547458203080055, 35.891806825033996 ], [ 127.54749614806866, 35.891779399306095 ], [ 127.547548257983749, 35.891709929813601 ], [ 127.54754579550557, 35.891709391258132 ], [ 127.547508078341949, 35.891644169390553 ], [ 127.547469077688206, 35.891617841475096 ], [ 127.547447008664989, 35.891592698306546 ], [ 127.547386465923196, 35.891701878286469 ], [ 127.547317311380098, 35.891671424547972 ], [ 127.547267418557624, 35.891815442730248 ], [ 127.547268521306236, 35.891918024874009 ], [ 127.547366581997707, 35.891916002074154 ], [ 127.547458203080055, 35.891806825033996 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114100000", "JIBUN": "1410전", "BCHK": "1", "SGG_OID": "575373", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548483824842421, 35.892497467290248 ], [ 127.548532675484481, 35.892538710441819 ], [ 127.54857416976462, 35.892547443627123 ], [ 127.548643839583804, 35.892490024252695 ], [ 127.548649355058629, 35.892486772718584 ], [ 127.548683550967624, 35.892466609596738 ], [ 127.548730392369862, 35.892404175182939 ], [ 127.548789816485225, 35.892303236893675 ], [ 127.54887571012479, 35.892181215303737 ], [ 127.548923668577117, 35.892047803768492 ], [ 127.54892819707716, 35.892034724288145 ], [ 127.548956291390837, 35.8919536206107 ], [ 127.548848080378903, 35.89193077192526 ], [ 127.54883562638193, 35.89202015871556 ], [ 127.54878753375327, 35.89210351644995 ], [ 127.548664175000795, 35.89226634518068 ], [ 127.548604339629861, 35.892291428657977 ], [ 127.548411668221448, 35.892380131157658 ], [ 127.548459839678927, 35.892449856336441 ], [ 127.548483824842421, 35.892497467290248 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114090000", "JIBUN": "1409전", "BCHK": "1", "SGG_OID": "575448", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548848080378903, 35.89193077192526 ], [ 127.548956291390837, 35.8919536206107 ], [ 127.548976606495273, 35.891899273891291 ], [ 127.54901671622919, 35.891883905303125 ], [ 127.549068164607533, 35.891884220503826 ], [ 127.549172572369983, 35.891795477865173 ], [ 127.549218601436721, 35.891734209549732 ], [ 127.549195018426786, 35.891474852629244 ], [ 127.549055954841251, 35.891585995679208 ], [ 127.54899056136486, 35.891622514275888 ], [ 127.548947265448987, 35.891672171201755 ], [ 127.548916443933749, 35.8916820900453 ], [ 127.548890346242757, 35.891728225858451 ], [ 127.54887183444022, 35.891816072122275 ], [ 127.548848080378903, 35.89193077192526 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114040000", "JIBUN": "1404전", "BCHK": "1", "SGG_OID": "575561", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.54750976667556, 35.890699590141935 ], [ 127.547586735122749, 35.890672924251618 ], [ 127.547545696596202, 35.8905416842561 ], [ 127.547420433668535, 35.890419082383588 ], [ 127.547418275310818, 35.89037248951437 ], [ 127.547416242608023, 35.890336134063304 ], [ 127.547324087005933, 35.890360741958339 ], [ 127.547241017711428, 35.890387624661074 ], [ 127.547266377316461, 35.890471098647424 ], [ 127.547310661975487, 35.890592879084473 ], [ 127.547458661042924, 35.890655517926277 ], [ 127.54750976667556, 35.890699590141935 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021114000001", "JIBUN": "1400-1답", "BCHK": "1", "SGG_OID": "575566", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.545439851004232, 35.890454591769355 ], [ 127.545545074233146, 35.890551105719666 ], [ 127.545680844284618, 35.89062988913539 ], [ 127.54588497657457, 35.890638111560477 ], [ 127.546005450680894, 35.890575984290841 ], [ 127.546078545621043, 35.890548066189304 ], [ 127.546142437867587, 35.890523533344343 ], [ 127.54632309879571, 35.890287303272636 ], [ 127.546460285529491, 35.890236599448016 ], [ 127.546421274727479, 35.890223185875996 ], [ 127.546375769068064, 35.890210702987915 ], [ 127.546285652984082, 35.890216176701159 ], [ 127.546158054652821, 35.89019855052981 ], [ 127.546121111796452, 35.890181432432676 ], [ 127.546045080567922, 35.890179992736336 ], [ 127.545915882980211, 35.890198918498598 ], [ 127.545804675574175, 35.89021516704674 ], [ 127.545660832365172, 35.890214106503848 ], [ 127.545583834183532, 35.890207317580895 ], [ 127.545475431861419, 35.890207826625897 ], [ 127.545422749152962, 35.890203387830752 ], [ 127.545408810532294, 35.89023330875694 ], [ 127.545440112167739, 35.890298461228774 ], [ 127.545439835022478, 35.890371291007909 ], [ 127.545417245918074, 35.890428657562964 ], [ 127.545439851004232, 35.890454591769355 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021113990001", "JIBUN": "1399-1답", "BCHK": "1", "SGG_OID": "575581", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.54752662459012, 35.890323898256639 ], [ 127.54761864751201, 35.890310628301805 ], [ 127.547724276308159, 35.890275558696082 ], [ 127.547783602186797, 35.890202280111509 ], [ 127.547773422976348, 35.890144097843127 ], [ 127.547705694733509, 35.890111501909445 ], [ 127.547641252617041, 35.890017138610879 ], [ 127.547742595614181, 35.889924130277592 ], [ 127.547785339175093, 35.889898890647025 ], [ 127.54788008866052, 35.889845692547034 ], [ 127.547668054622719, 35.88990258736672 ], [ 127.547589026178059, 35.889969466614552 ], [ 127.547461022902525, 35.890092886402208 ], [ 127.547358979931531, 35.890167900085508 ], [ 127.547314927373606, 35.890196101552434 ], [ 127.547254957928018, 35.890241832184572 ], [ 127.547141068785976, 35.890303029557842 ], [ 127.54697091162474, 35.890394204999218 ], [ 127.54698291153845, 35.89040465885882 ], [ 127.547022059188933, 35.89040893313831 ], [ 127.54710852098043, 35.890401907329881 ], [ 127.54726571880154, 35.890365459285505 ], [ 127.547390284194336, 35.890321949506223 ], [ 127.547440025821913, 35.890322246129081 ], [ 127.54752662459012, 35.890323898256639 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111900008", "JIBUN": "1190-8전", "BCHK": "1", "SGG_OID": "575068", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548048102271679, 35.893534559850941 ], [ 127.548246519272311, 35.893696283866731 ], [ 127.548338266277, 35.893444242477877 ], [ 127.548243197185101, 35.893449920469592 ], [ 127.548171475729177, 35.893473291427085 ], [ 127.548071952281674, 35.893449699551461 ], [ 127.548048102271679, 35.893534559850941 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111900005", "JIBUN": "1190-5전", "BCHK": "1", "SGG_OID": "574794", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548409860446654, 35.89459564449001 ], [ 127.548444572110355, 35.894545657363253 ], [ 127.548344092404733, 35.894399331452099 ], [ 127.548439031958452, 35.894247447287242 ], [ 127.548451509943618, 35.894154996273663 ], [ 127.548274294136732, 35.894146799912399 ], [ 127.548260004086018, 35.894193206260866 ], [ 127.548271262587349, 35.894200427938564 ], [ 127.54828688198667, 35.894232981385272 ], [ 127.548256106709246, 35.894270720845746 ], [ 127.548174571880821, 35.89429096414753 ], [ 127.548127726986948, 35.894262887732239 ], [ 127.54802624495386, 35.894246154094901 ], [ 127.547909515856389, 35.894254246553324 ], [ 127.547830689942259, 35.894296386219992 ], [ 127.547811011406367, 35.894327514126878 ], [ 127.547911383012263, 35.894382510247702 ], [ 127.548027337971604, 35.8944712495517 ], [ 127.547963730876475, 35.894513473257895 ], [ 127.547904316077791, 35.894590366231732 ], [ 127.547900796599947, 35.894618158177941 ], [ 127.547963491313652, 35.894609158024906 ], [ 127.548058565226228, 35.894565304090399 ], [ 127.548176288460738, 35.894542255541211 ], [ 127.548315441135927, 35.894588098528594 ], [ 127.548409860446654, 35.89459564449001 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111870000", "JIBUN": "1187전", "BCHK": "1", "SGG_OID": "575137", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548338266277, 35.893444242477877 ], [ 127.548434383325485, 35.893499140384414 ], [ 127.548432020276664, 35.893413227784805 ], [ 127.548459836330338, 35.893283477056144 ], [ 127.548455428733249, 35.893170843253408 ], [ 127.548333884443764, 35.893174271646636 ], [ 127.548260643938633, 35.89316031157248 ], [ 127.548125003914592, 35.893151393972992 ], [ 127.548044266970422, 35.89322471606156 ], [ 127.548048533537667, 35.893345921229439 ], [ 127.548071952281674, 35.893449699551461 ], [ 127.548171475729177, 35.893473291427085 ], [ 127.548243197185101, 35.893449920469592 ], [ 127.548338266277, 35.893444242477877 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112160000", "JIBUN": "1216답", "BCHK": "1", "SGG_OID": "574800", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.549365828248455, 35.894524812601269 ], [ 127.549356987276724, 35.894559838709753 ], [ 127.549363348175731, 35.894598896071059 ], [ 127.549408362516928, 35.894547681057219 ], [ 127.549476588330066, 35.89445735485404 ], [ 127.54949391361238, 35.894411105750265 ], [ 127.549563516843762, 35.894313356082186 ], [ 127.549656896743613, 35.89425209683688 ], [ 127.54972645468898, 35.894220119103771 ], [ 127.549921954877192, 35.894146082641953 ], [ 127.549973072471985, 35.894143190577616 ], [ 127.549995844051537, 35.894151143585269 ], [ 127.550095734266719, 35.894108888260945 ], [ 127.550173007931008, 35.894100424186007 ], [ 127.550196915316448, 35.894046655681819 ], [ 127.550176445443569, 35.894015927106693 ], [ 127.55015347328191, 35.893966058804331 ], [ 127.550086889234123, 35.893934567538707 ], [ 127.550044457215094, 35.893974667850657 ], [ 127.549966266548239, 35.893994689809446 ], [ 127.549887971227903, 35.893993118704813 ], [ 127.549858936865363, 35.893968386316438 ], [ 127.549804332737338, 35.893931450834188 ], [ 127.549743873210602, 35.89392396724304 ], [ 127.549600696585117, 35.893946673862082 ], [ 127.549459371700138, 35.893995408421219 ], [ 127.54940174872435, 35.894042742600526 ], [ 127.549362913280319, 35.894132285812788 ], [ 127.549366972006837, 35.89416515321065 ], [ 127.549370413084134, 35.894278773706368 ], [ 127.54939374900124, 35.894384706065644 ], [ 127.549387904999705, 35.89445120750834 ], [ 127.549378347358854, 35.894486705528159 ], [ 127.549365828248455, 35.894524812601269 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112120002", "JIBUN": "1212-2답", "BCHK": "1", "SGG_OID": "575100", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.549215534728191, 35.893582017565322 ], [ 127.549258350035913, 35.893539644692702 ], [ 127.549366260695479, 35.893468730298153 ], [ 127.549499342883195, 35.893477649151158 ], [ 127.549606078636344, 35.89350306346283 ], [ 127.549651109536654, 35.893523451072113 ], [ 127.549769179028416, 35.893597498002066 ], [ 127.549817757030993, 35.893605432369071 ], [ 127.549861092466784, 35.893530919014815 ], [ 127.549864849530223, 35.893449349476548 ], [ 127.549833092362803, 35.893468222049776 ], [ 127.549747631150893, 35.893442503542481 ], [ 127.549657987443126, 35.893359539850728 ], [ 127.54964474928336, 35.893307752455335 ], [ 127.549523384019082, 35.893293787478655 ], [ 127.54944785732684, 35.893292068266007 ], [ 127.549372750632273, 35.893333624200075 ], [ 127.549328881808961, 35.893348451289818 ], [ 127.549371986967245, 35.893235645854546 ], [ 127.549383080161562, 35.893173869940824 ], [ 127.549371053239213, 35.893138704698828 ], [ 127.549401251427042, 35.893097723150724 ], [ 127.54941653173664, 35.893052096214895 ], [ 127.549391932807467, 35.893050541158324 ], [ 127.549364203079321, 35.89309613475897 ], [ 127.549317532319975, 35.893167247488357 ], [ 127.549293587628355, 35.89318510194277 ], [ 127.549286772122244, 35.893149164900628 ], [ 127.549309583883201, 35.89303277501903 ], [ 127.549321921195514, 35.892968307765678 ], [ 127.549280771414587, 35.89299354967816 ], [ 127.549213857687022, 35.893004074811707 ], [ 127.549179049471121, 35.89298841694297 ], [ 127.549134362655252, 35.893024363534451 ], [ 127.549105429216795, 35.893043150942525 ], [ 127.549116554199387, 35.893125887296499 ], [ 127.549120336152271, 35.893153970434327 ], [ 127.549166424246394, 35.893152615716126 ], [ 127.549175034732414, 35.893254595797927 ], [ 127.54917002176775, 35.89329221801335 ], [ 127.549176967306963, 35.893311661941979 ], [ 127.549218671363477, 35.893305757954167 ], [ 127.549223013600567, 35.893337993207254 ], [ 127.549216346825276, 35.893370278666751 ], [ 127.549226399830559, 35.893395449261739 ], [ 127.549237705554745, 35.893393451041995 ], [ 127.54925420679028, 35.893426964661622 ], [ 127.549239004756558, 35.89346629161345 ], [ 127.549219585198287, 35.893501140654919 ], [ 127.549228871260041, 35.893538778770413 ], [ 127.549215534728191, 35.893582017565322 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112030026", "JIBUN": "1203-26전", "BCHK": "1", "SGG_OID": "575427", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.549228524481947, 35.892142548184665 ], [ 127.549293196412236, 35.892136296092666 ], [ 127.549381201884486, 35.892107127365861 ], [ 127.549403200257302, 35.892055999305491 ], [ 127.54940747732887, 35.891940532084085 ], [ 127.549436844344768, 35.891854537816144 ], [ 127.549476019049507, 35.891745283077263 ], [ 127.549532706755087, 35.891660515975566 ], [ 127.549474093930286, 35.891649139505482 ], [ 127.549445508733072, 35.891710346360568 ], [ 127.54938810730502, 35.891845865004086 ], [ 127.549334271089378, 35.891908899358498 ], [ 127.549307990791007, 35.891981559325764 ], [ 127.549239314654073, 35.892064118903626 ], [ 127.549228524481947, 35.892142548184665 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112030025", "JIBUN": "1203-25전", "BCHK": "1", "SGG_OID": "575403", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.549064249524378, 35.892293604576913 ], [ 127.549228524481947, 35.892142548184665 ], [ 127.549239314654073, 35.892064118903626 ], [ 127.549307990791007, 35.891981559325764 ], [ 127.549334271089378, 35.891908899358498 ], [ 127.54938810730502, 35.891845865004086 ], [ 127.549445508733072, 35.891710346360568 ], [ 127.549378204074827, 35.891689690767706 ], [ 127.549373299726895, 35.891728583241139 ], [ 127.549229543966149, 35.89197217479996 ], [ 127.549158243005806, 35.892146428546305 ], [ 127.549070153905333, 35.892222984224134 ], [ 127.549053354784945, 35.892242671602688 ], [ 127.549002550223008, 35.892290857720759 ], [ 127.549026612376053, 35.892325481474991 ], [ 127.549064249524378, 35.892293604576913 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111630061", "JIBUN": "1163-61전", "BCHK": "1", "SGG_OID": "575269", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.547652352573635, 35.893018693050841 ], [ 127.547681661017137, 35.892985115084002 ], [ 127.547696853977797, 35.892870193100933 ], [ 127.547738451090652, 35.892784242767377 ], [ 127.547777407232687, 35.89276207554434 ], [ 127.547772521679775, 35.892807051173406 ], [ 127.547808601282853, 35.89287562395829 ], [ 127.547880645723765, 35.892875143017193 ], [ 127.547873764175449, 35.892908483824186 ], [ 127.547814895174099, 35.892909896184037 ], [ 127.547829097060372, 35.892961886689037 ], [ 127.548003890513044, 35.893009622736948 ], [ 127.548012830422863, 35.893045333892807 ], [ 127.548123907886705, 35.89302739858249 ], [ 127.548199692437137, 35.893027999928705 ], [ 127.548219958509506, 35.893017958085331 ], [ 127.548233459989206, 35.893009920728986 ], [ 127.548237923560436, 35.892971264634397 ], [ 127.548205876936279, 35.892944842224509 ], [ 127.548121793304077, 35.89287446028321 ], [ 127.548113873744953, 35.892848621983291 ], [ 127.548037161463412, 35.892808091254608 ], [ 127.548023774435492, 35.892786044974557 ], [ 127.548003673532065, 35.892741146985962 ], [ 127.547930195291514, 35.892668346410098 ], [ 127.547877622147297, 35.892630139072416 ], [ 127.547849826523162, 35.892609825597511 ], [ 127.547761576837942, 35.892643915037105 ], [ 127.547711646122551, 35.892632426122908 ], [ 127.547659930641458, 35.892606192150389 ], [ 127.547604826448151, 35.892650981565147 ], [ 127.547543771113538, 35.89268398287151 ], [ 127.547517436585153, 35.892676433121849 ], [ 127.54743373407895, 35.892724353570628 ], [ 127.547355660101914, 35.892738704557303 ], [ 127.547254020716139, 35.892772971639459 ], [ 127.547274434501588, 35.892805422331385 ], [ 127.547209862803513, 35.892840908820759 ], [ 127.547242225986466, 35.892886075667164 ], [ 127.547321238678663, 35.892989096826533 ], [ 127.547325236041672, 35.892987339283764 ], [ 127.547510705383544, 35.892905899140779 ], [ 127.547552286027098, 35.892936874669019 ], [ 127.547652352573635, 35.893018693050841 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111630050", "JIBUN": "1163-50전", "BCHK": "1", "SGG_OID": "575170", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546914510933505, 35.893314774936286 ], [ 127.54701082631955, 35.893395520393788 ], [ 127.547150885816194, 35.893293054050673 ], [ 127.547314144203924, 35.893210904011895 ], [ 127.547336415651742, 35.893199321110785 ], [ 127.547357095071021, 35.893139754887052 ], [ 127.547264611825824, 35.893026728217045 ], [ 127.547321238678663, 35.892989096826533 ], [ 127.547242225986466, 35.892886075667164 ], [ 127.547093673085399, 35.892935399056476 ], [ 127.547060069357784, 35.892972547243033 ], [ 127.54704654049354, 35.892989524804968 ], [ 127.547034352958349, 35.893047033647619 ], [ 127.547075538317245, 35.893075298430546 ], [ 127.547111203163766, 35.893109320108245 ], [ 127.546840651955264, 35.893263911392289 ], [ 127.546914510933505, 35.893314774936286 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111630049", "JIBUN": "1163-49전", "BCHK": "1", "SGG_OID": "575210", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546840651955264, 35.893263911392289 ], [ 127.547111203163766, 35.893109320108245 ], [ 127.547075538317245, 35.893075298430546 ], [ 127.546934012899072, 35.893173923089009 ], [ 127.546897229663728, 35.893157696739358 ], [ 127.546833156315486, 35.893180320195285 ], [ 127.546736742903633, 35.893246746073217 ], [ 127.54680938307321, 35.893281402068503 ], [ 127.546840651955264, 35.893263911392289 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112030016", "JIBUN": "1203-16전", "BCHK": "1", "SGG_OID": "575104", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548805654042454, 35.893592132379148 ], [ 127.548874651387294, 35.893602641717635 ], [ 127.548891654118265, 35.893540081883621 ], [ 127.548857242163152, 35.893454901162407 ], [ 127.548793545896331, 35.89342605464342 ], [ 127.548794970829675, 35.893380436851047 ], [ 127.548798574944115, 35.893220163534771 ], [ 127.548817528679777, 35.893064515678454 ], [ 127.54879487845767, 35.893043557127577 ], [ 127.548785951335461, 35.892964695031637 ], [ 127.548783604982546, 35.892944022471482 ], [ 127.548807542537759, 35.892849491413564 ], [ 127.548841326276701, 35.892785521284502 ], [ 127.548770047398691, 35.892753996598181 ], [ 127.548712263762198, 35.892729629243249 ], [ 127.548633465234616, 35.892978295421848 ], [ 127.54854762661931, 35.892965204020939 ], [ 127.548556513000136, 35.893018858889256 ], [ 127.548556975564154, 35.893116685409929 ], [ 127.548557986118695, 35.893327974414952 ], [ 127.548494771642922, 35.893507607303242 ], [ 127.548493171773814, 35.893513328394071 ], [ 127.548703637275366, 35.893544264217084 ], [ 127.548817059748998, 35.893551552046894 ], [ 127.548805654042454, 35.893592132379148 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112030014", "JIBUN": "1203-14전", "BCHK": "1", "SGG_OID": "574912", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548673607940074, 35.894147459691112 ], [ 127.548774163730016, 35.894135826255194 ], [ 127.548777259580874, 35.894099636741331 ], [ 127.54879562546526, 35.893953490562424 ], [ 127.548799763014529, 35.893935086597587 ], [ 127.548802822698207, 35.893887208282116 ], [ 127.548596025586008, 35.893945279515975 ], [ 127.548674978618862, 35.894137404722251 ], [ 127.548673607940074, 35.894147459691112 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112030013", "JIBUN": "1203-13전", "BCHK": "1", "SGG_OID": "574916", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548774163730016, 35.894135826255194 ], [ 127.548856752615535, 35.894099806203279 ], [ 127.548966340988429, 35.894047188522563 ], [ 127.549031971149489, 35.894007757890755 ], [ 127.549003282319774, 35.89392700320839 ], [ 127.54893956777228, 35.893847300395379 ], [ 127.548802822698207, 35.893887208282116 ], [ 127.548799763014529, 35.893935086597587 ], [ 127.54879562546526, 35.893953490562424 ], [ 127.548777259580874, 35.894099636741331 ], [ 127.548774163730016, 35.894135826255194 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112030008", "JIBUN": "1203-8전", "BCHK": "1", "SGG_OID": "574775", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548634583375687, 35.894592746372446 ], [ 127.548805163799926, 35.894626414180429 ], [ 127.54889581479398, 35.894689898301152 ], [ 127.548921507791007, 35.894700677073004 ], [ 127.548961996940918, 35.894695166239458 ], [ 127.549009910710154, 35.894685367735839 ], [ 127.549028060896831, 35.894628579551437 ], [ 127.54901266249432, 35.894579920203405 ], [ 127.549046996339825, 35.894539460635784 ], [ 127.549200554386786, 35.894568501063503 ], [ 127.549227402769034, 35.894526723734913 ], [ 127.549244545786635, 35.894444345156167 ], [ 127.549240043866845, 35.894334271334507 ], [ 127.549237275996134, 35.894308707027733 ], [ 127.549035075593949, 35.894344398516132 ], [ 127.548801607604815, 35.894346300816913 ], [ 127.54878423923364, 35.894315539845707 ], [ 127.548644067466753, 35.894295405144803 ], [ 127.548682878434079, 35.894332548294059 ], [ 127.548667947794939, 35.894401722697872 ], [ 127.548652766399343, 35.894445726864959 ], [ 127.54856539960528, 35.894423251623508 ], [ 127.548553580322078, 35.894432732335368 ], [ 127.548479159605037, 35.894495337336359 ], [ 127.548444572110355, 35.894545657363253 ], [ 127.5485122014518, 35.894561670643 ], [ 127.548568241238144, 35.894577087790864 ], [ 127.548634583375687, 35.894592746372446 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112030006", "JIBUN": "1203-6전", "BCHK": "1", "SGG_OID": "574645", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548782489130588, 35.895042895127304 ], [ 127.548779267356139, 35.895036655267532 ], [ 127.548749900080736, 35.894979651060254 ], [ 127.548812699062523, 35.894971289862383 ], [ 127.548815257715432, 35.894895673955965 ], [ 127.548789714552726, 35.894839084920406 ], [ 127.548562108621681, 35.894786877190022 ], [ 127.548538159204909, 35.894823459088542 ], [ 127.548408034214873, 35.894924340683055 ], [ 127.548596250871469, 35.89499701484683 ], [ 127.548612144892118, 35.89499860971916 ], [ 127.548681107801144, 35.895005550444608 ], [ 127.548772939463291, 35.895039369770586 ], [ 127.548782489130588, 35.895042895127304 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021112020000", "JIBUN": "1202전", "BCHK": "1", "SGG_OID": "574682", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548940843028134, 35.894957574885829 ], [ 127.548965632437259, 35.894923972153052 ], [ 127.548980173282814, 35.894886685039175 ], [ 127.54901441880007, 35.894809248387787 ], [ 127.54903727585166, 35.894779737024308 ], [ 127.54896975582669, 35.894720121999875 ], [ 127.548921507791007, 35.894700677073004 ], [ 127.54889581479398, 35.894689898301152 ], [ 127.548805163799926, 35.894626414180429 ], [ 127.548634583375687, 35.894592746372446 ], [ 127.548619368099736, 35.894646321759431 ], [ 127.548645846581053, 35.894695606603399 ], [ 127.548767956711671, 35.894764399940826 ], [ 127.548842603316956, 35.894755525112089 ], [ 127.548908224398375, 35.894779036547227 ], [ 127.548935301516067, 35.894875020373654 ], [ 127.54893662274263, 35.8948947873535 ], [ 127.548940843028134, 35.894957574885829 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111630046", "JIBUN": "1163-46전", "BCHK": "1", "SGG_OID": "575220", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546711691518993, 35.893247049057834 ], [ 127.546736742903633, 35.893246746073217 ], [ 127.546833156315486, 35.893180320195285 ], [ 127.546897229663728, 35.893157696739358 ], [ 127.546893191744203, 35.893108327612239 ], [ 127.546715482420851, 35.893166714133855 ], [ 127.546705137896538, 35.893186137562346 ], [ 127.546719688154965, 35.893209882035222 ], [ 127.546711691518993, 35.893247049057834 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111630027", "JIBUN": "1163-27전", "BCHK": "1", "SGG_OID": "665187", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.546377274865293, 35.893513023961049 ], [ 127.546422817943309, 35.893453110772981 ], [ 127.546567898914645, 35.893326883897032 ], [ 127.54657308079608, 35.893316955849834 ], [ 127.5465146692611, 35.893297898539501 ], [ 127.546441955874499, 35.893273552781508 ], [ 127.546420203376925, 35.893296236329718 ], [ 127.546365730603412, 35.893341211569336 ], [ 127.546326667446891, 35.893427068820998 ], [ 127.546346350083795, 35.893443363911715 ], [ 127.546336500035551, 35.893468697140655 ], [ 127.546377274865293, 35.893513023961049 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111630004", "JIBUN": "1163-4전", "BCHK": "1", "SGG_OID": "575247", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548105063789151, 35.893060622612886 ], [ 127.548096186359032, 35.893082346634451 ], [ 127.548046640355111, 35.893144603846984 ], [ 127.548166454653753, 35.893131197979244 ], [ 127.548403483968187, 35.893133904025568 ], [ 127.548556975564154, 35.893116685409929 ], [ 127.548556513000136, 35.893018858889256 ], [ 127.54854762661931, 35.892965204020939 ], [ 127.548549126825293, 35.89290313841795 ], [ 127.548555144093953, 35.892879444682407 ], [ 127.548454619495871, 35.892935643664359 ], [ 127.548408625108166, 35.892945775672707 ], [ 127.54837780136485, 35.892950620457604 ], [ 127.548338188989803, 35.892954658093572 ], [ 127.548305222185633, 35.89296032372544 ], [ 127.548237923560436, 35.892971264634397 ], [ 127.548233459989206, 35.893009920728986 ], [ 127.548219958509506, 35.893017958085331 ], [ 127.548199692437137, 35.893027999928705 ], [ 127.548123907886705, 35.89302739858249 ], [ 127.548116330519264, 35.89303684192172 ], [ 127.548105063789151, 35.893060622612886 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111900052", "JIBUN": "1190-52전", "BCHK": "1", "SGG_OID": "575054", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.548246519272311, 35.893696283866731 ], [ 127.548283329219103, 35.893725983080458 ], [ 127.548339402258648, 35.893728611721542 ], [ 127.548376379061324, 35.893747134883071 ], [ 127.548378377062065, 35.893684958875276 ], [ 127.548379056049953, 35.893672563858068 ], [ 127.548384148598117, 35.893649676439935 ], [ 127.548399471212321, 35.893602048709511 ], [ 127.548434383325485, 35.893499140384414 ], [ 127.548338266277, 35.893444242477877 ], [ 127.548246519272311, 35.893696283866731 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021111900034", "JIBUN": "1190-34전", "BCHK": "1", "SGG_OID": "574664", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.547980167242727, 35.894990446968251 ], [ 127.548106545093376, 35.89496147406841 ], [ 127.548200617251709, 35.894934576732517 ], [ 127.548175769438714, 35.894838907033375 ], [ 127.548101366094642, 35.894767183271931 ], [ 127.548027454367954, 35.894737959270422 ], [ 127.547987032972003, 35.894809745993527 ], [ 127.547859349045453, 35.89480013400658 ], [ 127.547886099356731, 35.894880978884046 ], [ 127.547894378231717, 35.894873659274523 ], [ 127.547920812465435, 35.894871430127964 ], [ 127.547977557345845, 35.894892729379215 ], [ 127.547992727775181, 35.894930863521765 ], [ 127.547980347494914, 35.894982830748106 ], [ 127.547980167242727, 35.894990446968251 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021104050000", "JIBUN": "405답", "BCHK": "1", "SGG_OID": "576485", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.551262352302928, 35.883977037172549 ], [ 127.551296433949474, 35.883976214263505 ], [ 127.55134642486496, 35.884024363576799 ], [ 127.551368664482652, 35.884019845729966 ], [ 127.551367724294025, 35.883923886823659 ], [ 127.551453745772207, 35.883939147400021 ], [ 127.551519502773161, 35.883972291035143 ], [ 127.551506902238231, 35.883919761832466 ], [ 127.551467281566772, 35.88387387225788 ], [ 127.551397930169173, 35.883839807767345 ], [ 127.551382425657735, 35.883735642222554 ], [ 127.551367162597217, 35.8836471750352 ], [ 127.551358470782176, 35.883556091226076 ], [ 127.551342592402676, 35.88335776662737 ], [ 127.551300009275678, 35.883392731094631 ], [ 127.551292204340996, 35.883421939710814 ], [ 127.551276124044037, 35.883439533269765 ], [ 127.551214283640434, 35.883476280164295 ], [ 127.551158874331151, 35.883527002748068 ], [ 127.551171993135299, 35.883590470580536 ], [ 127.55124165936067, 35.883636484103768 ], [ 127.55123402741259, 35.883684320395218 ], [ 127.551232030063815, 35.883739836433925 ], [ 127.55120960969758, 35.883793508291767 ], [ 127.551213286000248, 35.883871970773995 ], [ 127.55125010289612, 35.883925614850831 ], [ 127.551262352302928, 35.883977037172549 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021104090000", "JIBUN": "409전", "BCHK": "1", "SGG_OID": "576559", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.551324509646761, 35.883242662895142 ], [ 127.551388846724663, 35.883214673504497 ], [ 127.551476536151128, 35.883165353134665 ], [ 127.551512014808466, 35.883156809220146 ], [ 127.551570659539337, 35.883120815817307 ], [ 127.551521944095128, 35.88305205857548 ], [ 127.551402678541621, 35.882899061684675 ], [ 127.551338382715358, 35.88283204297268 ], [ 127.551317740244755, 35.88287211613401 ], [ 127.551279019813919, 35.8829131282085 ], [ 127.55126340301473, 35.882951303793668 ], [ 127.551248884351679, 35.882975315989491 ], [ 127.551245340727675, 35.883050657212358 ], [ 127.551259567195544, 35.883109352451413 ], [ 127.551290472469603, 35.883179371936443 ], [ 127.551324509646761, 35.883242662895142 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021103590002", "JIBUN": "359-2도", "BCHK": "1", "SGG_OID": "576631", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.557299907089956, 35.882331801183994 ], [ 127.557285161775795, 35.882143980516915 ], [ 127.5573214923633, 35.881983320967286 ], [ 127.557373361890072, 35.881837207480935 ], [ 127.557421547876743, 35.881782045356637 ], [ 127.55743933995835, 35.881764019475348 ], [ 127.557453034185698, 35.881733260121194 ], [ 127.55738447225643, 35.881788498532671 ], [ 127.557333128434408, 35.881856103248175 ], [ 127.557286582401943, 35.882003354674659 ], [ 127.557278375406625, 35.882098319442647 ], [ 127.557275196630869, 35.882110933377696 ], [ 127.557253138333195, 35.882198346818925 ], [ 127.55729464063559, 35.882334087645667 ], [ 127.557299907089956, 35.882331801183994 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021103590001", "JIBUN": "359-1답", "BCHK": "1", "SGG_OID": "576632", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.557299907089956, 35.882331801183994 ], [ 127.557376496935163, 35.882298542775068 ], [ 127.557417922916585, 35.882247422422644 ], [ 127.557550313540744, 35.882171061054329 ], [ 127.557520413693013, 35.882087177583742 ], [ 127.557496728387662, 35.882057429396824 ], [ 127.557469172667709, 35.882020552347903 ], [ 127.557420383710209, 35.881914964481773 ], [ 127.557425834936822, 35.881826609476626 ], [ 127.557433964464366, 35.881788729107321 ], [ 127.55743933995835, 35.881764019475348 ], [ 127.557421547876743, 35.881782045356637 ], [ 127.557373361890072, 35.881837207480935 ], [ 127.5573214923633, 35.881983320967286 ], [ 127.557285161775795, 35.882143980516915 ], [ 127.557299907089956, 35.882331801183994 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021103560000", "JIBUN": "356 전", "BCHK": "9", "SGG_OID": "1203382", "COL_ADM_SE": "52720", "layer": "노성리", "path": "노성리.geojson" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.557755668732142, 35.881894666624007 ], [ 127.55768711303601, 35.881955537879222 ], [ 127.557618011916546, 35.881974837776518 ], [ 127.557569404972583, 35.882107607035067 ], [ 127.557550313540744, 35.882171061054329 ], [ 127.55763668590096, 35.882144741743183 ], [ 127.557672187454727, 35.882142801938556 ], [ 127.557748419503667, 35.882126524164711 ], [ 127.55782717824313, 35.882169094116378 ], [ 127.557920542019104, 35.882269960158176 ], [ 127.558053238836692, 35.882231097091065 ], [ 127.558209486832439, 35.882236023745882 ], [ 127.558309931839915, 35.882185602864823 ], [ 127.558367947536809, 35.882161541383553 ], [ 127.558445348656264, 35.882133523704951 ], [ 127.558570725452284, 35.882115296175883 ], [ 127.558576949033522, 35.882082065918283 ], [ 127.558699357411371, 35.882111211773562 ], [ 127.558703728169689, 35.882104378182952 ], [ 127.558817280635481, 35.882024939483856 ], [ 127.55894682566371, 35.882026330072343 ], [ 127.558935041475877, 35.881996130396423 ], [ 127.558954682988812, 35.881959187858378 ], [ 127.558963177302289, 35.8818897084955 ], [ 127.559127643974932, 35.881817540462357 ], [ 127.559277419603347, 35.881764997164012 ], [ 127.559340487866947, 35.881711405408971 ], [ 127.559325451187533, 35.881599569235782 ], [ 127.559359193467628, 35.881578936534908 ], [ 127.559308098185781, 35.88148588727676 ], [ 127.559263382805554, 35.881427740132501 ], [ 127.559315824115529, 35.881398476931338 ], [ 127.559374404942062, 35.881467761976943 ], [ 127.559450015635974, 35.88145461328731 ], [ 127.559327113210998, 35.881196972054724 ], [ 127.559228586129336, 35.88095519635462 ], [ 127.559181666814553, 35.880968058489962 ], [ 127.559136934231248, 35.881014832840151 ], [ 127.559069953212685, 35.881099454059381 ], [ 127.559010734883913, 35.881169835790182 ], [ 127.558966984906988, 35.88120041037125 ], [ 127.558851954443639, 35.881307379709511 ], [ 127.558800679465506, 35.881280256205137 ], [ 127.55873519432933, 35.881328721868705 ], [ 127.558746620547112, 35.881341042780292 ], [ 127.558664838648525, 35.8814280936638 ], [ 127.558666557549699, 35.881474291869793 ], [ 127.558516519862309, 35.881592192988137 ], [ 127.558545067314384, 35.881671017560492 ], [ 127.558537472162428, 35.881744016546023 ], [ 127.558486825242184, 35.881789222897879 ], [ 127.558435180853976, 35.881801106284954 ], [ 127.558313741214434, 35.881823262817726 ], [ 127.558235004356263, 35.881812290283662 ], [ 127.558213952706268, 35.881791776673651 ], [ 127.558192517232342, 35.881789208372943 ], [ 127.55791734330478, 35.88180947234266 ], [ 127.557869728344883, 35.881860729683574 ], [ 127.557755668732142, 35.881894666624007 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034022112210004", "JIBUN": "1221-4 유", "BCHK": "1", "SGG_OID": "609530", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.477988938691013, 35.823742677368188 ], [ 127.478058294729422, 35.823789681689391 ], [ 127.478152613854689, 35.823851106026844 ], [ 127.478314710690498, 35.823612309230626 ], [ 127.478171812869093, 35.823551140767613 ], [ 127.478126395682921, 35.823598978686888 ], [ 127.477988938691013, 35.823742677368188 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034022112650000", "JIBUN": "1265전", "BCHK": "1", "SGG_OID": "610045", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.47877600211892, 35.822445709863871 ], [ 127.478845612384916, 35.822387429327733 ], [ 127.478819717567021, 35.822367028845136 ], [ 127.478726898629063, 35.822339720180459 ], [ 127.478610311634853, 35.822321923798242 ], [ 127.478514488106043, 35.822306586412886 ], [ 127.478455147721405, 35.822305812501966 ], [ 127.478377597462526, 35.822355778789145 ], [ 127.478364137752905, 35.822364448088862 ], [ 127.478460994935034, 35.822369435202589 ], [ 127.478591043341041, 35.822406582097472 ], [ 127.478675538080779, 35.822420513392167 ], [ 127.478726623761617, 35.822428755237262 ], [ 127.47877600211892, 35.822445709863871 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034022112630000", "JIBUN": "1263전", "BCHK": "1", "SGG_OID": "609903", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.479234660795484, 35.822895537503406 ], [ 127.4790626078304, 35.822657571642388 ], [ 127.478996444114671, 35.822567043115669 ], [ 127.478975293591105, 35.822557240482567 ], [ 127.478942617426583, 35.822601882756771 ], [ 127.47896119437911, 35.822623574023396 ], [ 127.478843535297088, 35.822691093949196 ], [ 127.479160627330771, 35.822913748477845 ], [ 127.479206469252063, 35.822892639393466 ], [ 127.479234660795484, 35.822895537503406 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106210003", "JIBUN": "621-3 유", "BCHK": "1", "SGG_OID": "607315", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.47588197566111, 35.824583833583695 ], [ 127.475935359322236, 35.824515011133222 ], [ 127.475989457086698, 35.824463922331688 ], [ 127.476016897805252, 35.824385225479006 ], [ 127.476015447906022, 35.824383329577117 ], [ 127.475986413180834, 35.824346673422795 ], [ 127.475959455625841, 35.824261116545131 ], [ 127.475934067631968, 35.824145487945955 ], [ 127.475885231889663, 35.824017091124453 ], [ 127.475851161917092, 35.823924586654805 ], [ 127.475798196398088, 35.823838573600007 ], [ 127.475719692082265, 35.823643105985099 ], [ 127.475659508049489, 35.823645776780801 ], [ 127.475703807854487, 35.823824706361144 ], [ 127.475710575578006, 35.823952268860467 ], [ 127.475720895246738, 35.823971875277778 ], [ 127.475755109003529, 35.824036485696737 ], [ 127.475783773238447, 35.824115069269446 ], [ 127.475815657269465, 35.824320039676913 ], [ 127.475835216161542, 35.824425002542178 ], [ 127.475874129851618, 35.824529934077901 ], [ 127.47588197566111, 35.824583833583695 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021105460006", "JIBUN": "546-6 유", "BCHK": "1", "SGG_OID": "607853", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.47667214956121, 35.821181821059568 ], [ 127.47666979595752, 35.821132261889666 ], [ 127.476819432630037, 35.82109964901953 ], [ 127.476902571511701, 35.821072057562482 ], [ 127.476949928972573, 35.821145583075335 ], [ 127.476989393654435, 35.821233460573694 ], [ 127.47711116419643, 35.821170756853178 ], [ 127.477188503353048, 35.82112441521474 ], [ 127.477138554008647, 35.82104494282337 ], [ 127.477056800427349, 35.820985666970586 ], [ 127.476892384648636, 35.820818595656661 ], [ 127.476843801492578, 35.820790011040906 ], [ 127.47664560010233, 35.820793309163456 ], [ 127.476619366170468, 35.82078081345702 ], [ 127.476569327415618, 35.820844062340754 ], [ 127.476479280025146, 35.820937922377496 ], [ 127.476387532772904, 35.82095822043091 ], [ 127.476346954653749, 35.820986112051052 ], [ 127.476420051213424, 35.82109503613146 ], [ 127.476405716154957, 35.821099797268964 ], [ 127.47663733509151, 35.821202011384464 ], [ 127.47667214956121, 35.821181821059568 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021105460004", "JIBUN": "546-4 유", "BCHK": "1", "SGG_OID": "607846", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.476811056022925, 35.821201775175332 ], [ 127.476803542431, 35.821131255429748 ], [ 127.476698797954128, 35.821167286777644 ], [ 127.47667214956121, 35.821181821059568 ], [ 127.47663733509151, 35.821202011384464 ], [ 127.476680870203126, 35.821267359794987 ], [ 127.476811056022925, 35.821201775175332 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106890001", "JIBUN": "689-1전", "BCHK": "1", "SGG_OID": "607062", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.473513281863717, 35.826141001329837 ], [ 127.473451350512008, 35.826011492374882 ], [ 127.473414557393838, 35.825933480928448 ], [ 127.473375868136088, 35.82587164523855 ], [ 127.473236955900731, 35.825722917413273 ], [ 127.473221741807208, 35.825689640093216 ], [ 127.47307630770409, 35.825716022433298 ], [ 127.473027101605183, 35.8257432978792 ], [ 127.473011968154267, 35.825747962607338 ], [ 127.473057155292253, 35.825890614548889 ], [ 127.473118895359192, 35.825959858249426 ], [ 127.473162319561524, 35.826083185370678 ], [ 127.473277951638849, 35.826221252807898 ], [ 127.473303295948639, 35.826201019524547 ], [ 127.473429588815407, 35.826173279089353 ], [ 127.473513281863717, 35.826141001329837 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106830000", "JIBUN": "683 유", "BCHK": "1", "SGG_OID": "607196", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.472945655561404, 35.825292850931483 ], [ 127.472980195499062, 35.825343662799412 ], [ 127.473019080171312, 35.825399342357613 ], [ 127.473158635678161, 35.825368918543504 ], [ 127.473146412686944, 35.825291270219395 ], [ 127.473062191795563, 35.825282831569254 ], [ 127.473009364419781, 35.825292790284486 ], [ 127.472996995273803, 35.825295182042829 ], [ 127.472945655561404, 35.825292850931483 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106770000", "JIBUN": "677임", "BCHK": "1", "SGG_OID": "607057", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.47244232104137, 35.826246006577527 ], [ 127.472547264685645, 35.826216007482586 ], [ 127.472702373661264, 35.826197392628238 ], [ 127.472784346943101, 35.82613061346953 ], [ 127.472767473553887, 35.826097432724552 ], [ 127.472724804296902, 35.826058657250158 ], [ 127.472653592008598, 35.826019443893223 ], [ 127.472663059751682, 35.825988611257401 ], [ 127.472563718628848, 35.825919785068777 ], [ 127.472524015026025, 35.825877203658976 ], [ 127.472466619518173, 35.825902618355734 ], [ 127.472452838543305, 35.825933918499722 ], [ 127.472444519167396, 35.825953093529371 ], [ 127.472427145784351, 35.826018826270975 ], [ 127.472395030483241, 35.82605623658015 ], [ 127.472347135772338, 35.826101387299218 ], [ 127.472376711443815, 35.826177336462692 ], [ 127.472376423242835, 35.826207231868736 ], [ 127.47244232104137, 35.826246006577527 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106560006", "JIBUN": "656-6 유", "BCHK": "1", "SGG_OID": "607108", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.473702835500632, 35.825867468124549 ], [ 127.473903596921716, 35.825821553914068 ], [ 127.473906640140129, 35.825810339485102 ], [ 127.473840569759531, 35.825585612494123 ], [ 127.473789545336004, 35.825513253811756 ], [ 127.473724915062803, 35.8255296670674 ], [ 127.473676067071352, 35.825561294382318 ], [ 127.473702835500632, 35.825867468124549 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106560005", "JIBUN": "656-5 유", "BCHK": "1", "SGG_OID": "606989", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.473739950618295, 35.826646132600096 ], [ 127.473743700300432, 35.826643945868575 ], [ 127.473774661361844, 35.826620986685448 ], [ 127.47378131694866, 35.826580665901062 ], [ 127.473833024958722, 35.826588979466585 ], [ 127.473859564852035, 35.826608035619643 ], [ 127.473872085711378, 35.826591998337697 ], [ 127.473892035828115, 35.826598976671548 ], [ 127.4739757418496, 35.826634192724399 ], [ 127.473993771604427, 35.826612176549524 ], [ 127.474003700918033, 35.826541669224888 ], [ 127.47403320197418, 35.826556198464672 ], [ 127.474063309645899, 35.826516245095149 ], [ 127.473982401854457, 35.826441534589485 ], [ 127.473950733427898, 35.826371262883328 ], [ 127.473950026097199, 35.826319137692344 ], [ 127.47401144545266, 35.826300483828007 ], [ 127.474085236812201, 35.826236971419341 ], [ 127.474093144993972, 35.826182099607102 ], [ 127.474051868064336, 35.826047886367903 ], [ 127.47403342395323, 35.826011179099595 ], [ 127.473944858790503, 35.82597382820704 ], [ 127.47392692610677, 35.825972988437634 ], [ 127.473897444591742, 35.825939307649627 ], [ 127.473883294303818, 35.825896986753335 ], [ 127.473903596921716, 35.825821553914068 ], [ 127.473702835500632, 35.825867468124549 ], [ 127.47373077806769, 35.826188733074233 ], [ 127.473547336775638, 35.826292925533352 ], [ 127.473593884848341, 35.826440925301817 ], [ 127.473576471082055, 35.826475403207077 ], [ 127.473618172806653, 35.82662911785993 ], [ 127.473680052603711, 35.8266806692858 ], [ 127.473739950618295, 35.826646132600096 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106560004", "JIBUN": "656-4답", "BCHK": "1", "SGG_OID": "607096", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.473414557393838, 35.825933480928448 ], [ 127.473702835500632, 35.825867468124549 ], [ 127.473676067071352, 35.825561294382318 ], [ 127.473614000921543, 35.825601454308817 ], [ 127.473479696552971, 35.82562165594387 ], [ 127.47344121956786, 35.825647997194842 ], [ 127.473461516232021, 35.825722901034688 ], [ 127.473375868136088, 35.82587164523855 ], [ 127.473414557393838, 35.825933480928448 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034021106550003", "JIBUN": "655-3 유", "BCHK": "1", "SGG_OID": "606939", "COL_ADM_SE": "52720", "layer": "pdf_상전면갈현리_621", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면갈현리_621.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.474219196300652, 35.827020617261063 ], [ 127.474260360396755, 35.827001321938262 ], [ 127.474173556712202, 35.826878643505609 ], [ 127.474270532219208, 35.826891501370085 ], [ 127.474282546159984, 35.826838515026871 ], [ 127.474293218885222, 35.826828081698309 ], [ 127.47433325677811, 35.826783123344626 ], [ 127.474310295948499, 35.826770461064584 ], [ 127.474209577256943, 35.826652622997834 ], [ 127.474187827842584, 35.826616559628278 ], [ 127.474111761740517, 35.826559629744857 ], [ 127.474090117128384, 35.826522565563572 ], [ 127.474063309645899, 35.826516245095149 ], [ 127.47403320197418, 35.826556198464672 ], [ 127.474003700918033, 35.826541669224888 ], [ 127.473993771604427, 35.826612176549524 ], [ 127.4739757418496, 35.826634192724399 ], [ 127.473892035828115, 35.826598976671548 ], [ 127.473872085711378, 35.826591998337697 ], [ 127.473859564852035, 35.826608035619643 ], [ 127.473833024958722, 35.826588979466585 ], [ 127.47378131694866, 35.826580665901062 ], [ 127.473774661361844, 35.826620986685448 ], [ 127.473743700300432, 35.826643945868575 ], [ 127.473838614497026, 35.826731074710246 ], [ 127.473907062623937, 35.826792910438826 ], [ 127.473966319504527, 35.826827582706933 ], [ 127.474024386122309, 35.826891081415553 ], [ 127.474080589265753, 35.826979975471787 ], [ 127.474156280316009, 35.827050110072072 ], [ 127.474219196300652, 35.827020617261063 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110870003", "JIBUN": "1087-3 유", "BCHK": "1", "SGG_OID": "629603", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.501708096569502, 35.880788923701097 ], [ 127.501778785260285, 35.880585085387459 ], [ 127.501831734484341, 35.880561090268422 ], [ 127.501851328158821, 35.880501806524705 ], [ 127.501826066323957, 35.880394087991633 ], [ 127.501853984228404, 35.880372999963292 ], [ 127.501845260820957, 35.880304794783108 ], [ 127.501852551620573, 35.880208602633374 ], [ 127.501887866361102, 35.88018214847358 ], [ 127.501861075860518, 35.880077870015633 ], [ 127.501727322774542, 35.88005122782203 ], [ 127.5016910171625, 35.880096215454678 ], [ 127.501575197814162, 35.880190155764822 ], [ 127.501590776261608, 35.880290146025047 ], [ 127.501554993331752, 35.880402462709931 ], [ 127.501518211655181, 35.880495082542197 ], [ 127.501435373031853, 35.880704036217629 ], [ 127.501503848606262, 35.880754094186926 ], [ 127.50154768052613, 35.88081762903721 ], [ 127.50157860652233, 35.880818762017888 ], [ 127.501644410638306, 35.880796155438865 ], [ 127.501708096569502, 35.880788923701097 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110830002", "JIBUN": "1083-2답", "BCHK": "1", "SGG_OID": "629890", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.502018858006963, 35.879843747711696 ], [ 127.50205537430611, 35.879832294059696 ], [ 127.502030471932301, 35.879765877665534 ], [ 127.502017926758569, 35.879706286199465 ], [ 127.501948721598779, 35.879629933510515 ], [ 127.501906988070871, 35.879530232496535 ], [ 127.501771875617223, 35.879463373883915 ], [ 127.501657617229739, 35.879472528585744 ], [ 127.501602911129467, 35.879519936021921 ], [ 127.501593069801842, 35.879615607058305 ], [ 127.501706898936717, 35.879645585835178 ], [ 127.501769234495612, 35.879650931920722 ], [ 127.501844611467945, 35.879720842211377 ], [ 127.501936861625467, 35.879777848569866 ], [ 127.502018858006963, 35.879843747711696 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110820000", "JIBUN": "1082답", "BCHK": "1", "SGG_OID": "629915", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.502092012788253, 35.879766342200199 ], [ 127.502120344557298, 35.879758275231517 ], [ 127.502125137874486, 35.879652414201388 ], [ 127.502036599455849, 35.879530593712275 ], [ 127.501968299804602, 35.879437969963767 ], [ 127.501886336194232, 35.87928565120226 ], [ 127.501774833847364, 35.879257564507647 ], [ 127.50163815005412, 35.879280637533483 ], [ 127.501560405952986, 35.879352005579776 ], [ 127.501572687843506, 35.879401486335858 ], [ 127.501602911129467, 35.879519936021921 ], [ 127.501657617229739, 35.879472528585744 ], [ 127.501771875617223, 35.879463373883915 ], [ 127.501906988070871, 35.879530232496535 ], [ 127.501948721598779, 35.879629933510515 ], [ 127.502017926758569, 35.879706286199465 ], [ 127.502092012788253, 35.879766342200199 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110810000", "JIBUN": "1081답", "BCHK": "1", "SGG_OID": "629986", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.501968299804602, 35.879437969963767 ], [ 127.501989743606899, 35.879426398881954 ], [ 127.501999482378039, 35.879386676919324 ], [ 127.501949783678853, 35.879290001204758 ], [ 127.501920664233495, 35.879223872720736 ], [ 127.501871767302688, 35.879187738612252 ], [ 127.501779697475385, 35.879162815418262 ], [ 127.501627732681797, 35.879191296398723 ], [ 127.501534723841928, 35.879267153048971 ], [ 127.501560405952986, 35.879352005579776 ], [ 127.50163815005412, 35.879280637533483 ], [ 127.501774833847364, 35.879257564507647 ], [ 127.501886336194232, 35.87928565120226 ], [ 127.501968299804602, 35.879437969963767 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110800000", "JIBUN": "1080답", "BCHK": "1", "SGG_OID": "630001", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.502035867426159, 35.879315670199233 ], [ 127.501971466395105, 35.879263603811737 ], [ 127.501960104599846, 35.879180863683558 ], [ 127.501860835402539, 35.879085295680369 ], [ 127.501744576090573, 35.879040312585232 ], [ 127.501582627138092, 35.879087085101041 ], [ 127.501530526120007, 35.879143701297373 ], [ 127.501534723841928, 35.879267153048971 ], [ 127.501627732681797, 35.879191296398723 ], [ 127.501779697475385, 35.879162815418262 ], [ 127.501871767302688, 35.879187738612252 ], [ 127.501920664233495, 35.879223872720736 ], [ 127.501949783678853, 35.879290001204758 ], [ 127.501999482378039, 35.879386676919324 ], [ 127.502035867426159, 35.879315670199233 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110780000", "JIBUN": "1078답", "BCHK": "1", "SGG_OID": "630029", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.502067302242381, 35.879082714104825 ], [ 127.502035585398048, 35.87910010492633 ], [ 127.501922740166776, 35.878978205375134 ], [ 127.501731407414738, 35.878916726961997 ], [ 127.501657060866123, 35.878927797298303 ], [ 127.5015613545675, 35.878963803567487 ], [ 127.501527175778662, 35.8790317367651 ], [ 127.501530526120007, 35.879143701297373 ], [ 127.501582627138092, 35.879087085101041 ], [ 127.501744576090573, 35.879040312585232 ], [ 127.501860835402539, 35.879085295680369 ], [ 127.501960104599846, 35.879180863683558 ], [ 127.501971466395105, 35.879263603811737 ], [ 127.502035867426159, 35.879315670199233 ], [ 127.502053365607054, 35.87923669414247 ], [ 127.502067302242381, 35.879082714104825 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110640002", "JIBUN": "1064-2전", "BCHK": "1", "SGG_OID": "629764", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.501185873156999, 35.880259593902842 ], [ 127.501206469770366, 35.880220637951204 ], [ 127.50121108775393, 35.880090191996693 ], [ 127.501161896157782, 35.880075940819616 ], [ 127.50112728147775, 35.880072831343739 ], [ 127.501114945109677, 35.879891211678839 ], [ 127.500982845520355, 35.879898547353221 ], [ 127.501009372887083, 35.879973455856117 ], [ 127.50100002179687, 35.880108526800228 ], [ 127.500975521906341, 35.880178411312194 ], [ 127.501030552257347, 35.880186041243157 ], [ 127.501058367191774, 35.880254347335715 ], [ 127.501095219593722, 35.880280492105079 ], [ 127.501177568426598, 35.880259718573271 ], [ 127.501185873156999, 35.880259593902842 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110640000", "JIBUN": "1064전", "BCHK": "1", "SGG_OID": "629744", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.501324599057966, 35.880321553432559 ], [ 127.501372950342073, 35.880145638425276 ], [ 127.501425091271486, 35.880081154355295 ], [ 127.501434518886995, 35.879954852079408 ], [ 127.501414113796031, 35.879953765397971 ], [ 127.501397512653696, 35.880013487240099 ], [ 127.501346646639092, 35.880016501759258 ], [ 127.501302603967602, 35.880099120999795 ], [ 127.501242739512435, 35.880099370075264 ], [ 127.50121108775393, 35.880090191996693 ], [ 127.501206469770366, 35.880220637951204 ], [ 127.501185873156999, 35.880259593902842 ], [ 127.501220011141129, 35.880259082379546 ], [ 127.501223487110309, 35.880301191646161 ], [ 127.501252384668902, 35.880330262425339 ], [ 127.501324599057966, 35.880321553432559 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110600000", "JIBUN": "1060전", "BCHK": "1", "SGG_OID": "629963", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.501044764326537, 35.879484767117653 ], [ 127.501081375394776, 35.879488409056698 ], [ 127.501124831470321, 35.879469338423611 ], [ 127.501199085889681, 35.879535189222715 ], [ 127.501233045611386, 35.87952221435576 ], [ 127.501202267231349, 35.879352324377869 ], [ 127.501047627186225, 35.879305796934702 ], [ 127.501067632600211, 35.879384346508864 ], [ 127.501044764326537, 35.879484767117653 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026110590000", "JIBUN": "1059전", "BCHK": "1", "SGG_OID": "629966", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_1078", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_1078.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.501026105958928, 35.879532574127595 ], [ 127.501044764326537, 35.879484767117653 ], [ 127.501067632600211, 35.879384346508864 ], [ 127.501047627186225, 35.879305796934702 ], [ 127.500946378301435, 35.879286336711161 ], [ 127.500845775472271, 35.879299228061548 ], [ 127.500728027848666, 35.879456451307902 ], [ 127.500751273684727, 35.879520252270595 ], [ 127.500801217993157, 35.879527461842969 ], [ 127.500904075398608, 35.879487343852489 ], [ 127.500907259640215, 35.87951653063449 ], [ 127.5009974875083, 35.879512622628319 ], [ 127.501026105958928, 35.879532574127595 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101470000", "JIBUN": "147 유", "BCHK": "1", "SGG_OID": "630835", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.506447346486397, 35.875802883253996 ], [ 127.506423469258152, 35.875856507997767 ], [ 127.506397204763758, 35.875875958907514 ], [ 127.506310876451565, 35.875938786357878 ], [ 127.506365736871103, 35.876024731938266 ], [ 127.506484166117446, 35.875998395716572 ], [ 127.506504214268418, 35.875828239283742 ], [ 127.506447346486397, 35.875802883253996 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400070", "JIBUN": "140-70 유", "BCHK": "1", "SGG_OID": "630840", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.507277308965598, 35.875978908707701 ], [ 127.507281169222935, 35.875974737758746 ], [ 127.507257323459555, 35.875883407820282 ], [ 127.50724517978081, 35.875870075601114 ], [ 127.507166762026245, 35.87576965661281 ], [ 127.507116907845642, 35.875771119181891 ], [ 127.507046807070623, 35.875865998887924 ], [ 127.507252425262251, 35.875966441241964 ], [ 127.507277308965598, 35.875978908707701 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400069", "JIBUN": "140-69 유", "BCHK": "1", "SGG_OID": "630830", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.506836209431015, 35.8760676802737 ], [ 127.506847056125878, 35.876021518424608 ], [ 127.506882191119573, 35.875873171448553 ], [ 127.506901283272228, 35.875794972030462 ], [ 127.507046807070623, 35.875865998887924 ], [ 127.507116907845642, 35.875771119181891 ], [ 127.507166762026245, 35.87576965661281 ], [ 127.507200105264687, 35.875745462273805 ], [ 127.507215477759203, 35.875717999998606 ], [ 127.507182680873257, 35.875589450647588 ], [ 127.507055334845347, 35.875562940583059 ], [ 127.50699675582581, 35.875463438353556 ], [ 127.506922358528172, 35.875499016748009 ], [ 127.506929075152442, 35.875512191588555 ], [ 127.506879150871555, 35.875542692162625 ], [ 127.506857946116369, 35.875577677211723 ], [ 127.506748207261296, 35.875657609775843 ], [ 127.5066633019362, 35.87567414403788 ], [ 127.50662369621962, 35.875706133212816 ], [ 127.506598656738447, 35.87575108398088 ], [ 127.506571215159809, 35.875799658797746 ], [ 127.506514251639629, 35.875841219939339 ], [ 127.506568811312192, 35.876017578636663 ], [ 127.506582180681775, 35.876053058138716 ], [ 127.506678989996274, 35.876026001515889 ], [ 127.506836209431015, 35.8760676802737 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400068", "JIBUN": "140-68 유", "BCHK": "1", "SGG_OID": "630785", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.50657806221227, 35.876325329675112 ], [ 127.50670528217492, 35.876202758401888 ], [ 127.506831969979984, 35.876081892566631 ], [ 127.506836209431015, 35.8760676802737 ], [ 127.506678989996274, 35.876026001515889 ], [ 127.506582180681775, 35.876053058138716 ], [ 127.50657741622706, 35.876054348913584 ], [ 127.506564659953654, 35.876113712854874 ], [ 127.506523928671328, 35.876144616233098 ], [ 127.506594509571912, 35.87618629001264 ], [ 127.50657806221227, 35.876325329675112 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400064", "JIBUN": "140-64 유", "BCHK": "1", "SGG_OID": "630780", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.507337702615303, 35.876196519063583 ], [ 127.507374891157767, 35.876341695680821 ], [ 127.507482329592079, 35.876225596652489 ], [ 127.507525336541093, 35.876206074980352 ], [ 127.507615520739265, 35.876161128952177 ], [ 127.507599240867933, 35.876139937399039 ], [ 127.507711254846612, 35.876073017329041 ], [ 127.507652000053753, 35.875968435311997 ], [ 127.507484433310935, 35.875852908911448 ], [ 127.507315749037474, 35.875998736254012 ], [ 127.507452829154332, 35.876067004338616 ], [ 127.507337702615303, 35.876196519063583 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400054", "JIBUN": "140-54 유", "BCHK": "1", "SGG_OID": "630843", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.507652000053753, 35.875968435311997 ], [ 127.507711672284856, 35.87595761237246 ], [ 127.507715195737902, 35.875952721840584 ], [ 127.507545096123323, 35.875863783632269 ], [ 127.507515268088525, 35.875815612075456 ], [ 127.507573416426879, 35.87565747967178 ], [ 127.50749606191583, 35.875633742545681 ], [ 127.507489959632991, 35.875631866642991 ], [ 127.50749183033895, 35.87567354991738 ], [ 127.507497285044934, 35.87576513752829 ], [ 127.507484433310935, 35.875852908911448 ], [ 127.507652000053753, 35.875968435311997 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400039", "JIBUN": "140-39 유", "BCHK": "1", "SGG_OID": "739551", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.50729225826943, 35.876019004815419 ], [ 127.507315749037474, 35.875998736254012 ], [ 127.507484433310935, 35.875852908911448 ], [ 127.507497285044934, 35.87576513752829 ], [ 127.50749183033895, 35.87567354991738 ], [ 127.507454210445104, 35.875815779136921 ], [ 127.507384819603445, 35.875853319447366 ], [ 127.507322382712914, 35.875929168992897 ], [ 127.507281169222935, 35.875974737758746 ], [ 127.50729225826943, 35.876019004815419 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400038", "JIBUN": "140-38 유", "BCHK": "1", "SGG_OID": "630841", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.507322382712914, 35.875929168992897 ], [ 127.507257323459555, 35.875883407820282 ], [ 127.507281169222935, 35.875974737758746 ], [ 127.507322382712914, 35.875929168992897 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400034", "JIBUN": "140-34 유", "BCHK": "1", "SGG_OID": "630852", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.507257323459555, 35.875883407820282 ], [ 127.507215477759203, 35.875717999998606 ], [ 127.507200105264687, 35.875745462273805 ], [ 127.507166762026245, 35.87576965661281 ], [ 127.50724517978081, 35.875870075601114 ], [ 127.507257323459555, 35.875883407820282 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400030", "JIBUN": "140-30 유", "BCHK": "1", "SGG_OID": "630820", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.506523928671328, 35.876144616233098 ], [ 127.506564659953654, 35.876113712854874 ], [ 127.50657741622706, 35.876054348913584 ], [ 127.506582180681775, 35.876053058138716 ], [ 127.506568811312192, 35.876017578636663 ], [ 127.506514251639629, 35.875841219939339 ], [ 127.506571215159809, 35.875799658797746 ], [ 127.506598656738447, 35.87575108398088 ], [ 127.50662369621962, 35.875706133212816 ], [ 127.506601251495397, 35.875695827332621 ], [ 127.506544476671166, 35.875751401907934 ], [ 127.50646608726214, 35.87576347455682 ], [ 127.506441841037187, 35.875788612800768 ], [ 127.506447346486397, 35.875802883253996 ], [ 127.506504214268418, 35.875828239283742 ], [ 127.506484166117446, 35.875998395716572 ], [ 127.506365736871103, 35.876024731938266 ], [ 127.506310876451565, 35.875938786357878 ], [ 127.506276066675184, 35.875955290061967 ], [ 127.506297925714861, 35.875983235642366 ], [ 127.506353665958116, 35.876024593410591 ], [ 127.506413674764488, 35.876059795796962 ], [ 127.506368707940354, 35.876082858152557 ], [ 127.506371264727122, 35.876105360268959 ], [ 127.506373688425384, 35.8761243391139 ], [ 127.506523928671328, 35.876144616233098 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400009", "JIBUN": "140-9 유", "BCHK": "1", "SGG_OID": "630845", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.507715195737902, 35.875952721840584 ], [ 127.507769056989062, 35.875890093309899 ], [ 127.50771814674107, 35.875835224351107 ], [ 127.507707812127208, 35.875763367336241 ], [ 127.507701579810288, 35.875713203795478 ], [ 127.50765998423627, 35.875682989410109 ], [ 127.507573416426879, 35.87565747967178 ], [ 127.507515268088525, 35.875815612075456 ], [ 127.507545096123323, 35.875863783632269 ], [ 127.507715195737902, 35.875952721840584 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034026101400003", "JIBUN": "140-3 유", "BCHK": "1", "SGG_OID": "630849", "COL_ADM_SE": "52720", "layer": "pdf_상전면용평리_140", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면용평리_140.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.507257323459555, 35.875883407820282 ], [ 127.507322382712914, 35.875929168992897 ], [ 127.507384819603445, 35.875853319447366 ], [ 127.507454210445104, 35.875815779136921 ], [ 127.50749183033895, 35.87567354991738 ], [ 127.507489959632991, 35.875631866642991 ], [ 127.50749606191583, 35.875633742545681 ], [ 127.507495222066225, 35.875620083353112 ], [ 127.507457450402015, 35.875602605271851 ], [ 127.507392491123753, 35.875576022039944 ], [ 127.507302547047061, 35.875561106828904 ], [ 127.5072974854439, 35.875567905432504 ], [ 127.507215477759203, 35.875717999998606 ], [ 127.507257323459555, 35.875883407820282 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024114060000", "JIBUN": "1406답", "BCHK": "1", "SGG_OID": "622716", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.480870238402844, 35.858744509422195 ], [ 127.481006156118667, 35.858858253192018 ], [ 127.481091394690239, 35.858908301256534 ], [ 127.481127798968657, 35.858949171329172 ], [ 127.48115842677818, 35.85889491162456 ], [ 127.48117349381225, 35.858788216856958 ], [ 127.481154143834701, 35.858645240415555 ], [ 127.481090880200213, 35.858545356274604 ], [ 127.481063821402358, 35.858467948698078 ], [ 127.480991436511218, 35.858364550024938 ], [ 127.48091826543785, 35.85833096443389 ], [ 127.480779869449592, 35.858300081360788 ], [ 127.480704354422102, 35.858298255647348 ], [ 127.48062127635994, 35.858285131468833 ], [ 127.480584626186953, 35.85831001663238 ], [ 127.480501454686632, 35.858334726767254 ], [ 127.480424296201775, 35.858344966011124 ], [ 127.480482288682978, 35.85838037884448 ], [ 127.480501862069076, 35.85847237141158 ], [ 127.480563416630574, 35.858542260428088 ], [ 127.480581619874343, 35.858562916347083 ], [ 127.480758036238612, 35.858662205257481 ], [ 127.480817459403426, 35.858694295658736 ], [ 127.480870238402844, 35.858744509422195 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024114050001", "JIBUN": "1405-1답", "BCHK": "1", "SGG_OID": "622743", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.480100747284553, 35.858787069409772 ], [ 127.480281798710408, 35.858766088208498 ], [ 127.48039812072038, 35.858767697465169 ], [ 127.480419440578189, 35.85876904545443 ], [ 127.480492136672481, 35.858754930649916 ], [ 127.480629182707318, 35.858772940725224 ], [ 127.480725992671324, 35.858788452482578 ], [ 127.480771205513662, 35.858782720502766 ], [ 127.480806104983813, 35.858786988342459 ], [ 127.480860071349383, 35.858813747129751 ], [ 127.480870238402844, 35.858744509422195 ], [ 127.480817459403426, 35.858694295658736 ], [ 127.480758036238612, 35.858662205257481 ], [ 127.480581619874343, 35.858562916347083 ], [ 127.480563416630574, 35.858542260428088 ], [ 127.480071391234674, 35.858577819463065 ], [ 127.479951368177922, 35.858629037246118 ], [ 127.479949529969957, 35.858640021659959 ], [ 127.479964756989389, 35.858648117237252 ], [ 127.480100747284553, 35.858787069409772 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024113950000", "JIBUN": "1395답", "BCHK": "1", "SGG_OID": "622560", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.484398363183672, 35.859410185512232 ], [ 127.484443476115956, 35.859384318874817 ], [ 127.484475266036426, 35.859324871541197 ], [ 127.484515612334633, 35.859288894112169 ], [ 127.484542580194073, 35.859177356509754 ], [ 127.484619358545459, 35.859078884856302 ], [ 127.48463199612064, 35.858994036464559 ], [ 127.484611751406646, 35.858941827984545 ], [ 127.484507080366001, 35.85897198970703 ], [ 127.484484126948487, 35.858934977971323 ], [ 127.484410904659683, 35.858937083787929 ], [ 127.48428321913012, 35.858982235296686 ], [ 127.484160464326635, 35.859042696937344 ], [ 127.484124468954874, 35.859054936161286 ], [ 127.484034502618272, 35.859085534085331 ], [ 127.483969589381388, 35.859125151878587 ], [ 127.483977438543164, 35.859170786137859 ], [ 127.483894597046259, 35.859266379737321 ], [ 127.483865251615612, 35.859347455852586 ], [ 127.483934608783855, 35.859366995622018 ], [ 127.483942415089629, 35.85954075919274 ], [ 127.483996475900881, 35.859557269096442 ], [ 127.484007584404807, 35.859477572989277 ], [ 127.484026054601372, 35.859448929537635 ], [ 127.484173771852014, 35.85939334259389 ], [ 127.484224225600585, 35.859364561605375 ], [ 127.484287603903425, 35.859349319344638 ], [ 127.484337513389264, 35.859364070336177 ], [ 127.484398363183672, 35.859410185512232 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024113880002", "JIBUN": "1388-2 전", "BCHK": "1", "SGG_OID": "744745", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.485003800133029, 35.857466986385667 ], [ 127.485091824134145, 35.857534369265025 ], [ 127.485208160126902, 35.85756954497419 ], [ 127.485296562471305, 35.857580715892027 ], [ 127.485296543356554, 35.857524730992139 ], [ 127.485166834799401, 35.857243679048636 ], [ 127.48519279267552, 35.857073663919934 ], [ 127.485311663679667, 35.856857473702064 ], [ 127.485409728211124, 35.856722613883683 ], [ 127.485086494402822, 35.856554734640596 ], [ 127.484881973429665, 35.856520030775251 ], [ 127.484804027877146, 35.856445811841382 ], [ 127.484669774504042, 35.856239841808197 ], [ 127.484519807176881, 35.856140659559692 ], [ 127.484371598853855, 35.856156224867263 ], [ 127.484310003856947, 35.856322742050942 ], [ 127.484771318181714, 35.857145124859613 ], [ 127.484827070494873, 35.857132310285266 ], [ 127.484887098838001, 35.857202004959035 ], [ 127.484912284300435, 35.857249308813543 ], [ 127.484934524420041, 35.857291054854883 ], [ 127.484968250450123, 35.857260763685652 ], [ 127.485005800180687, 35.857267642249951 ], [ 127.485038479947463, 35.857296593725195 ], [ 127.485041190693508, 35.857389302305357 ], [ 127.48498440241093, 35.857452139923183 ], [ 127.485003800133029, 35.857466986385667 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024113310000", "JIBUN": "1331 유", "BCHK": "1", "SGG_OID": "621944", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.485543848325477, 35.861628138877954 ], [ 127.485622499879739, 35.861657283462762 ], [ 127.485666203735917, 35.861559782598938 ], [ 127.485638414322906, 35.861547015885122 ], [ 127.485557270996637, 35.861510455143403 ], [ 127.485492040588454, 35.861501741601614 ], [ 127.485432440969191, 35.86149227534078 ], [ 127.485386633769949, 35.861447776432307 ], [ 127.485353070977922, 35.861414106144579 ], [ 127.485244976329838, 35.861413360800405 ], [ 127.485164118580968, 35.861387307083334 ], [ 127.485082775523892, 35.861374305199895 ], [ 127.485035282918631, 35.861365799396907 ], [ 127.484943223021119, 35.861338249496484 ], [ 127.484878384076893, 35.861302803307957 ], [ 127.484837581704653, 35.861280211186845 ], [ 127.484807829911603, 35.861232303867496 ], [ 127.484742315529786, 35.861275250057879 ], [ 127.484801009164258, 35.861345247492508 ], [ 127.484905446452032, 35.861405552786835 ], [ 127.48498085260448, 35.861449112645161 ], [ 127.485019449702634, 35.861471344083867 ], [ 127.485128918000555, 35.86149954484069 ], [ 127.4852574901129, 35.861532300943885 ], [ 127.485351633546827, 35.861554678113492 ], [ 127.485390075443362, 35.861569564962956 ], [ 127.485484069686507, 35.861605632442767 ], [ 127.485543848325477, 35.861628138877954 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024113280009", "JIBUN": "1328-9 유", "BCHK": "1", "SGG_OID": "621934", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.486029697625028, 35.861628397516888 ], [ 127.485968670147216, 35.861600822386869 ], [ 127.485889306824234, 35.861563885184999 ], [ 127.485791389649449, 35.861561819541066 ], [ 127.485666203735917, 35.861559782598938 ], [ 127.485622499879739, 35.861657283462762 ], [ 127.485658386737626, 35.861670738539694 ], [ 127.485768744508377, 35.861657613339993 ], [ 127.485921435784405, 35.861640252771309 ], [ 127.486029697625028, 35.861628397516888 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024114310001", "JIBUN": "1431-1 유", "BCHK": "1", "SGG_OID": "752531", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.478527717572746, 35.860366816626026 ], [ 127.478609767114733, 35.860352107052009 ], [ 127.478713562593995, 35.860369133799537 ], [ 127.478781354102495, 35.860260535584509 ], [ 127.47880241098882, 35.860234577361098 ], [ 127.478643134193646, 35.860065488676781 ], [ 127.478585734361872, 35.860066230325216 ], [ 127.478438852807159, 35.860086613708383 ], [ 127.478351793272353, 35.860083678764155 ], [ 127.478284362340489, 35.860193401859526 ], [ 127.478287949517551, 35.860202661374046 ], [ 127.47842294697044, 35.860296043692664 ], [ 127.478527717572746, 35.860366816626026 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024112250000", "JIBUN": "1225 유", "BCHK": "1", "SGG_OID": "517935", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.479955330460783, 35.867776826946915 ], [ 127.480327877548476, 35.867861104440919 ], [ 127.480453135585179, 35.867867977254662 ], [ 127.480403249364926, 35.867730890571487 ], [ 127.480379811535244, 35.867720214208717 ], [ 127.480319780317075, 35.867726185360972 ], [ 127.480122137673519, 35.867617157103389 ], [ 127.47999161480061, 35.867592721761376 ], [ 127.479955330460783, 35.867776826946915 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024112230000", "JIBUN": "1223전", "BCHK": "1", "SGG_OID": "620045", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.478859404597571, 35.868042428447538 ], [ 127.478945098870483, 35.868089493019255 ], [ 127.479139215133401, 35.868122049172342 ], [ 127.479246779994554, 35.86811233871164 ], [ 127.479414165270327, 35.868039366633759 ], [ 127.479404376933971, 35.867950786855886 ], [ 127.479329603329646, 35.867874794501958 ], [ 127.479201186423083, 35.867756675261496 ], [ 127.478965457637429, 35.867874845396912 ], [ 127.478787037321624, 35.867957738260785 ], [ 127.478859404597571, 35.868042428447538 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024111360003", "JIBUN": "1136-3전", "BCHK": "1", "SGG_OID": "620863", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.47791768156479, 35.865317731460529 ], [ 127.478097943381115, 35.865208525417891 ], [ 127.478181506091119, 35.865160923940813 ], [ 127.47807879601271, 35.865078408486923 ], [ 127.477962977025882, 35.865166071694048 ], [ 127.477866311865697, 35.865231470355802 ], [ 127.47791768156479, 35.865317731460529 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024109340000", "JIBUN": "934전", "BCHK": "1", "SGG_OID": "621139", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.475990870459782, 35.864447830043915 ], [ 127.476122907331884, 35.864478428258643 ], [ 127.476138137618022, 35.864434955430205 ], [ 127.476186339001373, 35.864387639228816 ], [ 127.476260304070522, 35.864266004207124 ], [ 127.476295798996347, 35.864187825691005 ], [ 127.476242309184485, 35.864148508749111 ], [ 127.476177971803963, 35.864111505763695 ], [ 127.476099098550563, 35.864139719714359 ], [ 127.476002614413375, 35.864148239008543 ], [ 127.475983535772428, 35.86419434962496 ], [ 127.47588753196996, 35.864244468101454 ], [ 127.475883470874265, 35.864267141274169 ], [ 127.475914527972591, 35.864276544729869 ], [ 127.475978781446983, 35.864338476444495 ], [ 127.476003987159274, 35.864367387762989 ], [ 127.475990870459782, 35.864447830043915 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024110910002", "JIBUN": "1091-2 유", "BCHK": "1", "SGG_OID": "621327", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.481462208208939, 35.863679249263789 ], [ 127.481345063408767, 35.863525803702181 ], [ 127.481324442706224, 35.863526778285809 ], [ 127.481094949621578, 35.863440589929617 ], [ 127.480887602183145, 35.863404340516141 ], [ 127.480797067361962, 35.86339486922234 ], [ 127.480756401091682, 35.86341694055865 ], [ 127.480777989262762, 35.863503102960259 ], [ 127.480829754717433, 35.86350030087484 ], [ 127.481006444370323, 35.863600804879191 ], [ 127.48108585065691, 35.863639394389686 ], [ 127.481240194828416, 35.863693411242835 ], [ 127.481241829911582, 35.863689150868396 ], [ 127.481248448143347, 35.863593178598521 ], [ 127.481276162654723, 35.863554936527557 ], [ 127.481345902810816, 35.863644853945239 ], [ 127.48142666484371, 35.863706275195682 ], [ 127.481462208208939, 35.863679249263789 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024109270001", "JIBUN": "927-1답", "BCHK": "1", "SGG_OID": "621045", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.47627463579505, 35.864574964230293 ], [ 127.47622486320283, 35.864531486897036 ], [ 127.476122907331884, 35.864478428258643 ], [ 127.475990870459782, 35.864447830043915 ], [ 127.475886147310675, 35.864413419744899 ], [ 127.475770566775935, 35.864375960967564 ], [ 127.475823147875218, 35.864450457045528 ], [ 127.475818080378005, 35.864460318577002 ], [ 127.475834933492749, 35.864508927931027 ], [ 127.475915311731498, 35.864599401321776 ], [ 127.476090884602144, 35.864760200801712 ], [ 127.476178319310151, 35.864812208315236 ], [ 127.476206394363786, 35.864787529625332 ], [ 127.476203080300039, 35.864764651263343 ], [ 127.476213922369652, 35.864709407567176 ], [ 127.476251795360966, 35.864666061551709 ], [ 127.47627463579505, 35.864574964230293 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024109160000", "JIBUN": "916전", "BCHK": "1", "SGG_OID": "620493", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.476174977539998, 35.866190196928265 ], [ 127.476101941609329, 35.866250715230159 ], [ 127.476028040936086, 35.866314778769357 ], [ 127.476068297684691, 35.866375831853439 ], [ 127.476232488441568, 35.866292728866654 ], [ 127.476421667030493, 35.866211230217637 ], [ 127.476718489921055, 35.866170879638581 ], [ 127.476719347058292, 35.866143830088852 ], [ 127.476734563944632, 35.865955320978941 ], [ 127.47666795228281, 35.865969778962018 ], [ 127.476573700324963, 35.865985346586875 ], [ 127.476453769312755, 35.866035677284025 ], [ 127.476259290797302, 35.866128840926876 ], [ 127.476174977539998, 35.866190196928265 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024112370040", "JIBUN": "1237-40전", "BCHK": "1", "SGG_OID": "620537", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.481820661572556, 35.866122551515808 ], [ 127.481828466610438, 35.866061876003535 ], [ 127.481751359731007, 35.866039671337631 ], [ 127.481646513773697, 35.866009520420072 ], [ 127.481623086569087, 35.866125369061457 ], [ 127.481697252407145, 35.866100531927323 ], [ 127.481820661572556, 35.866122551515808 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024112370037", "JIBUN": "1237-37전", "BCHK": "1", "SGG_OID": "620504", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.482127821850284, 35.866285609743443 ], [ 127.482080154118705, 35.866191684152362 ], [ 127.481994377418346, 35.866167612712587 ], [ 127.481943518512296, 35.866128278802279 ], [ 127.481970811568303, 35.866100835102145 ], [ 127.48196261626741, 35.866100507382434 ], [ 127.481828466610438, 35.866061876003535 ], [ 127.481820661572556, 35.866122551515808 ], [ 127.481781584022926, 35.866231946804852 ], [ 127.482127821850284, 35.866285609743443 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024109040001", "JIBUN": "904-1전", "BCHK": "1", "SGG_OID": "515138", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.478762715696249, 35.868329595497322 ], [ 127.478838233057402, 35.868300690174749 ], [ 127.478795067051209, 35.86821846150675 ], [ 127.478804607799333, 35.868179084569505 ], [ 127.478864567739649, 35.868146383742086 ], [ 127.478826306856931, 35.868071543767194 ], [ 127.478658606574754, 35.868066216734157 ], [ 127.47860382648426, 35.868045020888722 ], [ 127.478654799411046, 35.868151461919524 ], [ 127.478762715696249, 35.868329595497322 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272034024109000000", "JIBUN": "900답", "BCHK": "1", "SGG_OID": "619933", "COL_ADM_SE": "52720", "layer": "pdf_상전면월포리_1091", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_상전면월포리_1091.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.479480021920239, 35.868402321488105 ], [ 127.479435869952653, 35.868106233245648 ], [ 127.479469496258616, 35.86807851257467 ], [ 127.479377855342491, 35.868084843337392 ], [ 127.479241856984942, 35.868142549756371 ], [ 127.479117582110192, 35.868153804677647 ], [ 127.478864567739649, 35.868146383742086 ], [ 127.478804607799333, 35.868179084569505 ], [ 127.478795067051209, 35.86821846150675 ], [ 127.478838233057402, 35.868300690174749 ], [ 127.478883195682982, 35.868390770480147 ], [ 127.478957882064961, 35.868382074136242 ], [ 127.478976820690718, 35.86844748280398 ], [ 127.479205040640082, 35.868432047568618 ], [ 127.479236465930313, 35.868428669135895 ], [ 127.479367186526815, 35.868421299823211 ], [ 127.479480021920239, 35.868402321488105 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115560001", "JIBUN": "1556-1답", "BCHK": "1", "SGG_OID": "573621", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.539931880065978, 35.898219049057168 ], [ 127.539958730184381, 35.898199525178065 ], [ 127.539958650501717, 35.89813378977086 ], [ 127.539943285467032, 35.898128595473928 ], [ 127.539900317632089, 35.89811355731424 ], [ 127.539847028625289, 35.898066112089488 ], [ 127.539858962826301, 35.897988309420121 ], [ 127.539962177953058, 35.897912125280939 ], [ 127.539984937033793, 35.897895323430212 ], [ 127.53985683036926, 35.897737182029338 ], [ 127.539838531592792, 35.897738742075411 ], [ 127.539814225225157, 35.897759317978789 ], [ 127.539780096490929, 35.897770438930841 ], [ 127.539740957045055, 35.897764585118743 ], [ 127.539666652913482, 35.897783717784975 ], [ 127.539639100883832, 35.897804263135832 ], [ 127.539606539331956, 35.897832554473858 ], [ 127.539596058673794, 35.897878032474758 ], [ 127.539578438115271, 35.897940530663561 ], [ 127.539513124082006, 35.898021303184706 ], [ 127.539474911960554, 35.898065751830039 ], [ 127.539472845679697, 35.898081226204916 ], [ 127.539528116126419, 35.898157979753741 ], [ 127.539584178857794, 35.898157025617103 ], [ 127.539616230012484, 35.898156404354978 ], [ 127.539804641296328, 35.8982284154647 ], [ 127.539931880065978, 35.898219049057168 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115480001", "JIBUN": "1548-1전", "BCHK": "1", "SGG_OID": "573538", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.540058205689249, 35.898504929763696 ], [ 127.54005992205694, 35.898498316046336 ], [ 127.540026484275771, 35.898371104082152 ], [ 127.53982853045801, 35.898389944099065 ], [ 127.539804641296328, 35.8982284154647 ], [ 127.539616230012484, 35.898156404354978 ], [ 127.539584178857794, 35.898157025617103 ], [ 127.539788251392679, 35.89846775665206 ], [ 127.539951094703525, 35.898503165988501 ], [ 127.540058205689249, 35.898504929763696 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115150002", "JIBUN": "1515-2답", "BCHK": "1", "SGG_OID": "573669", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.541691810871853, 35.89791542487356 ], [ 127.541682374527298, 35.897889457802606 ], [ 127.5416095931878, 35.897765838899545 ], [ 127.541523674684925, 35.897642107788826 ], [ 127.541428689929887, 35.897592516560636 ], [ 127.54137025796021, 35.897569103917299 ], [ 127.541260688347066, 35.897573733070452 ], [ 127.541165617111758, 35.897578269937043 ], [ 127.541006878782795, 35.897786861016677 ], [ 127.541104127138851, 35.897760342489107 ], [ 127.541208363426406, 35.897689587114826 ], [ 127.541312042993951, 35.897678793029257 ], [ 127.541459187866351, 35.89774649889906 ], [ 127.541583020607604, 35.897835920937638 ], [ 127.541623230801662, 35.897914579755358 ], [ 127.541638170124756, 35.897992423951841 ], [ 127.541655959100552, 35.898052771454687 ], [ 127.541702347139108, 35.89810001259432 ], [ 127.541751398662285, 35.89810072922316 ], [ 127.541752673418983, 35.89809272056096 ], [ 127.541719095006997, 35.897994087725095 ], [ 127.541691810871853, 35.89791542487356 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115140015", "JIBUN": "1514-15전", "BCHK": "1", "SGG_OID": "573781", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.540921931597396, 35.897752283860378 ], [ 127.54108594404498, 35.897566776749919 ], [ 127.541060810587126, 35.897556822924649 ], [ 127.541022389964837, 35.897516521262773 ], [ 127.540996290787533, 35.897489935043346 ], [ 127.540936913438557, 35.897503467881926 ], [ 127.540906304139725, 35.897603921357394 ], [ 127.540782664600428, 35.897766535923537 ], [ 127.540724886267384, 35.897808459256083 ], [ 127.540921931597396, 35.897752283860378 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115120000", "JIBUN": "1512전", "BCHK": "1", "SGG_OID": "573833", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.539977712672368, 35.897672535540167 ], [ 127.54008225700457, 35.897661837773661 ], [ 127.540157594587029, 35.897631786311329 ], [ 127.54015986478052, 35.897630081815102 ], [ 127.540247344886723, 35.897593910550505 ], [ 127.540257224362307, 35.897590540689315 ], [ 127.54044033434694, 35.897496630979838 ], [ 127.540528186313566, 35.897423858861721 ], [ 127.540476999438752, 35.897384218146243 ], [ 127.540390993136569, 35.89736160469478 ], [ 127.540305837733086, 35.897397531314382 ], [ 127.540216177252688, 35.897453530466784 ], [ 127.540113314225849, 35.897458939596319 ], [ 127.540059937437505, 35.897380501527017 ], [ 127.539998252665626, 35.897324838737909 ], [ 127.539981136240087, 35.897267092517794 ], [ 127.539860154539468, 35.897300610946246 ], [ 127.539726650444493, 35.89736106007706 ], [ 127.539729084845376, 35.897480146814971 ], [ 127.539773416123822, 35.897590285810459 ], [ 127.53979088715478, 35.897672607030408 ], [ 127.539880806933226, 35.897651547748936 ], [ 127.539977712672368, 35.897672535540167 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115090001", "JIBUN": "1509-1 전", "BCHK": "1", "SGG_OID": "740206", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.540390993136569, 35.89736160469478 ], [ 127.540484580378191, 35.897265636228845 ], [ 127.540659870082024, 35.89714731990184 ], [ 127.540651938737852, 35.897222355933927 ], [ 127.54072215587999, 35.897206629637481 ], [ 127.540764985094881, 35.897098397783829 ], [ 127.540795806800261, 35.897004765699336 ], [ 127.540788735172413, 35.896938719212166 ], [ 127.540874518856128, 35.89671957821475 ], [ 127.540807058156432, 35.896705614690013 ], [ 127.540656018427839, 35.896781870075728 ], [ 127.54058926180069, 35.896873383324802 ], [ 127.540538696989515, 35.896943419629849 ], [ 127.540381303694488, 35.89702040614717 ], [ 127.540318449787094, 35.897055358511452 ], [ 127.540301084212331, 35.89707365029674 ], [ 127.540219360368681, 35.897164806908428 ], [ 127.54037007809103, 35.897326865973675 ], [ 127.540390993136569, 35.89736160469478 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115060006", "JIBUN": "1506-6전", "BCHK": "1", "SGG_OID": "573861", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.540936913438557, 35.897503467881926 ], [ 127.540996290787533, 35.897489935043346 ], [ 127.541022389964837, 35.897516521262773 ], [ 127.541060810587126, 35.897556822924649 ], [ 127.54108594404498, 35.897566776749919 ], [ 127.541180410607666, 35.897460106188142 ], [ 127.5412030565425, 35.897402217507057 ], [ 127.541198024390567, 35.897323382432823 ], [ 127.541193503880606, 35.897248122944099 ], [ 127.541180566121682, 35.897215403321802 ], [ 127.541119522912453, 35.897282107337887 ], [ 127.541072997074579, 35.897323791019808 ], [ 127.540957806120133, 35.897433654827083 ], [ 127.540936913438557, 35.897503467881926 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115060003", "JIBUN": "1506-3전", "BCHK": "1", "SGG_OID": "573941", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.54124379450198, 35.897309072476517 ], [ 127.541371333969167, 35.897288771269032 ], [ 127.541375784755203, 35.897260759034644 ], [ 127.541347712181491, 35.897220861571434 ], [ 127.541225134027954, 35.897167591015702 ], [ 127.54120012102959, 35.89719494763029 ], [ 127.541213571220212, 35.897231359993754 ], [ 127.54124379450198, 35.897309072476517 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115050001", "JIBUN": "1505-1전", "BCHK": "1", "SGG_OID": "573745", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.541682374527298, 35.897889457802606 ], [ 127.541709435511976, 35.897866814326775 ], [ 127.541718495528841, 35.897759148610568 ], [ 127.541791285236201, 35.89771446258905 ], [ 127.541852959855774, 35.897668988390436 ], [ 127.541949123962425, 35.897649233288107 ], [ 127.541839530849913, 35.897542849482804 ], [ 127.541875779136191, 35.897514441817705 ], [ 127.541812999468775, 35.897447816916731 ], [ 127.541760656011604, 35.897386399208862 ], [ 127.541721732364849, 35.897321009770799 ], [ 127.541607590494479, 35.897246027060213 ], [ 127.541544661876159, 35.897227528405146 ], [ 127.541347712181491, 35.897220861571434 ], [ 127.541375784755203, 35.897260759034644 ], [ 127.541371333969167, 35.897288771269032 ], [ 127.54124379450198, 35.897309072476517 ], [ 127.541255469256328, 35.897438004146878 ], [ 127.541208940509705, 35.897518422789197 ], [ 127.541165617111758, 35.897578269937043 ], [ 127.541260688347066, 35.897573733070452 ], [ 127.54137025796021, 35.897569103917299 ], [ 127.541428689929887, 35.897592516560636 ], [ 127.541523674684925, 35.897642107788826 ], [ 127.5416095931878, 35.897765838899545 ], [ 127.541682374527298, 35.897889457802606 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115040001", "JIBUN": "1504-1전", "BCHK": "1", "SGG_OID": "573836", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.541949123962425, 35.897649233288107 ], [ 127.542004841339349, 35.897625235109501 ], [ 127.541875779136191, 35.897514441817705 ], [ 127.541839530849913, 35.897542849482804 ], [ 127.541949123962425, 35.897649233288107 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272032021115040000", "JIBUN": "1504전", "BCHK": "1", "SGG_OID": "573843", "COL_ADM_SE": "52720", "layer": "pdf_안천면노성리_ 1505", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_안천면노성리_ 1505.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.542004841339349, 35.897625235109501 ], [ 127.542029168286362, 35.897614292827804 ], [ 127.542067559805318, 35.897622537521663 ], [ 127.542078206328313, 35.897557682103454 ], [ 127.542045652745315, 35.897502285785265 ], [ 127.541916792739542, 35.897434255020528 ], [ 127.541812999468775, 35.897447816916731 ], [ 127.541875779136191, 35.897514441817705 ], [ 127.542004841339349, 35.897625235109501 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023103280001", "JIBUN": "328-1전", "BCHK": "1", "SGG_OID": "555006", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.46627571217229, 35.937214038880185 ], [ 127.466278139673193, 35.936958585419134 ], [ 127.466120697611814, 35.936852381357127 ], [ 127.465920417075537, 35.936718404757734 ], [ 127.465622367097609, 35.936573973106675 ], [ 127.465592883335034, 35.936559685472261 ], [ 127.465583466354374, 35.936912750939513 ], [ 127.465995979281459, 35.937067906033278 ], [ 127.466159620455826, 35.937174798228632 ], [ 127.46627571217229, 35.937214038880185 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023103200000", "JIBUN": "320전", "BCHK": "1", "SGG_OID": "554922", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.464657682972032, 35.939220892410923 ], [ 127.464823529203841, 35.939167773901545 ], [ 127.464781779945497, 35.93904962185912 ], [ 127.46496527950417, 35.939095173533019 ], [ 127.465143706517537, 35.939046349924858 ], [ 127.465175109322217, 35.939017164033991 ], [ 127.465323245453845, 35.938867321381949 ], [ 127.465353498360912, 35.938836715947311 ], [ 127.465514481743682, 35.938746277408704 ], [ 127.465607214986221, 35.938694666085951 ], [ 127.465637685795869, 35.938678614565568 ], [ 127.465714464803526, 35.938635311081008 ], [ 127.465803057363019, 35.938538960647591 ], [ 127.465858928676667, 35.938492646726665 ], [ 127.465760396753979, 35.938356122329388 ], [ 127.465527464720822, 35.938515954509185 ], [ 127.465296190800828, 35.938677122658952 ], [ 127.465228651275666, 35.938723742750867 ], [ 127.465027672802776, 35.938814326342104 ], [ 127.464835996682808, 35.93883928233349 ], [ 127.464623378227614, 35.938874277385978 ], [ 127.464587696293322, 35.938935545326473 ], [ 127.464508049708868, 35.939045973584356 ], [ 127.464593362181731, 35.939122212800413 ], [ 127.464657682972032, 35.939220892410923 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023103140000", "JIBUN": "314전", "BCHK": "1", "SGG_OID": "601086", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.465251547581303, 35.940148495259209 ], [ 127.465305674658495, 35.939881171286501 ], [ 127.465300870209759, 35.939876386306864 ], [ 127.465150267377041, 35.939706690163561 ], [ 127.4651481083812, 35.939699452632482 ], [ 127.464960472821261, 35.939629088394838 ], [ 127.464917260902141, 35.939611663262397 ], [ 127.464696091800661, 35.939588967823994 ], [ 127.464802653154834, 35.93977210962057 ], [ 127.464836599647612, 35.939905243124841 ], [ 127.464900526715951, 35.939909736810669 ], [ 127.464914798969971, 35.939960682183134 ], [ 127.465251547581303, 35.940148495259209 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023103070000", "JIBUN": "307답", "BCHK": "1", "SGG_OID": "554916", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.463669398901004, 35.939388103160191 ], [ 127.463676737023036, 35.939346510282846 ], [ 127.46371726785604, 35.939320371825922 ], [ 127.463828655149229, 35.939305045572972 ], [ 127.463827940740543, 35.939254687717316 ], [ 127.463827527609368, 35.939240837437715 ], [ 127.463776551848866, 35.939226064366906 ], [ 127.463810776998145, 35.939182835846282 ], [ 127.463644092365186, 35.939162497110289 ], [ 127.463476501957189, 35.939119802166815 ], [ 127.463436983394587, 35.939127542588416 ], [ 127.463469391860144, 35.939141558132498 ], [ 127.463520591335296, 35.939219542590209 ], [ 127.463456622420523, 35.939249646462358 ], [ 127.463315899267172, 35.939283830773768 ], [ 127.463334400876775, 35.939294267908053 ], [ 127.463462206918635, 35.939359935249932 ], [ 127.463669398901004, 35.939388103160191 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023103060000", "JIBUN": "306답", "BCHK": "1", "SGG_OID": "554920", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.463065715914652, 35.939279809239252 ], [ 127.463182711968642, 35.93925323272039 ], [ 127.463315899267172, 35.939283830773768 ], [ 127.463456622420523, 35.939249646462358 ], [ 127.463520591335296, 35.939219542590209 ], [ 127.463469391860144, 35.939141558132498 ], [ 127.463436983394587, 35.939127542588416 ], [ 127.463305937771736, 35.939101199236077 ], [ 127.463238913041394, 35.939120364831062 ], [ 127.46315516645582, 35.939193109607331 ], [ 127.463068109542732, 35.939247382871649 ], [ 127.463065715914652, 35.939279809239252 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023103050000", "JIBUN": "305답", "BCHK": "1", "SGG_OID": "554906", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.462996917196648, 35.939384652233635 ], [ 127.463141856182133, 35.939473163255315 ], [ 127.463189589984395, 35.939505964606958 ], [ 127.463678132400915, 35.939548109555908 ], [ 127.4638994536339, 35.939538010608821 ], [ 127.463959630396559, 35.939507551608322 ], [ 127.4641256862174, 35.93942745950865 ], [ 127.464355261159696, 35.93931814780106 ], [ 127.464318055706073, 35.939218912872704 ], [ 127.464099030106354, 35.939388872531723 ], [ 127.463846921704743, 35.939440655054753 ], [ 127.463669398901004, 35.939388103160191 ], [ 127.463462206918635, 35.939359935249932 ], [ 127.463334400876775, 35.939294267908053 ], [ 127.463315899267172, 35.939283830773768 ], [ 127.463182711968642, 35.93925323272039 ], [ 127.463065715914652, 35.939279809239252 ], [ 127.463031308705965, 35.939329923628563 ], [ 127.462996917196648, 35.939384652233635 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023103000000", "JIBUN": "300전", "BCHK": "1", "SGG_OID": "554859", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.462973475709461, 35.940001894092696 ], [ 127.463003634496587, 35.940073056242966 ], [ 127.463391705450164, 35.939985343158433 ], [ 127.463432073637819, 35.939969272138065 ], [ 127.463399721353966, 35.939881166443165 ], [ 127.463527187254485, 35.939838714730016 ], [ 127.463281276497611, 35.939632162326355 ], [ 127.463189589984395, 35.939505964606958 ], [ 127.463060100213454, 35.939543358844816 ], [ 127.462842966380293, 35.93954746501133 ], [ 127.462891621221914, 35.939734931646271 ], [ 127.462973475709461, 35.940001894092696 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105810000", "JIBUN": "581전", "BCHK": "1", "SGG_OID": "554801", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.457766389863792, 35.941044539743217 ], [ 127.457919300098851, 35.940974059197693 ], [ 127.457990243613423, 35.940940137580348 ], [ 127.458073025243152, 35.940896942321665 ], [ 127.45808303948543, 35.940828753388416 ], [ 127.458063071320467, 35.940744402323375 ], [ 127.458020223258629, 35.940610877161674 ], [ 127.457857764027736, 35.940656871733346 ], [ 127.457581548458521, 35.940804100687991 ], [ 127.457639593184709, 35.940876465015329 ], [ 127.457712084966303, 35.940984661295218 ], [ 127.457766389863792, 35.941044539743217 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105790000", "JIBUN": "579전", "BCHK": "1", "SGG_OID": "554807", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.45808303948543, 35.940828753388416 ], [ 127.458195707430122, 35.940833200420734 ], [ 127.458377560087854, 35.94077931793484 ], [ 127.458483704374459, 35.940730554003949 ], [ 127.458458154293481, 35.940629578578275 ], [ 127.458417581552041, 35.940462095645188 ], [ 127.458409022099616, 35.940449880540584 ], [ 127.458315029389084, 35.940472534654866 ], [ 127.458100938747435, 35.940534155054301 ], [ 127.458020223258629, 35.940610877161674 ], [ 127.458063071320467, 35.940744402323375 ], [ 127.45808303948543, 35.940828753388416 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105770000", "JIBUN": "577전", "BCHK": "1", "SGG_OID": "554812", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.458515616214754, 35.940725719088604 ], [ 127.458796335022413, 35.94071607929947 ], [ 127.458883329216235, 35.940707835070683 ], [ 127.459064832557075, 35.9407011501727 ], [ 127.45911809345354, 35.940675911029771 ], [ 127.45915226303525, 35.940585973414684 ], [ 127.459108464584077, 35.940489745072355 ], [ 127.459036452881435, 35.940399716554026 ], [ 127.458716363379366, 35.940427369204436 ], [ 127.458417581552041, 35.940462095645188 ], [ 127.458458154293481, 35.940629578578275 ], [ 127.458483704374459, 35.940730554003949 ], [ 127.458515616214754, 35.940725719088604 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105700000", "JIBUN": "570전", "BCHK": "1", "SGG_OID": "554827", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.459887366525152, 35.940429410035534 ], [ 127.46000367781042, 35.940423864868769 ], [ 127.460162305431069, 35.940409361922548 ], [ 127.460112495775775, 35.940247322228814 ], [ 127.459877559352449, 35.940241460388215 ], [ 127.459887366525152, 35.940429410035534 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023102630000", "JIBUN": "263대", "BCHK": "1", "SGG_OID": "554884", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.461108403461566, 35.939871954958022 ], [ 127.461158530912286, 35.939807226094239 ], [ 127.461105004714753, 35.939729006207124 ], [ 127.461058738826949, 35.93978692500805 ], [ 127.461077529687046, 35.939832040627834 ], [ 127.461108403461566, 35.939871954958022 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023102380000", "JIBUN": "238전", "BCHK": "1", "SGG_OID": "554987", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_306", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_306.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.466298579099728, 35.937530966284939 ], [ 127.466328042928112, 35.937424417178249 ], [ 127.466312422151717, 35.93732871318312 ], [ 127.466305578676099, 35.937293636852722 ], [ 127.46627571217229, 35.937214038880185 ], [ 127.466159620455826, 35.937174798228632 ], [ 127.466126036759434, 35.937304542828464 ], [ 127.466199045739785, 35.937344445974986 ], [ 127.466182711642517, 35.937427881803799 ], [ 127.466298579099728, 35.937530966284939 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105160002", "JIBUN": "516-2전", "BCHK": "1", "SGG_OID": "556751", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.459117019646186, 35.923492091130953 ], [ 127.45920146590926, 35.923498744749658 ], [ 127.459226731059346, 35.923528037549389 ], [ 127.459458186265323, 35.923469097646652 ], [ 127.4596406640065, 35.923409587170113 ], [ 127.459633513326978, 35.923370465011644 ], [ 127.459620206641077, 35.923287936053072 ], [ 127.45943454771438, 35.923337581148182 ], [ 127.459109953992183, 35.923425372944259 ], [ 127.459117019646186, 35.923492091130953 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105150002", "JIBUN": "515-2 전", "BCHK": "1", "SGG_OID": "1196581", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.459902149485487, 35.923003837517165 ], [ 127.459904106693827, 35.923010832604227 ], [ 127.459941622832332, 35.923022225105797 ], [ 127.459975305700738, 35.923146943925197 ], [ 127.46002024714771, 35.923101034858277 ], [ 127.459971298834631, 35.922982565798108 ], [ 127.459941646703058, 35.922911175408963 ], [ 127.459913112480166, 35.922841493080817 ], [ 127.460128857087454, 35.922781205952674 ], [ 127.460093599748205, 35.922633277487698 ], [ 127.460062249001069, 35.922497960325799 ], [ 127.460033299639761, 35.922373628992524 ], [ 127.459972446464391, 35.922175500559554 ], [ 127.459988697427718, 35.922169183962076 ], [ 127.459990846659991, 35.922061640932291 ], [ 127.459773393964696, 35.922111696354555 ], [ 127.459575324479744, 35.922049221888422 ], [ 127.459576353755935, 35.922066314304288 ], [ 127.459583377956164, 35.922183438457829 ], [ 127.459737004820084, 35.922232203590887 ], [ 127.459704860600979, 35.922258840472139 ], [ 127.459684536361323, 35.922315821728844 ], [ 127.459664321441778, 35.922370630599076 ], [ 127.459717274005968, 35.92251305724686 ], [ 127.459766742827455, 35.922643123270994 ], [ 127.459902149485487, 35.923003837517165 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105100002", "JIBUN": "510-2답", "BCHK": "1", "SGG_OID": "556822", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.459796150857187, 35.92201739485224 ], [ 127.459854783207888, 35.922001642825983 ], [ 127.459874270063594, 35.921924387048378 ], [ 127.460114811404083, 35.92172827995411 ], [ 127.460107706242212, 35.921670186736165 ], [ 127.460117633108908, 35.921633612930734 ], [ 127.460146917090711, 35.921543432084349 ], [ 127.460146470519078, 35.921539008748191 ], [ 127.46012970080811, 35.92147272421343 ], [ 127.460115297895953, 35.921417209352711 ], [ 127.459998798146785, 35.921321934600883 ], [ 127.459971299206657, 35.921312513604136 ], [ 127.45987775309294, 35.921385527995525 ], [ 127.459842952305976, 35.921412544563012 ], [ 127.459647124626557, 35.921465680519155 ], [ 127.459622861088917, 35.921415935051698 ], [ 127.459636366288649, 35.921350436151663 ], [ 127.459585919040208, 35.921392517837901 ], [ 127.459582618336199, 35.921421523020243 ], [ 127.459563443000107, 35.921595101094923 ], [ 127.459665067838159, 35.921775833637994 ], [ 127.45969516508832, 35.921828467804936 ], [ 127.459796150857187, 35.92201739485224 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105090002", "JIBUN": "509-2전", "BCHK": "1", "SGG_OID": "556830", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.459665067838159, 35.921775833637994 ], [ 127.459563443000107, 35.921595101094923 ], [ 127.459582618336199, 35.921421523020243 ], [ 127.459422164999225, 35.921362626844726 ], [ 127.45931208972992, 35.921393769577527 ], [ 127.459302635959915, 35.921522104816276 ], [ 127.459316721266504, 35.921622574368627 ], [ 127.459403758825559, 35.921731201225363 ], [ 127.459467039523474, 35.921810664693595 ], [ 127.459665067838159, 35.921775833637994 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105080012", "JIBUN": "508-12전", "BCHK": "1", "SGG_OID": "556845", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.459969633509559, 35.921060382670738 ], [ 127.459957456909834, 35.921043107514322 ], [ 127.459900403112812, 35.920959799301755 ], [ 127.459824340851696, 35.920846489556247 ], [ 127.459795216538694, 35.920735830465645 ], [ 127.459523627191899, 35.920848466245445 ], [ 127.459581605826514, 35.920932762465391 ], [ 127.459685280732202, 35.921009962826218 ], [ 127.459758546312699, 35.921064865560304 ], [ 127.459944006670398, 35.921144952874663 ], [ 127.460017969652043, 35.921111396998405 ], [ 127.459969633509559, 35.921060382670738 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105080002", "JIBUN": "508-2답", "BCHK": "1", "SGG_OID": "556870", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.45963951043359, 35.919997523630471 ], [ 127.459613587851109, 35.919948199044114 ], [ 127.459648032366673, 35.919847976916749 ], [ 127.459697134197455, 35.919705350004712 ], [ 127.459660169812906, 35.919533842631111 ], [ 127.45963237655954, 35.919404108348992 ], [ 127.45963886720979, 35.919309634581928 ], [ 127.459448193824599, 35.919250826677256 ], [ 127.45942721302707, 35.919393706741097 ], [ 127.459421221502367, 35.919434501279426 ], [ 127.459494136156053, 35.919680574630171 ], [ 127.459515959005856, 35.91978368231802 ], [ 127.459416863005103, 35.919981565044417 ], [ 127.459412604031712, 35.919986565094305 ], [ 127.459477502578352, 35.92008937330511 ], [ 127.459616888404057, 35.920084407489362 ], [ 127.45963951043359, 35.919997523630471 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023106560000", "JIBUN": "656답", "BCHK": "1", "SGG_OID": "556688", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.454663856608434, 35.924187969178824 ], [ 127.454569106960591, 35.92407669136675 ], [ 127.454394077017525, 35.924071412646917 ], [ 127.454353801343927, 35.924114282892731 ], [ 127.454177133744523, 35.924121068497008 ], [ 127.454111418622531, 35.924146568732233 ], [ 127.454081290000957, 35.924169609612832 ], [ 127.454223444991371, 35.92416900155235 ], [ 127.454243632380312, 35.924234976603124 ], [ 127.454385087388687, 35.924259271986188 ], [ 127.454513236538958, 35.92424689227154 ], [ 127.454663856608434, 35.924187969178824 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023106550000", "JIBUN": "655전", "BCHK": "1", "SGG_OID": "556661", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.455085042325038, 35.92430747698743 ], [ 127.455075270296234, 35.924305657371605 ], [ 127.45491389353981, 35.92427566115461 ], [ 127.454824870451887, 35.924367976898118 ], [ 127.454842561837097, 35.924377039559829 ], [ 127.454947399093285, 35.924430771540706 ], [ 127.455085042325038, 35.92430747698743 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023106520000", "JIBUN": "652답", "BCHK": "1", "SGG_OID": "556647", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.453206256870672, 35.924530116702918 ], [ 127.453436705634331, 35.924485774087245 ], [ 127.453471029490785, 35.924407427090351 ], [ 127.453618939543887, 35.924325768453038 ], [ 127.453594859282845, 35.924272677526076 ], [ 127.453736349573575, 35.924131940226296 ], [ 127.453390868837118, 35.924141415245863 ], [ 127.453144783589138, 35.924265061789022 ], [ 127.453039558673581, 35.924285167495853 ], [ 127.45309515140103, 35.924383219552134 ], [ 127.453099505210915, 35.924390890670814 ], [ 127.453241650733574, 35.924386597774664 ], [ 127.453173730422108, 35.924472551318175 ], [ 127.453206256870672, 35.924530116702918 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105270000", "JIBUN": "527전", "BCHK": "1", "SGG_OID": "556604", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.456497639929481, 35.924577691998373 ], [ 127.456488267185108, 35.924519859523762 ], [ 127.456138548799984, 35.924489974750074 ], [ 127.455750176861912, 35.924462902853584 ], [ 127.455714470852357, 35.924516174483671 ], [ 127.455246770582207, 35.924408677854323 ], [ 127.45519505409645, 35.924524149671036 ], [ 127.45550414519596, 35.924572188403211 ], [ 127.455631392666618, 35.924605530316981 ], [ 127.455747088402646, 35.924635842607465 ], [ 127.455997581079188, 35.924700098599814 ], [ 127.456315851825607, 35.924739169293829 ], [ 127.456572726942383, 35.924770450926566 ], [ 127.456506174318406, 35.92463037261188 ], [ 127.456497639929481, 35.924577691998373 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105240000", "JIBUN": "524답", "BCHK": "1", "SGG_OID": "556687", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.455797413198056, 35.924255873738787 ], [ 127.4563694384467, 35.924228842905059 ], [ 127.456333396044826, 35.924111053466518 ], [ 127.456259883276374, 35.924084664536124 ], [ 127.456236806103533, 35.924009670445621 ], [ 127.456215398245092, 35.923937878407301 ], [ 127.455866157990343, 35.923915570364734 ], [ 127.455633040999629, 35.924085712453845 ], [ 127.455719857034026, 35.924109500957087 ], [ 127.455797413198056, 35.924255873738787 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105220003", "JIBUN": "522-3답", "BCHK": "1", "SGG_OID": "556689", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.457756248703291, 35.924015684840469 ], [ 127.457776814522518, 35.923958009054651 ], [ 127.457781381387051, 35.923888894370798 ], [ 127.457812219640104, 35.923866147273564 ], [ 127.457813663965837, 35.923805110466866 ], [ 127.457528652334091, 35.92384598270413 ], [ 127.457418922489609, 35.923860819134084 ], [ 127.457444059023445, 35.923985544075819 ], [ 127.457520879298059, 35.92414409415256 ], [ 127.457514749023503, 35.92416480968442 ], [ 127.457438888083701, 35.924200408003209 ], [ 127.457480528807409, 35.924237335485323 ], [ 127.457539465777955, 35.924224097863828 ], [ 127.457728922523984, 35.924150270267496 ], [ 127.457756248703291, 35.924015684840469 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105220002", "JIBUN": "522-2답", "BCHK": "1", "SGG_OID": "556683", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.457480528807409, 35.924237335485323 ], [ 127.457438888083701, 35.924200408003209 ], [ 127.457514749023503, 35.92416480968442 ], [ 127.457520879298059, 35.92414409415256 ], [ 127.457444059023445, 35.923985544075819 ], [ 127.457418922489609, 35.923860819134084 ], [ 127.457393768671579, 35.923864339327309 ], [ 127.457276545148289, 35.923940361572512 ], [ 127.457257154584909, 35.923975060451895 ], [ 127.45728368504713, 35.924062757593227 ], [ 127.457261005311238, 35.924188502231374 ], [ 127.45724646103676, 35.924262575485947 ], [ 127.457242054125658, 35.924276615357755 ], [ 127.457258812541141, 35.924281382335849 ], [ 127.457272932654774, 35.924284005386966 ], [ 127.457480528807409, 35.924237335485323 ] ] ] ] } },
{ "type": "Feature", "properties": { "PNU": "5272031023105220001", "JIBUN": "522-1답", "BCHK": "1", "SGG_OID": "556699", "COL_ADM_SE": "52720", "layer": "pdf_용담면호계리_516", "path": "E:\\한진수\\Image Data\\layers\\용담댐\\지적도\\pdf_용담면호계리_516.shp" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 127.457756248703291, 35.924015684840469 ], [ 127.457869467457499, 35.924075799175213 ], [ 127.458100083743702, 35.924018883831764 ], [ 127.458117040073532, 35.923977128430401 ], [ 127.458173982420504, 35.923836716464763 ], [ 127.458114842670284, 35.923762571877468 ], [ 127.457813663965837, 35.923805110466866 ], [ 127.457812219640104, 35.923866147273564 ], [ 127.457781381387051, 35.923888894370798 ], [ 127.457776814522518, 35.923958009054651 ], [ 127.457756248703291, 35.924015684840469 ] ] ] ] } }
]
}
