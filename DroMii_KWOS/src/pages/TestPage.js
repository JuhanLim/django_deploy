import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, transformExtent } from 'ol/proj';

const API_BASE_URL = 'http://175.45.204.163/api/yongdam';

const TestPage = () => {
  const mapRef = useRef(null);
  const [mapConfig, setMapConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMapConfig = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-xml/j_261/`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'application/xml');

      const tileSets = xmlDoc.getElementsByTagName('TileSet');
      const zoomLevels = Array.from(tileSets).map(tileSet => parseInt(tileSet.getAttribute('order'), 10));
      const minZoom = Math.min(...zoomLevels);
      const maxZoom = Math.max(...zoomLevels);

      const srs = xmlDoc.getElementsByTagName('SRS')[0].textContent;
      const boundingBox = xmlDoc.getElementsByTagName('BoundingBox')[0];
      const extents = [
        parseFloat(boundingBox.getAttribute('minx')),
        parseFloat(boundingBox.getAttribute('miny')),
        parseFloat(boundingBox.getAttribute('maxx')),
        parseFloat(boundingBox.getAttribute('maxy')),
      ];

      setMapConfig({ minZoom, maxZoom, extents, srs });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapConfig();
  }, [fetchMapConfig]);

  useEffect(() => {
    if (!mapConfig) return;

    const { minZoom, maxZoom, extents, srs } = mapConfig;

    // extents를 EPSG:3857로 변환
    const extentsConverted = transformExtent(extents, srs, 'EPSG:3857');

    // TMS 소스 생성
    const tmsSource = new XYZ({
      url: `${API_BASE_URL}/get_v2_image/j_261/orthophoto/{z}/{x}/{-y}.png`,
      minZoom: minZoom,
      maxZoom: maxZoom,
      tilePixelRatio: 1,
      attributions: '© Your Attribution'
    });

    // TMS 레이어 생성
    const tmsLayer = new TileLayer({
      source: tmsSource
    });

    // 맵 생성
    const map = new Map({
      target: mapRef.current,
      layers: [tmsLayer],
      view: new View({
        center: fromLonLat([(extents[0] + extents[2]) / 2, (extents[1] + extents[3]) / 2]), // 중심점 계산
        zoom: minZoom,
        minZoom: minZoom,
        maxZoom: maxZoom,
        extent: extentsConverted
      })
    });

    // extents로 지도를 맞춤
    map.getView().fit(extentsConverted);

    return () => {
      map.setTarget(null);
    };
  }, [mapConfig]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
};

export default TestPage;