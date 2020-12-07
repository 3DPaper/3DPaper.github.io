

async function readFile() {

    async function readInputFile() {
        readVList = []
        readFList = []

        return new Promise((resolve, reject) => {
            var file = document.getElementById('file').files[0]

            var reader = new FileReader();
            reader.onload = function (progressEvent) {
                // Entire file

                // By lines
                var lines = this.result.split('\n');
                for (var line = 0; line < lines.length; line++) {
                    //console.log(lines[line]);

                    lineFirstChar = lines[line].charAt(0);

                    if (lineFirstChar === 'v') {

                        var data = lines[line].split(/\s+/);

                        switch (data[0]) {

                            case 'v':
                                global.vertices.push(
                                    parseFloat(data[1]),
                                    parseFloat(data[2]),
                                    parseFloat(data[3])
                                );
                                if (data.length >= 7) {

                                    global.colors.push(
                                        parseFloat(data[4]),
                                        parseFloat(data[5]),
                                        parseFloat(data[6])
                                    );

                                } else {

                                    // if no colors are defined, add placeholders so color and vertex indices match
                                    global.colors.push(undefined, undefined, undefined);

                                }

                                break;
                            case 'vn':
                                global.normals.push(
                                    parseFloat(data[1]),
                                    parseFloat(data[2]),
                                    parseFloat(data[3])
                                );
                                break;
                            case 'vt':
                                global.uvs.push(
                                    parseFloat(data[1]),
                                    parseFloat(data[2])
                                );
                                break;

                        }


                    }
                    else if (lineFirstChar === 'f') {

                        // you are in single line now.
                        var lineData = lines[line].substr(1).trim();
                        var vertexData = lineData.split(/\s+/);
                        var faceVertices = [];

                        // Parse the face vertex data into an easy to work with format

                        for (var j = 0, jl = vertexData.length; j < jl; j++) {

                            var vertex = vertexData[j];
                            if (vertex.length > 0) {

                                var vertexParts = vertex.split('/');
                                faceVertices.push(parseInt(vertexParts[0]));

                            }
                        }
                        global.faces.push(faceVertices)
                    }
                }
            }
            reader.readAsText(file);

            reader.onloadend = function() {
                resolve(1);
                computeMesh(global.vertices,global.faces)
                initThreeView()
                areachart = new AreaChart("chartVis", global.faceAreaList);
            };
        });
    }

    await readInputFile()

}


