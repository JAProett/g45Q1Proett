$(document).ready(function() {

// ***Defining all variables for the Global Scope***
////////////////////////////////////////////////////////////////////////////////
    var currentScore = [];
    var subButton = document.getElementById('submitingGuess')
    var nextButton = document.getElementById('nextGuess')
    var newGameButton = document.getElementById('newGame')
    var guessDistFromCurButton = document.getElementById('disFromLoc')
    var textGuess = document.getElementById('howFar')
    var guessedLocation = null;
    var map
    var pos

// ***Start Button that sets the map***
////////////////////////////////////////////////////////////////////////////////
    newGameButton.addEventListener('click', function(event) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: mapViewOfAustin,
            zoom: 9
        });
        createNewPano()
        clickingStuff()
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            return pos
        })
        distanceFromYouLc()
    })

// ***Randomized Locations and set map veiw***
////////////////////////////////////////////////////////////////////////////////


    function getRndmLaLn(min, max) {
        return Math.random() * (max - min) + min;
    }

    var mapViewOfAustin = {
        lat: 30.271781,
        lng: -97.732315
    };
    var randomizedStreetveiw = {
        lat: getRndmLaLn(30.000000, 30.527629),
        lng: getRndmLaLn(-98.074265, -97.417831)
    };

    function randomizeIt() {
        randomizedStreetveiw = {
            lat: getRndmLaLn(30.000000, 30.527629),
            lng: getRndmLaLn(-98.074265, -97.417831)
        };
        return randomizedStreetveiw;
    }


// ***create place Marker***
////////////////////////////////////////////////////////////////////////////////
    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
    }

// ***function that gets the distance in km from Lat Lon cords***
////////////////////////////////////////////////////////////////////////////////
    function calculatingDistance(userInput, theTargetInput, colorOfLine) {
        var lineOfDifferece = new google.maps.Polyline({
            path: [userInput, theTargetInput],
            geodesic: true,
            strokeColor: colorOfLine,
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

        return lineOfDifferece.inKm()*.621371192;
    }

// ***makes new street pano cycles through untill find random point with pano***
////////////////////////////////////////////////////////////////////////////////
    function createNewPano(toRunLater, runYouLocAfter) {
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
            }, 200)
        }

        function fetchNewPanorama() {
            return new google.maps.StreetViewPanorama(
                document.getElementById('pano'), {
                    position: randomizeIt(),
                    addressControl: false,
                    linksControl: false,
                    pov: {
                        heading: 34,
                        pitch: 10
                    }
                });
        }

        projectionResolved.then(function(info) {
            toRunLater()
            runYouLocAfter()
            console.log('INFO', info.projection);
        })
    }

// ***assigns the clicked point on the map a lat lon***
////////////////////////////////////////////////////////////////////////////////
    // clicking on the map on the left will place a marker and show where the street view is located
    function clickingStuff() {
        google.maps.event.addListener(map, 'click', function firstGuess(ev) {
            guessedLocation = ev.latLng
            placeMarker(ev.latLng);

            return guessedLocation
        });

        subButton.removeEventListener('click', doStuff)
        subButton.addEventListener('click', doStuff)

    }

// ***submits guess and evaluates distance from guess to location of the pano***
////////////////////////////////////////////////////////////////////////////////

    function doStuff(event) {
        placeMarker(randomizedStreetveiw);

        // making the line on the map
        var disstanceOfLine = calculatingDistance(guessedLocation, randomizedStreetveiw, '#FF0000')

        currentScore.push(disstanceOfLine)

        // document.getElementById('scoreBox').innerHTML = Math.floor(disstanceOfLine) + ' Kilometers Away From Location!'
        window.alert(Math.round(disstanceOfLine*10)/10 + ' Miles Away From Location!');
        var totalScore = null
        for (var i = 0; i < currentScore.length; i++) {
            if (totalScore <= 100) {
                totalScore += currentScore[i]
            }
            else {
                window.alert('You have a combined error of ' + Math.round(totalScore*10)/10 + ' in ' + currentScore.length + ' guesses')
            }
        }

        guessDistFromCurButton.removeEventListener('click', distanceFromYouLc)
        // guessDistFromCurButton.addEventListener('click', distanceFromYouLc)

        $('#score').val(Math.round(totalScore*10)/10)
        return randomizedStreetveiw

    }

// ***find the disstance betweeen pano location and the location your searching from***
////////////////////////////////////////////////////////////////////////////////

    function distanceFromYouLc() {
        guessDistFromCurButton.addEventListener('click', function() {
            var distanceFromyouInMi = calculatingDistance(pos, randomizedStreetveiw, 'transparent')
            $('#howFar').val('This Panorama is ' + Math.round(distanceFromyouInMi*10)/10 + ' miles away from your location');
            // placeMarker(pos)
        })
    }

// ***resests the map***
////////////////////////////////////////////////////////////////////////////////
    nextButton.addEventListener('click', function(event) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: mapViewOfAustin,
            zoom: 9
        });
        createNewPano(clickingStuff, distanceFromYouLc)
        $('#howFar').val('')

    });

})
