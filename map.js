$(document).ready(function() {

    var currentScore = [];
    var subButton = document.getElementById('submitingGuess')
    var nextButton = document.getElementById('nextGuess')
    var guessedLocation = null;
    var haveIGuessed = false

    function getRndmLaLn(min, max) {
        return Math.random() * (max - min) + min;
    }

    var randomizedStreetveiw = {
        lat: getRndmLaLn(30.000000, 30.527629),
        lng: getRndmLaLn(-98.074265, -97.417831)
    };

    function randomizeIt() {
        var randomizedStreetveiw = {
            lat: getRndmLaLn(30.000000, 30.527629),
            lng: getRndmLaLn(-98.074265, -97.417831)
        };
        return randomizedStreetveiw;
    }

    var mapViewOfAustin = {
        lat: 30.271781,
        lng: -97.732315
    };
    //

    var map = new google.maps.Map(document.getElementById('map'), {
        center: mapViewOfAustin,
        zoom: 9
    });

    function createNewPano() {
        var projectionResolved = new Promise(function(res, rej) {
            var panorama = {}
            reRun(panorama, function(result) {
                // console.log('resolve!');
                res(result);
            });
        })

        function reRun(pano, cb, previousTimer) {
            setTimeout(function() {
                if (!!pano.projection) {
                    // console.log('PROJECTION EXISTS');
                    cb(panorama)
                } else {
                    var panorama = fetchNewPanorama()
                    // console.log('wtf');
                    reRun(panorama, cb)
                }
            }, 500)
        }

        function fetchNewPanorama() {
            return new google.maps.StreetViewPanorama(
                document.getElementById('pano'), {
                    position: randomizeIt(),
                    addressControl: false,
                    pov: {
                        heading: 34,
                        pitch: 10
                    }
                });
        }

        projectionResolved.then(function(info) {
            console.log('INFO', info.projection);
        })
    }

    createNewPano()

    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
    }

    clickingStuff()


    // clicking on the map on the left will place a marker and show where the street view is located
    function clickingStuff (){
        // if (!haveIGuessed) {
            google.maps.event.addListener(map, 'click', function firstGuess(ev) {
                guessedLocation = ev.latLng
                placeMarker(ev.latLng);
                return guessedLocation
            });

            subButton.addEventListener('click', function(event) {
                placeMarker(randomizedStreetveiw);
                // console.log(ev);
                // console.log(randomizedStreetveiw);

                // making the line on the map
                var lineOfDifferece = new google.maps.Polyline({
                    path: [guessedLocation, randomizedStreetveiw],
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: .7,
                    strokeWeight: 2
                });

                // calculating distance of line
                lineOfDifferece.setMap(map);
                google.maps.LatLng.prototype.kmTo = function(a) {
                    var e = Math,
                        ra = e.PI / 180;
                    var b = this.lat() * ra,
                        c = a.lat() * ra,
                        d = b - c;
                    var g = this.lng() * ra - a.lng() * ra;
                    var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d / 2), 2) + e.cos(b) * e.cos(c) * e.pow(e.sin(g / 2), 2)));
                    return f * 6378.137;
                }

                google.maps.Polyline.prototype.inKm = function(n) {
                    var a = this.getPath(n),
                        len = a.getLength(),
                        dist = 0;
                    for (var i = 0; i < len - 1; i++) {
                        dist += a.getAt(i).kmTo(a.getAt(i + 1));
                    }
                    return dist;
                }

                var disstanceOfLine = lineOfDifferece.inKm();
                currentScore.push(disstanceOfLine)
                console.log(disstanceOfLine);
                console.log(currentScore);
                // document.getElementById('scoreBox').innerHTML = Math.floor(disstanceOfLine) + ' Kilometers Away From Location!'
                window.alert(Math.floor(disstanceOfLine) + ' Kilometers Away From Location!');
                var totalScore = null;
                for (var i = 0; i < currentScore.length; i++) {
                    totalScore += currentScore[i]
                }
                console.log(totalScore);
                // $('#scoreBox')append.val(totalScore)
            })

    }

    nextButton.addEventListener('click', function(event) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: mapViewOfAustin,
            zoom: 9
        });
        createNewPano()
        clickingStuff()


    });



})


// api_key=mapzen-odes-cMfGEs
// https://roads.googleapis.com/v1/snapToRoads?parameters&key=AIzaSyCDpbG5bX-9FXlzU3GLJqVFrcx5Le9cy40
