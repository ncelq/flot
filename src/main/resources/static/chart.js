
$(function() {
  graph.inject(); 
  uiHelper.start();
});



	

	var Graph = function() {
	  var graph;

	  return {
	    inject : function() {
	      graph = $.plot("#placeholder", {}, {
	  			series: {
	  				bars: {
	  					show: true,
	  					barWidth: 0.6,
	  					align: "center"
	  				}
	  			},
	  			xaxis: {
	  				mode: "categories",
	  				tickLength: 0
	  			}
	  		});

	      // Create y-axis label and inject it into the graph container
	      var yaxisLabel = $("<div class='axisLabel yaxisLabel'></div>").text(
	          "Requests sent from referrer over 10 seconds").appendTo("#graph");
	      // Center the y-axis along the left side of the graph
	      yaxisLabel.css("margin-top", yaxisLabel.width() / 2 - 20);
	    },
	    update : function(flotData) {
	        graph.setData(flotData);

	        // Calculate min and max value to update y-axis range.
	        var getValue = function(tuple) {
	          // Flot data values are stored as the second element of each data array
	          return tuple[1];
	        };
	        // Redraw the graph data and axes
	        graph.draw();
	        graph.setupGrid();
	      }
	  }
	}

	
	var UIHelper = function(data, graph) {
		  // How frequently should we poll for new data and update the graph?
		  var updateIntervalInMillis = 400;
		  // How often should the top N display be updated?
		  var intervalsPerTopNUpdate = 5;
		  // How far back should we fetch data at every interval?
		  var rangeOfDataToFetchEveryIntervalInSeconds = 2;
		  // What should N be for our Top N display?
		  var topNToCalculate = 3;
		  // Keep track of when we last updated the top N display.
		  var topNIntervalCounter = 1;
		  // Controls the update loop.
		  var running = true;
		  // Set the active resource to query for counts when updating data.
		  var activeResource = "/index.html";

		  /**
		   * Fetch counts from the last secondsAgo seconds.
		   *
		   * @param {string}
		   *          resource The resource to fetch counts for.
		   * @param {number}
		   *          secondsAgo The range in seconds since now to fetch counts for.
		   * @param {function}
		   *          callback The callback to invoke when data has been updated.
		   */
		  var updateData = function(resource, secondsAgo, callback) {
		    // Fetch data from our data provider
		    provider.getData(resource, secondsAgo, function(newData) {
		      // Store the data locally

		      data.addNewData(newData);

		      if (callback) {
		        callback();
		      }
			
		    });
		    
		  }


		  /**
		   * Update the graph with new data.
		   */
		  var update = function() {
		    // Update our local data for the active resource
		    updateData(activeResource, rangeOfDataToFetchEveryIntervalInSeconds);

		    graph.update(data.toFlotData());


		    // If we're still running schedule this method to be executed again at the
		    // next interval
		    if (running) {
		      setTimeout(arguments.callee, updateIntervalInMillis);
		    }
		  }


		  return {
		    start : function() {
		      var _this = this;
		      // Load an initial range of data, decorate the page, and start the update polling process.
		      updateData(activeResource, rangeOfDataToFetchEveryIntervalInSeconds,
		          function() {
		            // Start our polling update
		            running = true;
		            update();
		          });
		    },

		    /**
		     * Stop updating the graph.
		     */
		    stop : function() {
		      running = false;
		    }
		  }
		};


var CountDataProvider = function() {
	var _endpoint = "http://" + location.host + "/api";
	
	buildUrl = function(resource, range_in_seconds) {
		return _endpoint;
	};
	
	return {
		setEndpoint : function(endpoint) {
			_endpoint = endpoint;
		},
		getData : function(resource, range_in_seconds, callback) {
			$.ajax({
				url : buildUrl(resource, range_in_seconds),
				dataType: "json"
			}).done(callback);
		}
	}
}

		var CountData = function() {
			  var data = {};

			  return {
			    /**
			     * @returns {object} The internal representation of referrer data.
			     */
			    getData : function() {
			      return data;
			    },

			    /**
			     * Merges new count data in to our existing data set.
			     *
			     * @param {object} Count data returned by our data provider.
			     */
			    addNewData : function(newCountData) {
			      // Expected data format:
			      // [{
			      //   "resource" : "/index.html",
			      //   "timestamp" : 1397156430562,
			      //   "host" : "worker01-ec2",
			      //   "referrerCounts" : [{"referrer":"http://www.amazon.com","count":1002}]
			      // }]

			      newCountData.forEach(function(count) {

			        // Update the host who last calculated the counts

			          refData = data[count.size] || {
			              label : count.size,
			              data : {}
			            };
			            refData.data[count.size] = count.sum;
			            data[count.size] = refData;
			            //updateTotal(count.size);

			            //alert(JSON.stringify(data));
			          
			      }
			      );
			    },

			    /**
			     * Convert our internal data to a Flot data object.
			     *
			     * @returns {object[]} Array of data series for every referrer we know of.
			     */
			    toFlotData : function() {
			      flotData = [];
			      $.each(data, function(referrer, referrerData) {
			        flotData.push({
			          label : referrer,
			          // Flot expects time series data to be in the format:
			          // [[timestamp as number, value]]
			          data : $.map(referrerData.data, function(count, ts) {
			            return [ [ parseInt(ts), count ] ];
			          })
			        });
			      });
			      return flotData;
			    }
			  }
			}

		
var data = new CountData();
var provider = new CountDataProvider();
var graph = new Graph();
var uiHelper = new UIHelper(data, graph);

