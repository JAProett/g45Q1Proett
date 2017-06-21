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
    var imagePano = 'http://maps.google.com/mapfiles/kml/pal4/icon61.png';
    var imageGuess = 'http://maps.google.com/mapfiles/kml/pal4/icon53.png';
    var imageYrLoc = 'http://maps.google.com/mapfiles/kml/pal2/icon10.png';
    var map
    var pos


    // ***Start Button that sets the map***
    ////////////////////////////////////////////////////////////////////////////////

// make this a function so you can resuse the reset bro #noteToFutureMe
    newGameButton.addEventListener('click', function newgame(event) {
        newMap();
        createNewPano();
        currentScore = [];
        clickingStuff();
        distanceFromYouLc();
        $('#howFar').val('')
        $('#score').val('')
        $('#guessesBox').val('')
        window.alert('See how few miles you accumulate in 5 guesses!')
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

    // ***get location of this computor d***
    ////////////////////////////////////////////////////////////////////////////////
    navigator.geolocation.getCurrentPosition(function(position) {
        pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        return pos
    })

    // ***create place Marker***
    ////////////////////////////////////////////////////////////////////////////////
    function placeMarker(location, markerFromSmwhr) {
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            icon: markerFromSmwhr
        });
    }

    // ***function that gets the distacne in km from Lat Lon cords***
    ////////////////////////////////////////////////////////////////////////////////
    function calculatingDistance(userInput, theTargetInput, colorOfLine) {
        var lineOfDifferece = new google.maps.Polyline({
            path: [userInput, theTargetInput],
            geodesic: true,
            strokeColor: colorOfLine,
            strokeOpacity: .9,
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

        return lineOfDifferece.inKm() * .621371192;
    }

    // ***makes new street pano cycles through untill find random point with pano***
    ////////////////////////////////////////////////////////////////////////////////
    function createNewPano(toRunLater, runYouLocAfter) {
        var projectionResolved = new Promise(function(res, rej) {
            var panorama = {}
            reRun(panorama, function(result) {
                res(result);
            });
        })

        //
        // a higher order recursive function that retries street views at a random location until a valid one is found
        function reRun(pano, cb) {
            setTimeout(function() {
                if (!!pano.projection) {
                    cb(panorama)
                } else {
                    var panorama = fetchNewPanorama()
                    reRun(panorama, cb)
                }
            }, 200)
        }

        function fetchNewPanorama() {
            return new google.maps.StreetViewPanorama(
                document.getElementById('pano'), {
                    position: randomizeIt(),
                    addressControl: false,
                    fullscreenControl: false,
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


    // ***generate new map***
    ////////////////////////////////////////////////////////////////////////////////
    function newMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: mapViewOfAustin,
            zoom: 10,
            mapTypeId: 'hybrid',
            streetViewControl: false,
            mapTypeControl: false
        });
        return map
    }

    // ***assigns the clicked point on the map a lat lon***
    ////////////////////////////////////////////////////////////////////////////////
    function clickingStuff() {
        google.maps.event.addListener(map, 'click', function firstGuess(ev) {
            guessedLocation = ev.latLng;
            placeMarker(ev.latLng, imagePano);

            return guessedLocation
        });

        subButton.removeEventListener('click', getResultsOfGuess);
        subButton.addEventListener('click', getResultsOfGuess);

    }

    // ***submits guess and evaluates distance from guess to location of the pano***
    ////////////////////////////////////////////////////////////////////////////////

    function getResultsOfGuess(event) {
        placeMarker(randomizedStreetveiw, imageGuess);

        var disstanceOfLine = calculatingDistance(guessedLocation, randomizedStreetveiw, '#ff0000')

        currentScore.push(disstanceOfLine)

        window.alert(Math.round(disstanceOfLine * 10) / 10 + ' Miles Away From Location!');
        var totalScore = null
        for (var i = 0; i < currentScore.length; i++) {
            if (i <= 3) {
                totalScore += currentScore[i]
            }
            if (i === 4) {
                totalScore += currentScore[i]
                window.alert('You have a combined error of ' + Math.round(totalScore * 10) / 10 + ' in ' + currentScore.length + ' guesses')
            }
        }
        var reamainingGuesses = 5 - currentScore.length;
        // guessDistFromCurButton.removeEventListener('click', distanceFromYouLc)
        // guessDistFromCurButton.addEventListener('click', distanceFromYouLc)

        $('#score').val('total of ' + Math.round(totalScore * 10) / 10 + 'mi off.')
        $('#guessesBox').val(reamainingGuesses + ' guesses left!')
        return randomizedStreetveiw
    }

    // ***find the disstance betweeen pano location and the location your searching from***
    ////////////////////////////////////////////////////////////////////////////////

    function distanceFromYouLc() {
        guessDistFromCurButton.addEventListener('click', function() {
            var distanceFromyouInMi = calculatingDistance(pos, randomizedStreetveiw, 'transparent')
            $('#howFar').val('This is ' + Math.round(distanceFromyouInMi * 10) / 10 + ' miles away from you.');
            placeMarker(pos, imageYrLoc)
        })
    }

    // ***resests the map***
    ////////////////////////////////////////////////////////////////////////////////
    nextButton.addEventListener('click', function(event) {
        if (currentScore.length === 5) {
            newMap();
            createNewPano();
            currentScore = [];
            clickingStuff();
            distanceFromYouLc();
            $('#howFar').val('')
            $('#score').val('')
            $('#guessesBox').val('')
        }
        newMap();
        createNewPano(clickingStuff, distanceFromYouLc)
        $('#howFar').val('')
    });
})
