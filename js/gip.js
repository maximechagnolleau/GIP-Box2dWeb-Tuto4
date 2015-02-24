(function(){

	var box2dUtils;		// classe utilitaire
	var world; 			// "monde" 2dbox
	var canvas;			// notre canvas
	var canvasWidth;	// largeur du canvas
	var canvasHeight;	// hauteur du canvas
	var context;		// contexte 2d
	var SCALE = 30;		// échelle
	
	var player = null;
	var keys = [];

	// Initialisation
	$(document).ready(function() {
		init();
	});

	// Lancer à l'initialisation de la page
	this.init = function() {
		box2dUtils = new Box2dUtils(SCALE);	// instancier la classe utilitaire

		// Récupérer la canvas, ses propriétés et le contexte 2d
		canvas = $('#gipCanvas').get(0);
		canvasWidth = parseInt(canvas.width);
		canvasHeight = parseInt(canvas.height);
		context = canvas.getContext('2d');

		world = box2dUtils.createWorld(context); // box2DWorld
		
		// Créer le "sol" et le "plafond" de notre environnement physique
		ground = box2dUtils.createBox(world, 150, canvasHeight - 10, 150, 10, null, true, 'ground');
		glue = box2dUtils.createBox(world, 550, canvasHeight - 10, 250, 10, null, true, 'glue');
		ceiling = box2dUtils.createBox(world, 400, -5, 400, 1, true, 'ceiling');
		
		// Créer les "murs" de notre environnement physique
		leftWall = box2dUtils.createBox(world, -5, canvasHeight, 1, canvasHeight, null, true, 'leftWall');
		leftWall = box2dUtils.createBox(world, canvasWidth + 5, canvasHeight, 1, canvasHeight, null, true, 'leftWall');
		
		// Ajouter des obstacles
		var obstacles = new Array(
				{x: 130, y: canvasHeight - 50, width: 60, height: 30},
				{x: 290, y: canvasHeight - 170, width: 50, height: 10},
				{x: 80, y: 330, width: 80, height: 10},
				{x: 320, y: 365, width: 20, height: 75},
				{x: 320, y: 110, width: 20, height: 110},
				{x: 400, y: 320, width: 100, height: 10},
				{x: canvasWidth - 50, y: canvasHeight - 60, width: 50, height: 40},
				{x: canvasWidth - 100, y: 259, width: 100, height: 120},
				{x: canvasWidth - 30, y: 109, width: 30, height: 30},
				{x: 560, y: 180, width: 60, height: 10, angle: -35}
		);
		var nbObstacles = obstacles.length;
		for (var i = 0; i < nbObstacles; i++) {
			var obstacle = obstacles[i];
			box2dUtils.createBox(world, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 
					obstacle.angle != undefined ? obstacle.angle : null, true, 'box');
		}
		
		// Ajouter la zone de victoire
		box2dUtils.createBox(world, canvasWidth - 20, canvasHeight - 98, 20, 2, null, true, 'winZone');
		
		// Créer une box
		box2dUtils.createBox(world, 650, 0, 40, 40, null, false, 'box');
		
		// Créer le player
		player = new Player(SCALE);
		player.createPlayer(world, 25, canvasHeight-30, 20);

		// Exécuter le rendu de l'environnement 2d
		window.setInterval(update, 1000 / 60);
		
		// Ajouter le listener de collisions
		addContactListener();
		
		// Ajouter les listeners d'évènements
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		
		// Désactiver les scrollings vertical lors d'un appui sur les touches directionnelles "haut" et "bas"
		document.onkeydown = function(event) {
			return event.keyCode != 38 && event.keyCode != 40;
		}
	}

	// Mettre à jour le rendu de l'environnement 2d
	this.update = function() {

		// gérer les interactions
		handleInteractions();
		
        // effectuer les simulations physiques et mettre à jour le canvas
		world.Step(1 / 60,  10, 10);
		world.DrawDebugData();
		world.ClearForces();
	}
	
	// appuyer sur une touche
	this.handleKeyDown = function(evt) {
		keys[evt.keyCode] = true;
	}

	// relacher une touche
	this.handleKeyUp = function(evt) {
		keys[evt.keyCode] = false;
	}

	// Gérer les interactions
	this.handleInteractions = function() {
		// touche "haut"
		if (keys[38]) {
			player.jump();
		}
		// touches "gauche" et "droite"
		if (keys[37]) {
			player.moveLeft();
		} else if (keys[39]) {
			player.moveRight();
		}	
	}

	// Déterminer si l'objet physique est les pieds du player
	this.isFootPlayer = function(object) {
		if (object != null && object.GetUserData() != null) {
			return object.GetUserData() == 'footPlayer';
		}
	}

	// Déterminer si l'objet physique est le sol ou une box
	this.isGroundOrBox = function(object) {
		if (object != null && object.GetUserData() != null) {
			return (object.GetUserData() == 'box' || object.GetUserData() == 'ground');
		}
	}
	
	// Déterminer si l'objet physique est la zone de victoire
	this.isWinZone = function(object) {
		if (object != null && object.GetUserData() != null) {
			return (object.GetUserData() == 'winZone');
		}
	}
	
	// Ajout du listener sur les collisions
	this.addContactListener = function() {
		var b2Listener = Box2D.Dynamics.b2ContactListener;
		//Add listeners for contact
		var listener = new b2Listener;
		
		// Entrée en contact
		listener.BeginContact = function(contact) {
			var obj1 = contact.GetFixtureA();
			var obj2 = contact.GetFixtureB();
			if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
				if (isWinZone(obj1) || isWinZone(obj2)) {
					alert('You win !');		// le joueur est sur la zone de victoire
				} else if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {					
					player.jumpContacts ++;	// le joueur entre en contact avec une plate-forme de saut
				}
			}
		}
		
		// Fin de contact
		listener.EndContact = function(contact) {
			var obj1 = contact.GetFixtureA();
			var obj2 = contact.GetFixtureB();
			if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
				if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {
					player.jumpContacts --;	// le joueur quitte une plate-forme de saut
				}
			}
		}
		listener.PostSolve = function(contact, impulse) {
			// PostSolve
		}
		listener.PreSolve = function(contact, oldManifold) {
		    // PreSolve
		}
		world.SetContactListener(listener);
	}
	
}());