var TimeKnots = {
  draw: function(id, events, options){
    var cfg = {
      width: 600,
      height: 200,
      radius: 10,
      lineWidth: 4,
      color: "#999",
      background: "#FFF",
      dateFormat: "%Y/%m/%d %H:%M:%S",
      horizontalLayout: true,
      showLabels: false,
      labelFormat: "%Y/%m/%d %H:%M:%S",
      addNow: false,
      seriesColor: d3.scale.category20(),
      dateDimension: true,
      tooltipDirectionY: -1,
    };


    //default configuration overrid
    if(options != undefined){
      for(var i in options){
        cfg[i] = options[i];
      }
    }
    if(cfg.addNow != false){
      events.push({date: new Date(), name: cfg.addNowLabel || "Today"});
    }
    var tip = d3.select(id)
    .append('div')
    .attr('class', 'tooltip')
    .style("opacity", 0)
    .style("position", "absolute");

    // We want to position the tooltip differently depending on if the event is
    // near the left or right side of the timeline. The author of this library
    // made the tooltip positioning code independent of the code that
    // constructs the tooltip and is therefore aware of what event is the
    // current event. So, we keep that state in in this variable so that the
    // positioning code knows what's up.
    let curEventIndex;
    const numEvents = events.length;
    const tooltipMaxWidth = 500;

    var svg = d3.select(id).append('svg').attr("width", cfg.width).attr("height", cfg.height);
    //Calculate times in terms of timestamps
    if(!cfg.dateDimension){
      var timestamps = events.map(function(d){return  d.value});//new Date(d.date).getTime()});
      var maxValue = d3.max(timestamps);
      var minValue = d3.min(timestamps);
    }else{
      var timestamps = events.map(function(d){return  Date.parse(d.date);});//new Date(d.date).getTime()});
      var maxValue = d3.max(timestamps);
      var minValue = d3.min(timestamps);
    }
    var margin = (d3.max(events.map(function(d){return d.radius})) || cfg.radius)*1.5+cfg.lineWidth;
    var step = (cfg.horizontalLayout)?((cfg.width-2*margin)/(maxValue - minValue)):((cfg.height-2*margin)/(maxValue - minValue));
    var series = [];
    if(maxValue == minValue){step = 0;if(cfg.horizontalLayout){margin=cfg.width/2}else{margin=cfg.height/2}}

    linePrevious = {
      x1 : null,
      x2 : null,
      y1 : null,
      y2 : null
    }

    svg.selectAll("line")
    .data(events).enter().append("line")
    .attr("class", "timeline-line")
      .attr("x1", function(d){
                      var ret;
                      if(cfg.horizontalLayout){
                        var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                        ret = Math.floor(step*(datum - minValue) + margin)
                      }
                      else{
                        ret = Math.floor(cfg.width/2)
                      }
                      linePrevious.x1 = ret
                      return ret
                      })
    .attr("x2", function(d){
                      if (linePrevious.x1 != null){
                          return linePrevious.x1
                      }
                      if(cfg.horizontalLayout){
                        var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                        ret = Math.floor(step*(datum - minValue ))
                      }
                      return Math.floor(cfg.width/2)
                      })
    .attr("y1", function(d){
                      var ret;
                      if(cfg.horizontalLayout){
                        ret = Math.floor(cfg.height/2)
                      }
                      else{
                        var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                        ret = Math.floor(step*(datum - minValue)) + margin
                      }
                      linePrevious.y1 = ret
                      return ret
                      })
    .attr("y2", function(d){
                      if (linePrevious.y1 != null){
                        return linePrevious.y1
                      }
                      if(cfg.horizontalLayout){
                        return Math.floor(cfg.height/2)
                      }
                      var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                      return Math.floor(step*(datum - minValue))
                      })
    .style("stroke", function(d){
                      if(d.color != undefined){
                        return d.color
                      }
                      if(d.series != undefined){
                        if(series.indexOf(d.series) < 0){
                          series.push(d.series);
                        }
                        return cfg.seriesColor(series.indexOf(d.series));
                      }
                      return cfg.color})
    .style("stroke-width", cfg.lineWidth);

    svg.selectAll("circle")
    .data(events).enter()
    .append("circle")
    .attr("class", "timeline-event")
    .attr("r", function(d){if(d.radius != undefined){return d.radius} return cfg.radius})
    .style("stroke", function(d){
                    if(d.color != undefined){
                      return d.color
                    }
                    if(d.series != undefined){
                      if(series.indexOf(d.series) < 0){
                        series.push(d.series);
                      }
                      console.log(d.series, series, series.indexOf(d.series));
                      return cfg.seriesColor(series.indexOf(d.series));
                    }
                    return cfg.color}
    )
    .style("stroke-width", function(d){if(d.lineWidth != undefined){return d.lineWidth} return cfg.lineWidth})
    .style("fill", function(d){if(d.background != undefined){return d.background} return cfg.background})
    .attr("cy", function(d){
        if(cfg.horizontalLayout){
          return Math.floor(cfg.height/2)
        }
        var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
        return Math.floor(step*(datum - minValue) + margin)
    })
    .attr("cx", function(d){
        if(cfg.horizontalLayout){
          var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
          var x=  Math.floor(step*(datum - minValue) + margin);
          return x;
        }
        return Math.floor(cfg.width/2)
    }).on("mouseover", function(d, i){
      curEventIndex = i;

      if(cfg.dateDimension){
        // Allow user to specify a string representing the date.
        var datetime;
        if (d.dateStr) {
          datetime = d.dateStr;
        } else {
          var format = d3.time.format(cfg.dateFormat);
          datetime = format(new Date(d.date));
        }

        var dateValue = (datetime != "")?(d.name +" <small>("+datetime+")</small>"):d.name;
      }else{
        var format = function(d){return d}; // TODO
        var datetime = d.value;
        var dateValue = d.name +" <small>("+d.value+")</small>";
      }
      d3.select(this)
      .style("fill", function(d){if(d.color != undefined){return d.color} return cfg.color}).transition()
      .duration(100).attr("r",  function(d){if(d.radius != undefined){return Math.floor(d.radius*1.5)} return Math.floor(cfg.radius*1.5)});
      tip.html("");
      if(d.img != undefined){
        tip.append("img").attr("src", d.img).attr('class', 'tooltip-img');
      }
      tip.append("div")
        .html(dateValue)
        .style("font-weight", "bold")
        .style("margin-bottom", "3px");

      // Append long text description.
      if (d.description) {
        tip.append("div")
          .style("font-size", "14px")
          .style("white-space", "pre-wrap") // render line breaks
          .style("max-width", "500px")
          .html(d.description);
      }

      tip.transition()
      .duration(100)
      .style("opacity", .9);

    })
    .on("mouseout", function(){
        d3.select(this)
        .style("fill", function(d){if(d.background != undefined){return d.background} return cfg.background}).transition()
        .duration(100).attr("r", function(d){if(d.radius != undefined){return d.radius} return cfg.radius});
        tip.transition()
        .duration(100)
    .style("opacity", 0)});

    //Adding start and end labels
    if(cfg.showLabels != false){
      if(cfg.dateDimension){
        var format = d3.time.format(cfg.labelFormat);
        var startString = format(new Date(minValue));
        var endString = format(new Date(maxValue));
      }else{
        var format = function(d){return d}; //Should I do something else?
        var startString = minValue;
        var endString = maxValue;
      }
      svg.append("text")
         .text(startString).style("font-size", "70%")
         .attr("x", function(d){if(cfg.horizontalLayout){return d3.max([0, (margin-this.getBBox().width/2)])} return Math.floor(this.getBBox().width/2)})
         .attr("y", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2+(margin+this.getBBox().height))}return margin+this.getBBox().height/2});

      svg.append("text")
         .text(endString).style("font-size", "70%")
         .attr("x", function(d){if(cfg.horizontalLayout){return  cfg.width -  d3.max([this.getBBox().width, (margin+this.getBBox().width/2)])} return Math.floor(this.getBBox().width/2)})
         .attr("y", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2+(margin+this.getBBox().height))}return cfg.height-margin+this.getBBox().height/2})
    }


    svg
      .on("mousemove", function(){
        tipPixels = parseInt(tip.style("height").replace("px", ""));
        let top;
        if (cfg.tooltipDirectionY > 0) {
          top = d3.event.pageY + 30;
        } else {
          top = d3.event.pageY - tipPixels - margin;
        }
        let percentageEventsInPast = curEventIndex * 1.0 / numEvents;
        let horizontalOffset;
        if (percentageEventsInPast < 0.3) {
          horizontalOffset = 20;
        } else if (percentageEventsInPast < 0.5) {
          horizontalOffset = -80;
        } else if (percentageEventsInPast < 0.7) {
          horizontalOffset = -100;
        } else if (percentageEventsInPast < 0.8) {
          horizontalOffset = -150;
        } else {
          horizontalOffset = -450;
        }
        const left = d3.event.pageX + horizontalOffset;
        return tip.style("top", top + "px").style("left", left + "px");
      })
      .on("mouseout", function() {
        return tip.style("opacity", 0).style("top","0px").style("left","0px");
      });
  }
}

