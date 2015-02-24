(function(){
	// "Import" des classes box2dweb
	var b2World = Box2D.Dynamics.b2World;
	var b2Vec2 = Box2D.Common.Math.b2Vec2;
	var b2AABB = Box2D.Collision.b2AABB;
	var b2BodyDef = Box2D.Dynamics.b2BodyDef;
	var b2Body = Box2D.Dynamics.b2Body;
	var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
	var b2Fixture = Box2D.Dynamics.b2Fixture;
	var b2MassData = Box2D.Collision.Shapes.b2MassData;
	var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
	var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
	var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
	var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;
	
	/**
	 * Constructeur
	 */
	Box2dUtils = function(scale) {
		this.SCALE = scale;	// Définir l'échelle
	}
	
	/**
	 * Classe Box2dUtils
	 */
	Box2dUtils.prototype = {
	
			/**
			 * Créer le "monde" 2dbox
			 * @param context le contexte 2d dans lequel travailler
			 * @return b2World
			 */
			createWorld : function(context) {
		         var world = new b2World(
		        		 new b2Vec2(0, 10),	// gravité
		        		 true				// doSleep
		        );
	
		         // Définir la méthode d'affichage du débug
		         var debugDraw = new b2DebugDraw();
		         // Définir les propriétés d'affichage du débug
		         debugDraw.SetSprite(context);		// contexte
		         debugDraw.SetFillAlpha(0.3);		// transparence
		         debugDraw.SetLineThickness(1.0); 	// épaisseur du trait
		         debugDraw.SetDrawScale(30.0);		// échelle
		         // Affecter la méthode de d'affichage du débug au monde 2dbox
				 debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		         world.SetDebugDraw(debugDraw);
	
		         return world;
			},
			
			/**
			 * Créer un objet
			 * @param string type : le type d'objet à créer
			 * @param b2World world : le monde 2dbox dans lequel ajouter l'objet
			 * @param Number x : position x de l'objet
			 * @param Number y : position y de l'objet
			 * @param Object dimensions : les dimensions de l'objet
			 * @param Number angle : angle d'inclinaison (nullable)
			 * @param Boolean fixed : l'objet est-il statique ou dynamique
			 * @param * userData : propriétés spécifiques de l'objet
			 * @return l'objet dans le monde 2dbox
			 */
			createBody : function(type, world, x, y, dimensions, angle, fixed, userData) {
				// Par défaut, l'objet est statique
				if (typeof(fixed) == 'undefined') {
					fixed = true;
				}
				// Créer l'élément Fixture
				var fixDef = new b2FixtureDef();
				fixDef.userData = userData;		// attribuer les propriétés spécifiques de l'objet
				// Dessiner l'objet en fonction de son type : sa forme et ses dimensions
				switch (type) {
					case 'box':
						fixDef.shape = new b2PolygonShape();
						if (angle == null) {
							fixDef.shape.SetAsBox(dimensions.width / this.SCALE, dimensions.height / this.SCALE);
						} else {
							fixDef.shape.SetAsOrientedBox(dimensions.width / this.SCALE, dimensions.height / this.SCALE, 
									new b2Vec2(0, 0),			// position par rapport au centre du body
									angle * (Math.PI / 180)); 	// angle d'orientation (en radians)
						}
						break;
					case 'ball':
						fixDef.shape = new b2CircleShape(dimensions.radius / this.SCALE);
						break;
				}
				// Créer l'élément Body
				var bodyDef = new b2BodyDef();
				// Affecter la position à l'élément Body
				bodyDef.position.x = x / this.SCALE;
				bodyDef.position.y = y / this.SCALE;
				if (fixed) {
					// élément statique
					bodyDef.type = b2Body.b2_staticBody;
				} else {
					// élément dynamique
					bodyDef.type = b2Body.b2_dynamicBody;
					fixDef.density = 1.0;
					fixDef.restitution = 0.5;
				}
				// Assigner l'élément fixture à l'élément body et l'ajouter au monde 2dbox
				return world.CreateBody(bodyDef).CreateFixture(fixDef);
			},
	
			/**
			 * Créer un objet "box"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la box
			 * @param Number x : position x de la box
			 * @param Number y : position y de la box
			 * @param Number width : la largeur de la box
			 * @param Number height : la hauteur de la box
			 * @param Number angle : angle d'inclinaison (nullable)
			 * @param Boolean fixed : la box est-elle statique ou dynamique
			 * @param * userData : propriétés spécifiques de la box
			 * @return la box dans le monde 2dbox
			 */
			createBox : function(world, x, y, width, height, angle, fixed, userData) {
				// Définir les dimensions de la box
				var dimensions = {
						width: width,
						height: height
				};
				// Appel à createBody()
				return this.createBody('box', world, x, y, dimensions, angle, fixed, userData);
			},
	
			/**
			 * Créer un objet "ball"
			 * @param b2World world : le monde 2dbox dans lequel ajouter la ball
			 * @param Number x : position x de la ball
			 * @param Number y : position y de la ball
			 * @param Number radius : le rayon de la ball
			 * @param Boolean fixed : la ball est-elle statique ou dynamique
			 * @param * userData : propriétés spécifiques de la ball
			 * @return la ball dans le monde 2dbox
			 */
			createBall : function(world, x, y, radius, fixed, userData) {
				// Définir les dimensions de la ball
				var dimensions = {
					radius: radius	
				};
				// Appel à createBody()
				return this.createBody('ball', world, x, y, dimensions, null, fixed, userData);
			},
			
			/**
			 * Créer un objet "player"
			 * @param b2World world : le monde 2dbox dans lequel ajouter le player
			 * @param Number x : position x du player
			 * @param Number y : position y du player
			 * @param Number radius : le rayon du player
			 * @param * userData : propriétés spécifiques du player
			 * @return le player dans le monde 2dbox
			 */
			createPlayer : function(world, x, y, radius, userData) {
				// Créer le body player
				var playerObject = this.createBall(world, x, y, radius, false, userData);
				playerObject.SetDensity(2);
				playerObject.SetRestitution(0.2);
				playerObject.SetFriction(0);
				playerObject.GetBody().SetSleepingAllowed(false);	// l'objet player n'est pas autorisé à passer au repos
				playerObject.GetBody().SetFixedRotation(true);		// empécher le player de "rouler"
				
				// Ajouter des "pieds"
				var footDef = new b2FixtureDef();
				footDef.friction = 2;
				footDef.userData = 'footPlayer';
				footDef.shape = new b2PolygonShape();
				footDef.shape.SetAsOrientedBox(10 / this.SCALE, 10 / this.SCALE, 
						new b2Vec2(0, radius / 1.8 / this.SCALE),	// position par rapport centre du body
						0											// angle d'orientation
				);
				playerObject.GetBody().CreateFixture(footDef);
				
				return playerObject;
			}
	}
}());