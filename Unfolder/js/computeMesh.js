// javascript
//
// computeMesh.js
// 
// The Nature of Mathematical Modeling / Geometric Folding Algorithms
//
// Joonhaeng Lee 5/16/20 -
//
// This code compute followings from input mesh face coordinates extracted from stp file.
// vertexList, faceList, faceCenterList, faceNormalList, faceAdjacentList, faceFoldTypeList, faceFoldAngleList
//
// Sample input structure
// var input = new Float32Array([-2.581341,0.381963,-2.188974,0.655656,2.248737,-2.169132,0.504045,-0.99214,-1.60386,-2.768843,-1.320656,0.627337,-3.189769,2.38207,0.463149,-2.581341,0.381963,-2.188974,0.605968,-0.066726,1.952075,-2.768843,-1.320656,0.627337,0.504045,-0.99214,-1.60386,-2.768843,-1.320656,0.627337,0.605968,-0.066726,1.952075,-0.376937,2.162014,2.179671,-2.768843,-1.320656,0.627337,-0.376937,2.162014,2.179671,-3.189769,2.38207,0.463149,-0.376937,2.162014,2.179671,0.655656,2.248737,-2.169132,-3.189769,2.38207,0.463149,-3.189769,2.38207,0.463149,0.655656,2.248737,-2.169132,-2.581341,0.381963,-2.188974,-2.768843,-1.320656,0.627337,-2.581341,0.381963,-2.188974,0.504045,-0.99214,-1.60386,0.605968,-0.066726,1.952075,0.504045,-0.99214,-1.60386,0.655656,2.248737,-2.169132,-0.376937,2.162014,2.179671,0.605968,-0.066726,1.952075,0.655656,2.248737,-2.169132]);


var faceNormal = function(a,b,c){ 
	// abc is three points 
	// a, b, c are the array of three numbers

	tempVectorA = []
	tempVectorB = []
	tempVectorA.push(b[0]-a[0],b[1]-a[1],b[2]-a[2])
	tempVectorB.push(c[0]-a[0],c[1]-a[1],c[2]-a[2])
	
	// compute crossproduct logic
	// cx = aybz − azby
	// cy = azbx − axbz
	// cz = axby − aybx
	
	var crossProductVector = crossProduct(tempVectorA,tempVectorB)
	var scale = Math.sqrt(crossProductVector[0]*crossProductVector[0]+crossProductVector[1]*crossProductVector[1]+crossProductVector[2]*crossProductVector[2]);
	var nomalizedV = [crossProductVector[0]/scale,crossProductVector[1]/scale,crossProductVector[2]/scale]

	return nomalizedV;
} 

var faceCenter = function(a,b,c){
	// abc is three points 
	// a, b, c are the array of three numbers
	var tempCenter = [];
	var tempX = (a[0]+b[0]+c[0])/3;
	var tempY = (a[1]+b[1]+c[1])/3;
	var tempZ = (a[2]+b[2]+c[2])/3;

	tempCenter.push(tempX,tempY,tempZ);
	return tempCenter;
}

var crossProduct = function(a,b){

	tempVector = []
	tempVector.push(a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])

	return tempVector;
}

var getDistance = function(a,b){

	var distance = Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1])+(a[2]-b[2])*(a[2]-b[2]))
	return distance
}

var unitVector = function(a){
	var distance = Math.sqrt((a[0])*(a[0])+(a[1])*(a[1])+(a[2])*(a[2]))
	var unitVector = []
	unitVector.push(a[0]/distance,a[1]/distance,a[2]/distance)
	return unitVector;
}

var sizeVector = function(a){

	var distance = Math.sqrt((a[0])*(a[0])+(a[1])*(a[1])+(a[2])*(a[2]))
	return distance;
}

var addVector = function(a,b){

	var vector=[];
	vector.push( a[0] + b[0], a[1] + b[1], a[2] + b[2]);
	return vector
}

var multiVector = function(a,b){ //a is array of 3, b is single value

	var vector=[];
	vector.push( a[0]*b, a[1]*b, a[2]*b);
	return vector
}

