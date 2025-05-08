import React, { useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

const VideoGraph = ({ videoId, data }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!videoId || !data) return;

    const nodes = new DataSet([
      {
        id: videoId,
        label: "Selected Video",
        shape: "circularImage",
        image: data.nodes.find(n => n.id === videoId)?.image || "https://via.placeholder.com/150?text=No+Thumb",
        size: 30,
        color: {
          border: "#4361ee",
          background: "#4361ee",
          highlight: {
            border: "#4361ee",
            background: "#4895ef"
          }
        },
        font: {
          color: "#fff",
          size: 14,
          face: "arial",
          strokeWidth: 2,
          strokeColor: "#1b263b"
        }
      },
      // Similar videos
      ...data.nodes.filter(n => n.id !== videoId).map(node => ({
        id: node.id,
        label: node.label,
        title: node.title,
        shape: "circularImage",
        image: node.image,
        size: 25,
        color: {
          border: "#3a0ca3",
          background: "#3a0ca3",
          highlight: {
            border: "#3a0ca3",
            background: "#7209b7"
          }
        },
        font: {
          color: "#fff",
          size: 12,
          face: "arial",
          strokeWidth: 2,
          strokeColor: "#1b263b"
        }
      }))
    ]);

    // Create edges
    const edges = new DataSet(
      data.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        label: edge.label,
        width: 2 + (edge.value / 25), // Thicker edge for higher similarity
        color: {
          color: edge.color,
          highlight: edge.color,
          hover: edge.color
        },
        smooth: {
          type: "curvedCW",
          roundness: 0.2
        },
        font: {
          color: "#1b263b",
          size: 12,
          face: "arial",
          strokeWidth: 2,
          strokeColor: "#ffffff"
        }
      }))
    );

    // Network options
    const options = {
      nodes: {
        shadow: true,
        shapeProperties: {
          useBorderWithImage: true
        }
      },
      edges: {
        arrows: {
          to: {
            enabled: false
          }
        },
        selectionWidth: 2,
        hoverWidth: 2
      },
      physics: {
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
          damping: 0.4
        },
        solver: "forceAtlas2Based",
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        hideEdgesOnDrag: true,
        multiselect: true,
        navigationButtons: true
      }
    };

    // Initialize network
    const network = new Network(containerRef.current, { nodes, edges }, options);

    // Center on the main video
    network.focus(videoId, {
      scale: 1.2,
      animation: {
        duration: 1000,
        easingFunction: "easeInOutQuad"
      }
    });

    return () => network.destroy();
  }, [videoId, data]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "600px",
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}
    />
  );
};

export default VideoGraph;