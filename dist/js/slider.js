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
