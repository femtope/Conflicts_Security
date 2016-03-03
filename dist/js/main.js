var scope = '',
    sectors = [],
    geoData = null,
    dataLayer = null,
    markerGroup = null,
    stateData = null,
    stateLayer, lgaLayer,
    lgaLabels = [],
    //wardLabels = [],
    showLga = false
    //showWard = false

var map = L.map('map', {
    center: [10, 8],
    zoom: 8,
    zoomControl: false,
    minZoom: 6
        /*,
        crs: L.CRS.EPSG4326*/
        //layers:[stateLayer]
});


map.fitBounds([
    [2.668432, 4.277144], [14.680073, 13.892007]
])

map.on('zoomend', function () {
    adjustLayerbyZoom(map.getZoom())
})


// Function Testing
var lowerlimit, upperlimit;
$(function() {
$( "#slider-range" ).slider({
range: true,
min: 1997,
max: 2015,
values: [ 1997, 2015 ],
slide: function( event, ui ) {

$( "#amount" ).val(ui.values[ 0 ] + "  -  " + ui.values[ 1 ] );
}
});
$( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) +
"  -  " + $( "#slider-range" ).slider( "values", 1 ) );
});

var a, b, c, yr, yrs, month, year, conType;

function myYear(yr)
{
    yr = document.getElementById("amount").value;
    yrs = yr.split('  -  ');
    year = "Year is Between "+yrs[0]+" AND "+yrs[1];
    console.log(year);
    return;
}


function myMonth()
{
    a = document.getElementById("monthScope");
    month = a.options[a.selectedIndex].text;
    console.log(month);
}


function myConflict()
{
    b = document.getElementById("categoryScope");
    conType = b.options[b.selectedIndex].text;
    console.log(conType);
    return;
}

function myExecute()
{
    myYear();
    console.log(month+"===="+conType+"======"+year);
   // console.log(conType);

}

//End function Testing


L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

new L.Control.Zoom({
    position: 'topright'
}).addTo(map);

L.control.scale({
    position: 'bottomright',
    maxWidth: 150,
    metric: true,
    updateWhenIdle: true
}).addTo(map);

function adjustLayerbyZoom(zoomLevel) {

    if (zoomLevel > 8) {
        if (!showLga) {
            map.addLayer(lgaLayer)
                //Add labels to the LGAs
            for (var i = 0; i < lgaLabels.length; i++) {
                lgaLabels[i].addTo(map)
            }
            showLga = true
        }
    } else {
        map.removeLayer(lgaLayer)
        for (var i = 0; i < lgaLabels.length; i++) {
            map.removeLayer(lgaLabels[i])
        }

        showLga = false
    }
/*
  // Show ward level
  if (zoomLevel > 9) {
        if (!showWard) {
            map.addLayer(wardLayer)
                //Add labels to the LGAs
            for (var i = 0; i < wardLabels.length; i++) {
                wardLabels[i].addTo(map)
            }
            showWard = true
        }
    } else {
        map.removeLayer(wardLayer)
        for (var i = 0; i < wardLabels.length; i++) {
            map.removeLayer(wardLabels[i])
        }

        showWard = false
    }*/

}

function triggerUiUpdate() {
    scope = $('#projectScope').val()
    var query = buildQuery(scope, sectors)
    getData(query)
}

function buildSelectedSectors(sector) {
    var idx = sectors.indexOf(sector)
    if (idx > -1)
        sectors.splice(idx, 1)
    else if (idx == -1) {
        if (sector != null)
            sectors.push(sector)
    }
    toggleClass(sector)
    triggerUiUpdate()
}

function toggleClass(id) {
    /*console.log("Selected", id)*/
    if (id != null) {
        if ($('#'.concat(id)).hasClass('btn-primary')) {
            $('#'.concat(id)).removeClass('btn-primary')
            $('#'.concat(id)).addClass('btn-'.concat(id))
        } else if ($('#'.concat(id)).hasClass('btn-'.concat(id))) {
            $('#'.concat(id)).removeClass('btn-'.concat(id))
            $('#'.concat(id)).addClass('btn-primary')
        }
    }
}

function buildQuery(_scope, _sectors) {
    //returns geojson
    var containsAnd = false;
    query = 'http://ehealthafrica.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM conflict_and_security_data';
    query = (_scope.length > 0 || _sectors.length > 0) ? query.concat(' WHERE') : query;
    if (_scope.length > 0) {
        query = (_sectors.length > 0) ? query.concat(" scope_of_work = '".concat(scope.concat("' AND"))) : query.concat(" scope_of_work = '".concat(scope.concat("'")))
    }
    if (_sectors.length > 0) {
        for (var i = 0; i < _sectors.length; i++) {
            if (i == 0)
                query = query.concat(" sector='" + _sectors[i] + "'");
            else query = query.concat(" OR sector='" + _sectors[i] + "'")
        }
    }
    //console.log("Query ", query)
    return query;
}


