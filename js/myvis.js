
/*
 * MyVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

class MyVis {


	constructor(_parentElement, _data, _geoData) {
		this.parentElement = _parentElement;
		this.data = _data;
		this.geoData = _geoData;

		// define colors
		this.colors = ['#ccc','#999','#666','#333']

		this.initVis();
	}


	/*
	 * Initialize visualization (static content, e.g. SVG area or axes)
	 */

	initVis() {
		let vis = this;


		vis.margin = {top: 0, right: 0, bottom: 0, left: 0};
		vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
		vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

		// init drawing area
		vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width)
			.attr("height", vis.height);
			//.attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

		// add title
		vis.svg.append('g')
			.attr('class', 'title map-title')
			.append('text')
			.text('Google trend by Country')
			.attr('transform', `translate(${vis.width / 2}, 20)`)
			.attr('text-anchor', 'middle');


		// graphic



		// map

		vis.projection = d3.geoMercator()  // d3.geoStereographic()  d3.geoOrthographic()
			.translate([vis.width / 2, vis.height / 2])
			.scale(150);


		vis.path = d3.geoPath()
			.projection(vis.projection);

		vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

		// sphere
		vis.svg.append("path")
		    .datum({type: "Sphere"})
		    .attr("class", "graticule")
		    .attr('fill', '#ADDEFF')
		    .attr("stroke","rgba(129,129,129,0.35)")
		    .attr("d", vis.path);



		vis.countries = vis.svg.selectAll(".country")
			.data(vis.world)
			.enter().append("path")
			.attr('class', 'country')
			.attr("d", vis.path)


		// Tooltip
		// append tooltip
		vis.tooltip = d3.select("body").append('div')
			.attr('class', "tooltip")
			.attr('id', 'pieTooltip');



		// Legend
		vis.legend = vis.svg.append("g")
			.attr('class', 'legend')
			.attr('transform', `translate(${(vis.width/2)-100}, ${vis.height - 10})`)

		vis.legend.selectAll()
			.data(vis.colors)
			.enter().append("rect")
			//.merge(vis.legend)
			.attr('class', 'legend')
			//.attr("d", vis.rect)
			.attr("fill", d => d)
			.attr("width", 50)
			.attr("height", 15)
			.attr("x", (d, i) => i * 50)
			.attr("y", 0);

		//vis.legend.exit().remove();

		vis.x  = d3.scaleLinear()
			//.domain([0, 14000])
			.range([0, 200])


		vis.xAxis = d3.axisTop()
			.scale(vis.x)
			.ticks(4);

		vis.legend.append("g")
			.attr("class", "x-axis axis")
			.call(vis.xAxis);


		// globe rotation

		let m0,
			o0;

		vis.svg.call(
			d3.drag()
				.on("start", function (event) {

					let lastRotationParams = vis.projection.rotate();
					m0 = [event.x, event.y];
					o0 = [-lastRotationParams[0], -lastRotationParams[1]];
				})
				.on("drag", function (event) {
					if (m0) {
						let m1 = [event.x, event.y],
							o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
						vis.projection.rotate([-o1[0], -o1[1]]);
					}

					// Update the map
					vis.path = d3.geoPath().projection(vis.projection);
					d3.selectAll(".country").attr("d", vis.path)
					d3.selectAll(".graticule").attr("d", vis.path)
				})
		)

		vis.wrangleData()

	}

	wrangleData(){
		let vis = this;
		vis.initData = vis.data;
		//console.log(vis.initData)
		vis.displayData = []; // includes the relative score of population/Google Trend score
		vis.displayDataDictionary = {}; // includes the relative score of population/Google Trend score
		vis.finalCountryInfo = {}; // create data structure with information for each country


		// create final data Object and populate it with geoCountries
		vis.finalDataObject = {}; // create data structure with information for each country
		vis.geoData.objects.countries.geometries.forEach( (d, i) => {
			vis.finalDataObject[d.properties.name] = {
				countryName: d.properties.name,
			}})


		// calculate the relationship of population to the Google trend score
		// add new column to the dataset
		// merge data

		let relativeScore = 0;
		let population = "n/a";
		let googleScore;
		let initColor = '#333';


		vis.initData.forEach( (row, i) => {

			// if GTscore is available, calculate new relative score
			let score = row["GT_Score"];
			if(score !== "n/a" && score !== 0 && row["Population_Average"] !== "n/a"){
				relativeScore = row["Population_Average"]*score;
			}else{
				relativeScore = "n/a";
			}

			// check if the name matches json geo data
			// populate the final data structure into array
			for (var j=0; j < vis.world.length; j++) {
				let countryNameJson = vis.world[j].properties.name;
				let countryNameUnitedNations = vis.data[i]["Country_Area"];

				if (countryNameUnitedNations === countryNameJson) {
					googleScore = vis.data[i]["GT_Score"]
					population = vis.data[i]["Population_Average"]
					vis.displayData.push(
						{
							relativeScore: relativeScore,
							countryName: countryNameJson,
							populationAverage: population,
							googleScore: googleScore,
							color: initColor,
						});
				}
				// populate the dictionary with additional info
				// vis.finalDataObject[countryNameJson] = {
				// 	relativeScore: relativeScore,
				// 	country: countryNameJson,
				// 	color: initColor,
				// }

			}


			// convert the final data structure into a dictionary
			vis.displayData.forEach(function (d){
				vis.displayDataDictionary[d.countryName] = d;
			})

		});



		// create final data structure for each state
		// group data by country

		vis.displayDataByCountry = Array.from(d3.group(vis.displayData, d =>d.countryName), ([key, value]) => ({key, value}))
		// console.log(vis.displayDataByCountry);
		// console.log(vis.displayData)
		// console.log(vis.displayDataDictionary)







		// color the countries with Origami trend
		// loop through the countries
		// if there is a Google trend score
		// assign color


		// loop through the list of json countries
		// if the json country doesn't have an associated UN country with the info
		// add n/a or 0 for missing values

		// console.log(vis.displayDataByCountry.length);  // 178
		// console.log(vis.geoData.objects.countries.geometries.length) //241  - 63 more countries
		vis.geoData.objects.countries.geometries.forEach( (d, i) => {
			let countryExists;
			for (var j=0; j < vis.displayDataByCountry.length; j++) {
				// console.log(vis.displayDataByCountry[j].key)
				// console.log(d.properties.name = vis.displayDataByCountry[j].key)
				// console.log(d.properties.name == vis.displayDataByCountry[j].key)
				// console.log(d.properties.name === vis.displayDataByCountry[j].key)
				if(d.properties.name == vis.displayDataByCountry[j].key){
					countryExists = true;
					// console.log(countryExists); // returns 178
					// console.log(d.properties.name === vis.displayDataByCountry[j].key) // returns 178 true
					// console.log('country name is ', d.properties.name = vis.displayDataByCountry[j].key)
				}else{
					countryExists = false;
					// console.log(countryExists); // returns 178
					// console.log('This country name not found in Json: ', vis.displayDataByCountry[j].key)
				}
			}


			if(countryExists = true  && vis.displayDataDictionary[d.properties.name] !== undefined){

				// function findUnderfined(){
				// 	if (vis.displayDataDictionary[d.properties.name] === undefined){
				// 		console.log(d.properties.name);
				// 	}
				// }
				// findUnderfined(); // returns Vatican
				vis.finalCountryInfo[d.properties.name] = {
					countryName: d.properties.name,
					relativeScore: vis.displayDataDictionary[d.properties.name].relativeScore,
					//googleScore: vis.displayDataDictionary[d.properties.name].googleScore,
				}
			}
			else{
				vis.finalCountryInfo[d.properties.name] = {
					countryName: d.properties.name,
					relativeScore: "n/a",
					//googleScore: vis.displayDataDictionary[d.properties.name].googleScore,
				}
			}


		})
		console.log(vis.finalCountryInfo)
		// console.log(vis.finalCountryInfo.length)

		vis.updateVis()
	}



	updateVis(){
		let vis = this;


		// update scales
		vis.x.domain([
			0, d3.max(vis.world, d => vis.finalCountryInfo[d.properties.name]['relativeScore']) // returns 0, 826784
		]);
		vis.x.range(['#fff', '#333']);




		// add color and tooltip to the map
		vis.countries
			.attr("fill", function (d){
				if (vis.finalCountryInfo[d.properties.name]['relativeScore'] === "n/a"){
					return "#fff";
				}else{
					return vis.x(vis.finalCountryInfo[d.properties.name]['relativeScore'])
				}

			})
			.on('mouseover', function(event, d){
				d3.select(this)
					.attr('stroke-width', '2px')
					.attr('stroke', 'black')

				function roundRelativeScore(d) {
					if(vis.displayDataDictionary[d.properties.name]['relativeScore'] !== "n/a"){
						let formatDecimalComma = d3.format(",.0f")
						//return vis.displayDataDictionary[d.properties.name]['relativeScore'].toFixed()
						return formatDecimalComma(vis.displayDataDictionary[d.properties.name]['relativeScore']);
					}else{
						return vis.displayDataDictionary[d.properties.name]['relativeScore']}
				}

				vis.tooltip
					.style("opacity", 1)
					.style("left", event.pageX + 20 + "px")
					.style("top", event.pageY + "px")
					.html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                         <h3>${vis.finalCountryInfo[d.properties.name]['countryName']}<h3>
                         <h4>Relative Score:${roundRelativeScore(d)}</h4>
                     </div>`);
			})
			.on('mouseout', function(event, d){
				d3.select(this)
					.attr('stroke-width', '0px')

				vis.tooltip
					.style("opacity", 0)
					.style("left", 0)
					.style("top", 0)
					.html(``);
			});
	}
}