var getAngle = function(a,b){ // get angle between two vectors, assumethat two vectors are normalized vector

	var cosTheta = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
	return Math.acos(cosTheta);
}


var faceArea = function(pt1,pt2,pt3){ // abc are points

	var a_1 = Number((pt2[0] - pt1[0]).toFixed(2))
	var a_2 = Number((pt2[1] - pt1[1]).toFixed(2))
	var a_3 = Number((pt2[2] - pt1[2]).toFixed(2))
	var b_1 = Number((pt3[0] - pt1[0]).toFixed(2))
	var b_2 = Number((pt3[1] - pt1[1]).toFixed(2))
	var b_3 = Number((pt3[2] - pt1[2]).toFixed(2))
	var s = Math.sqrt( Math.pow(a_2*b_3 - b_2*a_3,2) + Math.pow(b_1*a_3 - a_1*b_3,2) + Math.pow(a_1*b_2 - b_1*a_2,2) )/2
	//console.log(s)
	return s
}


// VList : list of vertices
// FList : list of faces


function computeMesh(vList,fList) {

	console.log("Compute Mesh!")
	//console.log(global.vertices.length)
	//console.log(global.faces.length)
	//console.log(global)

	// here you start your code


	var vertexList = [];
	var tempFaceList = [];

	var faceList = [];
	var faceAreaList = [];
	var faceCenterList = [];
	var faceNormalList = [];
	var faceAdjacentList = [];
	var faceFoldAngleList = [];
	var faceFoldTypeList = [];
	var faceLinkList = [];
	var faceMinAngleList = [];

	var edgeList = [];
	var edgeFoldangleList = [];
	var edgeFoldTypeList = [];
	var edgeVectorList = [];
	var faceUnfoldList = [];

	//
	// Cull out duplicated vertices and update face list with new index of vertices
	//

	var temp = [];
	var tempVIndex = []
	var duplicatedFlag = 0;
	var tempVIndexMax = 0

	for (i = 0; i < vList.length / 3; i++) {
		temp.push(vList.slice(i * 3, i * 3 + 3))
	}
	// compute duplicate vertices and create vertex list
	for (i = 0; i < temp.length; i++) {

		if (i == 0) {
			vertexList.push(temp[i])
			tempVIndex.push(0)

		} else {
			// is it duplicated?
			for (j = 0; j < vertexList.length; j++) {
				var a = vertexList[j][0] - temp[i][0];
				var b = vertexList[j][1] - temp[i][1];
				var c = vertexList[j][2] - temp[i][2];

				if (a == 0 && b == 0 && c == 0) {
					duplicatedFlag = 1;
					break;
				}
			}
			if (duplicatedFlag == 0) {
				// Unique Vertex
				vertexList.push(temp[i]);
				tempVIndexMax += 1
				tempVIndex.push(tempVIndexMax)

			} else {
				// Dup Vertex
				duplicatedFlag = 0;
				tempVIndex.push(j)
			}
		}
	}

	for (i = 0; i < fList.length ; i++){
		temp = []

		// If face has three vertices
		if (fList[i].length == 3){
			for (j = 0; j < fList[i].length ; j++){
				temp.push(tempVIndex[fList[i][j] - 1]) // add new index of vertex in temp
			}
			faceList.push(temp)

			var tempAngleList = []
			for (var j = 0 ; j < 3; j++){

				var vectorA = addVector(vertexList[temp[(j+1)%3]],multiVector(vertexList[temp[j]],-1))
				vectorA = multiVector(vectorA,(1/sizeVector(vectorA)))
				var vectorB = addVector(vertexList[temp[(j+2)%3]],multiVector(vertexList[temp[j]],-1))
				vectorB = multiVector(vectorB,(1/sizeVector(vectorB)))
				tempAngleList.push(getAngle(vectorA,vectorB))
			}
			faceMinAngleList.push(Math.min(...tempAngleList) / Math.PI * 180)

		}
		// rectangle face = > divide into 2 triangles
		else{
			for (j = 0; j < 3 ; j++) {
				temp.push(tempVIndex[fList[i][j] - 1])

			}
			faceList.push(temp)
			temp = []
			for (j = 0; j < 3 ; j++) {
				temp.push(tempVIndex[fList[i][(j+2)%4] - 1])

			}
			faceList.push(temp)
		}
	}
	// Vertex list and face list without duplicated vertex

	//
	// Visit each faces and compute, edgeList faceCenterList, faceNormalList,
	//
	console.log(faceList)
	for (i = 0; i < faceList.length; i++) {

		// add edge
		for (j = 0; j<3;j++){

			tempEdgeList = [];
			tempEdgeList.push(faceList[i][j])
			tempEdgeList.push(faceList[i][(j+1)%3])

			edgeList.push(tempEdgeList.sort())
		}


		faceCenterList.push(faceCenter(vertexList[faceList[i][0]], vertexList[faceList[i][1]], vertexList[faceList[i][2]]));
		faceNormalList.push(faceNormal(vertexList[faceList[i][0]], vertexList[faceList[i][1]], vertexList[faceList[i][2]]));

		//computeArea()
		faceAreaList.push(faceArea(vertexList[faceList[i][0]], vertexList[faceList[i][1]], vertexList[faceList[i][2]]));


	}

	for (i = 0; i < faceList.length; i++) {
		var tempAJList = [];
		var tempFTList = [];
		var tempFAList = [];

		//Iterate through edges
		for (j = 0; j < faceList[i].length; j++) {

			//compute Edge List
			//compute Edge Centerpoints

			//Iteratethrough other faces
			for (k = 0; k < faceList.length; k++) {
				if (k != i) {
					// first edge
					if (faceList[k].includes(faceList[i][j]) && faceList[k].includes(faceList[i][(j + 1) % 3])) {
						//console.log("found")
						tempAJList.push(k)

						// Check folding condition

						var outer = getDistance(addVector(faceCenterList[i], faceNormalList[i]), addVector(faceCenterList[k], faceNormalList[k]));
						//console.log(outer)
						var inner = getDistance(addVector(faceCenterList[i], multiVector(faceNormalList[i], -1)), addVector(faceCenterList[k], multiVector(faceNormalList[k], -1)));
						//addVector(faceCenterList[i], multiVector(faceNormalList[i],-1))
						//console.log(inner);

						if (outer > inner) tempFTList.push("M");
						else if(outer == inner ) tempFTList.push("F");
						else tempFTList.push("V");

						//faceFoldAngleList.push()

						var angle = Math.PI - getAngle(faceNormalList[i], faceNormalList[k])
						tempFAList.push(angle);
						break;
					}

				}
			}
		}

		faceAdjacentList.push(tempAJList);
		faceFoldTypeList.push(tempFTList);
		faceFoldAngleList.push(tempFAList);
	}


	console.log('edgeList_Unique')
	//console.log(edgeList_Unique)

	edgeList = edgeList.sort(function(a,b){return a[1] - b[1];});
	edgeList = edgeList.sort(function(a,b){return a[0] - b[0];});
	var edgeList_Unique = []
	for (var i = 0 ; i < edgeList.length; i++){
		if(i%2 == 0)edgeList_Unique.push(edgeList[i])
	}

	global.vertexList = vertexList;
	global.faceList = faceList;
	//global.edgeList = edgeList;
	global.edgeList = edgeList_Unique;
	global.faceCenterList = faceCenterList;
	global.faceNormalList = faceNormalList;
	global.faceAdjacentList = faceAdjacentList;
	global.faceFoldTypeList = faceFoldTypeList;
	global.faceFoldAngleList = faceFoldAngleList;
	global.faceAreaList = faceAreaList;
	global.faceMinAngleList = faceMinAngleList;

	console.log(global)
	/*
    global.sequenceList = sequenceList;
    global.edgeVectorList = edgeVectorList;
    global.faceIterateSequenceList = faceIterateSequenceList;
    global.faceUnfoldVectorList = faceUnfoldVectorList;
    */





}