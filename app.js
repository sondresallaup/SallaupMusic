	// create the module and name it scotchApp
	var scotchApp = angular.module('scotchApp', ['ngRoute']);

	// configure our routes
	scotchApp.config(function($routeProvider) {
		$routeProvider

			// route for the home page
			.when('/', {
				templateUrl : 'pages/home.html',
				controller  : 'mainController'
			})

			// route for the about page
			.when('/artists', {
				templateUrl : 'pages/artists.html',
				controller  : 'artistsController'
			})

			// route for the about page
			.when('/artists/:artistId', {
				templateUrl : 'pages/artistsDetail.html',
				controller  : 'artistsDetailController'
			})

			// route for the contact page
			.when('/albums', {
				templateUrl : 'pages/albums.html',
				controller  : 'albumsController'
			})

			// route for the about page
			.when('/albums/:albumId', {
				templateUrl : 'pages/albumsDetail.html',
				controller  : 'albumsDetailController'
			})

			// route for the login page
			.when('/admin', {
				templateUrl : 'pages/admin.html',
				controller  : 'adminController'
			});
	});

	// create the controller and inject Angular's $scope
	scotchApp.controller('mainController', function($scope) {
		// create a message to display in our view
		$scope.message = 'Everyone come and see how good I look!';

		$scope.login = function() { 
			Parse.User.logIn($scope.credentials.username, $scope.credentials.password, {
			  success: function(user) {
			    $('#loginModal').modal('hide')
				location.reload();
			  },
			  error: function(user, error) {
			    $scope.error = true;
			  }
			});
			};

		var currentUser = Parse.User.current();
		if (currentUser) {
		    $scope.admin = true;
		} else {
		    $scope.admin = false;
		}

		$scope.logout = function() { 
			Parse.User.logOut();
			location.reload();
		}

		$scope.changeCSSGeek = function() {
			document.getElementById("bootstrap-css").href = "https://kristopolous.github.io/BOOTSTRA.386/assets/css/bootstrap.css";
			$scope.geek = true;
		}

		$scope.changeCSSNoGeek = function() {
			document.getElementById("bootstrap-css").href = "http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css";
			$scope.geek = false;
		}
	});

	scotchApp.controller('artistsController', function($scope) {
		var Artist = Parse.Object.extend("Artist");
		var artistQuery = new Parse.Query(Artist);
		artistQuery.ascending("name");
		artistQuery.find({
		  success: function(results) {
		    // Do something with the returned Parse.Object values
		    for (var i = 0; i < results.length; i++) { 
		      var object = results[i];
		      document.getElementById('artists').innerHTML += '<a href="#/artists/' + object.id + '">' + object.get('name') + '</a><br/>';
		    }
		  },
		  error: function(error) {
		    document.getElementById('artists').innerHTML = ("Error: " + error.code + " " + error.message);
		  }
		});

		$scope.showAddArtistForm = function() {
			$scope.addArtistFormVisible = true;
		}

		$scope.createNewArtist = function() {
			var Artist = Parse.Object.extend("Artist");
			var artist = new Artist();
			artist.set("name", $scope.artist.name);
			artist.save(null, {
				success: function(artist) {
					location.reload();
				},
				error: function(object, error) {
					alert(error.message);
				}
			});

		}
	});

	scotchApp.controller('albumsController', function($scope) {
		var Album = Parse.Object.extend("Album");
		var albumQuery = new Parse.Query(Album);
		albumQuery.ascending("artistName", "release");
		albumQuery.limit(1000);
		albumQuery.find({
		  success: function(results) {
		    // Do something with the returned Parse.Object values
		    var albumsHtml = "";
		    for (var i = 0; i < results.length; i++) { 
		      var object = results[i];
		      albumsHtml += '<tr><td>' + '<a href="#/artists/' + object.get('artist').id + '">' + object.get('artistName') + '</a>' + '</td><td>' + '<a href="#/albums/' + object.id + '">' + object.get('name') + '</a>' + '</td><td>' + object.get("release") + '</td></tr>';
		    }
		    $('#albums tbody').append(albumsHtml);
		  },
		  error: function(error) {
		    document.getElementById('albums').innerHTML = ("Error: " + error.code + " " + error.message);
		  }
		});

		$scope.showAddAlbumForm = function() {
			var artistSelect = document.getElementById("artistSelect");

			var Artist = Parse.Object.extend("Artist");
			var artistQuery = new Parse.Query(Artist);
			artistQuery.ascending("name");
			artistQuery.find({
				success: function(artists) {
					for(var i = 0; i < artists.length; i++) {
						var artist = artists[i];
						artistSelect.options[i+1] = new Option(artist.get("name"), artist.id);
						artistSelect.options[i+1].value = artist.id;
					}
				},
				error: function(objects, error) {
					console.log(error.message);
				}
			});

			$scope.addAlbumFormVisible = true;
		}

		$scope.createNewAlbum = function() {
			var Artist = Parse.Object.extend("Artist");
			var artistQuery = new Parse.Query(Artist);
			artistQuery.get($scope.album.artist, {
				success: function(artist) {
					var Album = Parse.Object.extend("Album");
					var album = new Album();
					album.set("name", $scope.album.name);
					album.set("artist", artist);
					album.set("artistName", artist.get("name"));
					album.set("release", $scope.album.release);
					album.set("owner", $scope.album.owner);
					album.save(null, {
						success: function(album) {
							location.reload();
						},
						error: function(object, error) {
							alert(error.message);
						}
					});
				}
			});
		}
	});

	scotchApp.controller('albumsDetailController', function($scope, $routeParams) {
		var Album = Parse.Object.extend("Album");
		var albumQuery = new Parse.Query(Album);
		albumQuery.get($routeParams.albumId, {
			success: function(album) {
				$('#albumName').append(album.get("name") + ' <small> by <a href="#/artists/'+ album.get("artist").id +'">'+ album.get("artistName") +'</a> <i>('+ album.get("release") +')</i></small>');
				$('#albumInfo').append('<h5><i>Owned by: ' + album.get("owner") + '</i></h5>');
			}
		})

	});

	scotchApp.controller('artistsDetailController', function($scope, $routeParams) {
		var Artist = Parse.Object.extend("Artist");
		var artistQuery = new Parse.Query(Artist);
		artistQuery.get($routeParams.artistId, {
			success: function(artist) {
				$('#artistName').append(artist.get("name"));

				var Album = Parse.Object.extend("Album");
				var albumQuery = new Parse.Query(Album);
				albumQuery.equalTo('artist', artist);
				albumQuery.ascending("artistName", "release");
				albumQuery.find({
				  success: function(results) {
				    // Do something with the returned Parse.Object values
				    for (var i = 0; i < results.length; i++) { 
				      var object = results[i];
				      $('#albums tbody').append('<tr><td>' + '<a href="#/albums/' + object.id + '">' + object.get('name') + '</a>' + '</td><td>' + object.get("release") + '</td></tr>');
				    }
				  },
				  error: function(error) {
				    document.getElementById('albums').innerHTML = ("Error: " + error.code + " " + error.message);
				  }
				});
			}
		})
	});

	scotchApp.controller('roundsDetailController', function($scope, $routeParams) {
		var Round = Parse.Object.extend("Round");
		var roundQuery = new Parse.Query(Round);
		roundQuery.get($routeParams.roundId, {
		  success: function(round) {
		    document.getElementById('round').innerHTML = '<h1>' + round.get('name') + '</h1><br/>';

		    var TeamRound = Parse.Object.extend("TeamRound");
			var teamRoundQuery = new Parse.Query(TeamRound);
			teamRoundQuery.equalTo("round", round);
			teamRoundQuery.descending("points");
			teamRoundQuery.find({
				success: function(teamRounds) {
					for(var i = 0; i < teamRounds.length; i++) {
						var teamRound = teamRounds[i];
						document.getElementById('teamsDataTableBody').innerHTML += '<tr><td>' + (i+1) + '</td><td><a href="#lag/'+ teamRound.get("team").id +'">' + teamRound.get('teamName') + '</a></td><td>' + teamRound.get('points') + '</td></tr>';
					}
				}
			});
		  },
		  error: function(object, error) {
		    console.log(error.message);
		  }
		});

		$scope.deleteRound = function() {
			if (confirm('Er du sikker på at vil slette denne runden?')) {
			    
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
				  success: function(round) {
				  		round.destroy({
				  			success: function(round) {
				  				alert("Runde slettet");
				  				window.history.back();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});

			}
		}

		$scope.editRound = function() {
			var newRoundName = prompt("Nytt navn");
			if(newRoundName != null) {
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
				  success: function(round) {
				  		round.set("name", newRoundName);
				  		round.save(null, {
				  			success: function(round) {
				  				location.reload();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});
			}
		}

		$scope.addNewTeam = function() {
			var teamsSelect = document.getElementById("teamsSelect");
			var selectedTeam = teamsSelect.options[teamsSelect.selectedIndex].value;

			if(selectedTeam != 0) {
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
					success: function(round) {
						var Team = Parse.Object.extend("Team");
						var teamQuery = new Parse.Query(Team);
						teamQuery.get(selectedTeam, {
							success: function(team) {
								team.set("totalPoints", team.get("totalPoints") + $scope.team.points);
								var TeamRound = Parse.Object.extend("TeamRound");
								var teamRound = new TeamRound();
								teamRound.set("round", round);
								teamRound.set("roundName", round.get("name"));
								teamRound.set("team", team);
								teamRound.set("teamName", team.get("name"));
								teamRound.set("points", $scope.team.points);
								teamRound.save(null, {
									success: function(teamRound) {
										location.reload();
									},
									error: function(object, error) {
										alert(error.message);
									}
								});
							}
						})
					}
				});
			}
			else {
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
					success: function(round) {
						var Team = Parse.Object.extend("Team");
						var team = new Team();
						team.set("name", $scope.team.name);
						team.set("totalPoints", $scope.team.points);
						team.save(null, {
							success: function(team) {
								var TeamRound = Parse.Object.extend("TeamRound");
								var teamRound = new TeamRound();
								teamRound.set("round", round);
								teamRound.set("roundName", round.get("name"));
								teamRound.set("team", team);
								teamRound.set("teamName", team.get("name"));
								teamRound.set("points", $scope.team.points);
								teamRound.save(null, {
									success: function(teamRound) {
										location.reload();
									},
									error: function(object, error) {
										alert(error.message);
									}
								});
							}
						})
					}
				});
			}
		}
	});

	scotchApp.controller('teamDetailController', function($scope, $routeParams) {
		var Team = Parse.Object.extend("Team");
		var teamQuery = new Parse.Query(Team);
		teamQuery.get($routeParams.teamId, {
		  success: function(team) {
		    document.getElementById('team').innerHTML = '<h1>' + team.get('name') + '</h1><br/>';

		    var TeamRound = Parse.Object.extend("TeamRound");
			var teamRoundQuery = new Parse.Query(TeamRound);
			teamRoundQuery.equalTo("team", team);
			teamRoundQuery.descending("createdAt");
			teamRoundQuery.find({
				success: function(teamRounds) {
					for(var i = 0; i < teamRounds.length; i++) {
						var teamRound = teamRounds[i];
						document.getElementById('teamDataTableBody').innerHTML += '<tr><td><a href="#runder/'+ teamRound.get("round").id +'">' + teamRound.get('roundName') + '</a></td><td>' + teamRound.get('points') + '</td><td>' + "plassering" + '</td></tr>';
					}
				}
			});
		  },
		  error: function(object, error) {
		    console.log(error.message);
		  }
		});

		$scope.deleteTeam = function() {
			if (confirm('Er du sikker på at vil slette denne runden?')) {
			    
				var Team = Parse.Object.extend("Team");
				var teamQuery = new Parse.Query(Team);
				teamQuery.get($routeParams.teamId, {
				  success: function(team) {
				  		team.destroy({
				  			success: function(team) {
				  				alert("Lag slettet");
				  				window.history.back();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});

			}
		}

		$scope.editTeam = function() {
			var newTeamName = prompt("Nytt navn");
			if(newTeamName != null) {
				var Team = Parse.Object.extend("Team");
				var teamQuery = new Parse.Query(Team);
				teamQuery.get($routeParams.teamId, {
				  success: function(team) {
				  		team.set("name", newTeamName);
				  		team.save(null, {
				  			success: function(team) {
				  				location.reload();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});
			}
		}
	});

	Parse.initialize("ySlGKrkwFsFr837ps6gvVnHfJC9VsQ46sIysxR6e", "h9BEMyOxvwnLbvTx2DNrzen7of0Cuz2eukn4pBKN");