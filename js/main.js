

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");


// (1) Load data with promises
let promises = [
    d3.csv("data/2004-2020.csv"),
	d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
];

Promise.all(promises)
    .then( function(data){ createVis(data)})
    .catch( function (err){console.log(err)} );

	function createVis(data){
		let allData = data;

	console.log(allData);

	// Create visualization instances
	let myVis = new MyVis("trend", allData[0], allData[1]);

}

// below part is for cube Visualization
global = {
	vertices : [],
	colors : [],
	normals: [],
	uvs: [],
	faces: []
}

var scene, camera, renderer, raycaster;
var liveUnfoldMode = true;

global.vertexList = [[0,0,12.24745],[11.54701,0,4.082483],[-5.773503,10,4.082483],[-5.773503,-10,4.082483],[5.773503,10,-4.082483],[5.773503,-10,-4.082483],[-11.54701,0,-4.082483],[0,0,-12.24745]]
global.edgeList = [[0,1],[0,2],[0,3],[1,4],[1,5],[2,4],[2,6],[3,5],[3,6],[4,7],[5,7],[6,7]]
global.faceList =[[0,1,4,2],[0,2,6,3],[0,3,5,1],[1,5,7,4],[2,4,7,6],[3,6,7,5]]

initThreeView()