//TODO: fix the issue of lga layer not reoving after data filtering
function addDataToMap(geoData) {
    // adjustLayerbyZoom(map.getZoom())
    //remove all layers first

    if (dataLayer != null)
        map.removeLayer(dataLayer)

    if (markerGroup != null)
        map.removeLayer(markerGroup)


    var _radius = 10
    var _outColor = "#fff"
    var _weight = 1
    var _opacity = 1
    var _fillOpacity = 0.5

    var allColours = {
        'Assassination/Homicide/Armed Robbery': {
            radius: _radius,
            fillColor: "#ffff00",
            color: _outColor,
            weight: _weight,
            opacity: _opacity,
            fillOpacity: _fillOpacity
        },
        'Civil Conflicts': {
            radius: _radius,
            fillColor: "#008000",
            color: _outColor,
            weight: _weight,
            opacity: _opacity,
            fillOpacity: _fillOpacity
        },
        'Kidnapping/Abduction': {
            radius: _radius,
            fillColor: "#00ffff",
            color: _outColor,
            weight: _weight,
            opacity: _opacity,
            fillOpacity: _fillOpacity
        },
        'Insurgency/Terrorists Attacks': {
            radius: _radius,
            fillColor: "#ffff66",
            color: _outColor,
            weight: _weight,
            opacity: _opacity,
            fillOpacity: _fillOpacity
        },
        'Religious Conflicts': {
            radius: _radius,
            fillColor: "#800080",
            color: _outColor,
            weight: _weight,
            opacity: _opacity,
            fillOpacity: _fillOpacity
        },
        'Protests/Demonstrations': {
            radius: _radius,
            fillColor: "#a52a2a",
            color: _outColor,
            weight: _weight,
            opacity: _opacity,
            fillOpacity: _fillOpacity
        },
        'Others': {
            radius: _radius,
            fillColor: "#ff00ff",
            color: _outColor,
            weight: _weight,
            opacity: _opacity,
            fillOpacity: _fillOpacity
        }
    }


    $('#projectCount').text(geoData.features.length)

    markerGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: true
        })
        //console.log("geoData", geoData)
    dataLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
            var marker = L.circleMarker(latlng, allColours[feature.properties.sector])
                //markerGroup.addLayer(marker);
            return marker
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.cartodb_id) {
                //layer.bindPopup(buildPopupContent(feature));
                layer.on('click', function () {
                    displayInfo(feature)
                })
            }

        }

    })

    markerGroup.addLayer(dataLayer);
    map.addLayer(markerGroup);

}


function addAdminLayersToMap(layers) {
    var layerStyles = {
            'state': {
                "clickable": true,
                "color": '#B81609',
                "fillColor": '#FFFFFF',
                "weight": 1.5,
                "opacity": 0.2,
                "fillOpacity": 0.1
            },
            'lga': {
                "clickable": true,
                "color": '#A52A2A',
                "fillColor": '#FFFFFF',
                "weight": 1.5,
                "opacity": 0.4,
                "fillOpacity": 0.1
            }
      //,

            /*'ward': {
                "clickable": true,
                "color": '#0000FF',
                "fillColor": '#FFFFFF',
                "weight": 1.5,
                "opacity": 0.4,
                "fillOpacity": 0.1
            }*/
        }

    stateLayer = L.geoJson(layers['state'], {
        style: layerStyles['state']
    }).addTo(map)
    lgaLayer = L.geoJson(layers['lga'], {
        style: layerStyles['lga'],
        onEachFeature: function (feature, layer) {
            var labelIcon = L.divIcon({
                className: 'labelLga-icon',
                html: feature.properties.LGAName
            })
            lgaLabels.push(L.marker(layer.getBounds().getCenter(), {
                    icon: labelIcon
                }))

        }
    })

/*        wardLayer = L.geoJson(layers['ward'], {
        style: layerStyles['ward'],
        onEachFeature: function (feature, layer) {
            var labelIcon = L.divIcon({
                className: 'labelWard-icon',
                html: feature.properties.WardName
            })
            wardLabels.push(L.marker(layer.getBounds().getCenter(), {
                    icon: labelIcon
                }))

        }
    })*/
}


function displayInfo(feature) {
    //console.log('displaying info..')
    var infoContent = buildPopupContent(feature)
        //console.log("info", infoContent)
    $('#infoContent').html(infoContent)
}

function normalizeName(source) {
    source = source.replace("_", " ").replace('of_', ' of ')
    source = source.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return source
}

function buildPopupContent(feature) {
    var subcontent = ''
    var propertyNames = ['event_type', 'event_year', 'event_month', 'event_date', 'state', 'lga', 'location', 'source', 'perpetrator', 'notes', 'fatalities', 'conflict_scenario']
    for (var i = 0; i < propertyNames.length; i++) {
        subcontent = subcontent.concat('<p><strong>' + normalizeName(propertyNames[i]) + ': </strong>' + feature.properties[propertyNames[i]] + '</p>')

    }
    return subcontent;
}

function showLoader() {
    $('.fa-spinner').addClass('fa-spin')
    $('.fa-spinner').show()
}

function hideLoader() {
    $('.fa-spinner').removeClass('fa-spin')
    $('.fa-spinner').hide()
}


function getData(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addDataToMap(data)
    }).fail(function () {
        console.log("error!")
    });
}

function getAdminLayers() {
    showLoader()
    var adminLayers = {}
    $.get('resources/state_boundary.geojson', function (stateData) {
        //add admin layers to map
        adminLayers['state'] = JSON.parse(stateData)
        $.get('resources/lga_boundary.geojson', function (lgaData) {
            adminLayers['lga'] = JSON.parse(lgaData)
                //return the layers
            addAdminLayersToMap(adminLayers)
        }).fail(function () {
            logError(null)
        })

       /* $.get('resources/wards.geojson', function (wardData){
              adminLayers['ward'] = JSON.parse(wardData)
                //return the layers
              addAdminLayersToMap(adminLayers)
        }).fail(function () {
            logError(null)
        })
*/
    }).fail(function () {
        logError(null) //TODO: Fix this terrible code
    })
}

function logError(error) {
    console.log("error!")
}

getAdminLayers()
triggerUiUpdate()
