/**
 * Created by joonhaengLee on 11/3/20
 */

global = {
    vertices : [],
    colors : [],
    normals: [],
    uvs: [],
    faces: []
}

var scene, camera, renderer, raycaster;
var areachart , areachart2, areachart3
var timeline;

var liveUnfoldMode = true;

global.vertices = [6.439957, 3.517129, -7.07418,6.866546, -2.04968, -7.120211,3.24298, -1.690465, -9.791324,6.433772, 2.760283, 7.140547,6.558315, -2.480442, 7.285081,9.242905, -1.307665, 4.037015,2.744632, 2.614946, 9.291832,2.503041, -2.112175, 9.880633,5.604692, 8.356153, -2.189796,9.869572, 1.228414, -2.697305,9.0314, 4.068237, 2.07233,2.94003, 6.348561, 7.286044,5.452957, 7.700658, 3.84312,0.843251, 7.010461, -7.216643,2.370898, 3.478878, -9.14975,0.117151, 3.790492, 9.294802,2.503041, -2.112175, 9.880633,-0.199872, 3.95015, -9.221737,3.24298, -1.690465, -9.791324,0.245659, 9.971934, -1.99697,0, 9.189922, 3.942756,-2.457492, 6.559724, 7.286151,-3.609134, 6.272201, -7.15106,-3.562735, 9.390795, -1.836385,-5.529561, 7.388563, 4.133537,-2.633545, 2.741168, 9.291233,2.503041, -2.112175, 9.880633,-3.477393, 2.322101, -9.145335,3.24298, -1.690465, -9.791324,-8.448949, 5.688838, -1.887346,-6.347188, 2.9424, 7.285766,-7.010461, 0.843251, -7.216643,-9.117042, 1.579547, 4.256829,-3.801342, 0.102211, 9.28838,2.503041, -2.112175, 9.880633,-3.95015, -0.199872, -9.221737,3.24298, -1.690465, -9.791324,-9.856498, 0.080611, -2.200876,-6.559728, -2.456236, 7.286731,-6.562107, -2.815343, -7.000899,-8.507642, -3.650037, -3.781173,-2.735964, -2.625421, 9.291584,2.503041, -2.112175, 9.880633,-2.322101, -3.477393, -9.145335,3.24298, -1.690465, -9.791324,-5.00012, -6.932966, -5.485238,-5.600421, -8.487182, -0.480276,-9.20029, -3.928807, 1.66601,-2.643878, -6.484095, 7.424394,-6.433772, -6.562107, 3.942756,-0.843251, -7.010461, -7.216643,-1.219045, -9.220809, 4.082622,-0.117151, -3.790492, 9.294802,2.503041, -2.112175, 9.880633,0.199872, -3.95015, -9.221737,3.24298, -1.690465, -9.791324,1.208109, -9.846563, -2.797877,3.401084, -6.47374, -7.051224,3.039049, -6.294651, 7.27732,2.503041, -2.112175, 9.880633,8.412124, -5.704799, -1.710495,3.914868, -9.183287, 1.744573,6.866546, -2.04968, -7.120211,3.24298, -1.690465, -9.791324,9.242905, -1.307665, 4.037015,6.562107, -6.433772, 3.942756,6.558315, -2.480442, 7.285081,9.869572, 1.228414, -2.697305]
global.faces = [[1,2,3],[4,5,6],[8,5,7],[9,10,1],[9,11,10],[12,4,13],[14,1,15],[16,7,12],[17,7,16],[18,15,19],[20,9,14],[13,9,20],[22,12,21],[23,14,18],[20,14,24],[25,21,24],[26,16,22],[27,16,26],[28,18,29],[30,24,23],[31,22,25],[32,23,28],[33,25,30],[34,26,31],[35,26,34],[36,28,37],[38,30,32],[39,31,33],[40,32,36],[38,32,41],[42,34,39],[43,34,42],[44,36,45],[46,40,44],[47,48,41],[49,39,50],[51,46,44],[52,50,47],[53,42,49],[54,42,53],[55,44,56],[57,46,51],[58,51,55],[59,49,52],[60,53,59],[61,57,58],[61,62,57],[63,58,64],[65,66,61],[67,59,66],[68,61,63],[10,2,1],[6,10,11],[4,6,11],[1,3,15],[13,11,9],[4,11,13],[7,4,12],[9,1,14],[14,15,18],[12,13,21],[16,12,22],[21,20,24],[22,21,25],[23,18,28],[25,24,30],[26,22,31],[30,23,32],[31,25,33],[32,28,36],[33,30,38],[34,31,39],[48,38,41],[33,38,48],[39,33,48],[40,36,44],[41,40,46],[47,41,46],[50,48,47],[39,48,50],[42,39,49],[49,50,52],[51,44,55],[47,46,57],[52,47,57],[57,51,58],[52,57,62],[59,52,62],[53,49,59],[58,55,64],[66,62,61],[59,62,66],[61,58,63],[67,66,65],[60,59,67],[65,61,68],[5,4,7],[13,20,21],[14,23,24],[32,40,41]]

computeMesh(global.vertices,global.faces)
initThreeView()
//console.log(global)
areachart = new AreaChart("chartVis", global.faceAreaList, 'brush_1', "Face Area");
areachart2 = new AreaChart("chartVis", global.edgeAngles,'brush_2', "Angle Between Faces");
areachart3 = new AreaChart("chartVis", global.faceMinAngleList,'brush_3', "Minimum Face Angle");

function loadNewModel(){
    readFile()
    computeMesh(global.vertices,global.faces)
    initThreeView()
}

function visualize(){
    areachart = new AreaChart("chartVis", global.faceAreaList);
}

function brushed() {

    //console.log("burshed!")
    // TO-DO: React to 'brushed' event
    // Get the extent of the current brush
    let selectionRange_1 = d3.brushSelection(d3.select(".brush_1").node());
    //console.log(selectionRange_1)

    let selectionRange_2 = d3.brushSelection(d3.select(".brush_2").node());
    //console.log(selectionRange_2)

    let selectionRange_3 = d3.brushSelection(d3.select(".brush_3").node());
    //console.log(selectionRange_3)
}
function clickInput(){

    //console.log("click")
    document.getElementById("file").click()
    var input = document.getElementById("file");
    //console.log(input)
    input.click()
    //event.preventDefault();
    // Trigger the button element with a click
    //document.getElementById("myBtn").click()

}
function reset(){

    computeMesh(global.vertices,global.faces)
    initThreeView()

}