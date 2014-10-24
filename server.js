// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs             = require('fs');
var url            = require('url');
var ObjectId	   = require('mongodb').ObjectID;

//other variables ==========================================


// configuration ===========================================
	
var db = 'mongodb://localhost/myMongooseDb';

var port = process.env.PORT || 8080; // set our port
// mongoose.connect(db.url); // connect to our mongoDB database (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + db + '! ' + err);
    } else {
        console.log('Successfully connected to: ' + db);
    }
});

// models ==================================================

//var model = require('./app/models');

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
//require('./app/routes')(app); // configure our routes

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// start app ===============================================
app.listen(port);										// startup our app at http://localhost:8080
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app


// **********************************************************
// model and routes *** can be moved to separate files ======
// **********************************************************

var
layoutschema = null,
sectionheadings = null,
sowlayout = null,
seclayout = null,
pmschema = null,
pmlayout = null,
vbschema = null,
vblayout = null,
utils = {},//stub, will be extended later

//define SOW layout schema
layoutschema = new mongoose.Schema({
    layoutname: String,
    sections: String
});

//define section heading schema
//********************************************
sectionheadings = new mongoose.Schema({
    secId: Number,
    secName: String,
    secXMLContent: String,
    secFileLoc: String
});

//define project management schema
pmschema = new mongoose.Schema({
    name: String,
    pmxml: String,
    pmFileLoc: String
})

vbschema = new mongoose.Schema({
    vbId: Number,
    bindingname: String,
    name: String,
    vbxml: String,
    vbFileLoc: String
})

//define data models, using the schemas that we just created
sowlayout = mongoose.model('SOWLayout', layoutschema);
seclayout = mongoose.model('SectionLayout', sectionheadings);
pmlayout = mongoose.model('PMLayout', pmschema);
vblayout = mongoose.model('vblayout', vbschema);


// ====================================================
// SOW layout route
// ====================================================
router.route('/sowlayout')
   
   // get all Section Heading layouts (access at GET http://localhost:8080/api/sowlayout)
	.get(function(req, res) {
		sowlayout.find(function(err, newlayout) {
			if (err)
				res.send(err);

			res.json(newlayout);
		});
	})

   // create new Section Heading Layouts (access at POST http://localhost:8080/api/sowlayout)
	.post(function(req, res) {
	    var layoutname = req.body.layoutname;
	    var sec = req.body.sections;
	  
	    //add a new document to the collection
	    newlayout = new sowlayout({
	        layoutname: layoutname,
	        sections: sec
	    });
	    
	    //save the new document
	    newlayout.save(function (err) {
	        if (err) console.log('Error on save!')

	        res.json({message: 'New SOW Layout created!'})
		});
    })

// on routes that end in /sowlayout/:idS
router.route('/sowlayout/:_id')
	
	// get SOW Layout with the layoutname (accessed at GET http://localhost:8080/api/sowlayout/:layoutname)
	.get(function(req, res){
		//sowlayout.findOne({layoutname: req.params.layoutname}, function(err, layout){
		sowlayout.findOne({"_id": ObjectId(req.params._id)}, function(err, layout){
			if (err)
				res.send(err);
			res.json(layout);
		});
	})

	// update the layout (access at PUT http://localhost:8080/api/sowlayout/:layoutname)
	.put(function(req, res){
		// use sowlayout model to find the layout we want
		sowlayout.findOne({"_id": ObjectId(req.params._id)}, function(err, layout){
			if (err)
				res.send(err);

			var sec = req.body.sections;
			var layoutname = req.body.layoutname;

			if (sec)
				layout.sections = sec; //update sections
			if (layoutname)
				layout.layoutname = layoutname; //update layoutname

			//save the layout
			layout.save(function(err){
				if (err)
					res.send(err);
				res.json({message: 'SOW Layout updated!'});
				console.log("SOW Layout updated! ...log");
			});
		});
	})

	// delete the SOW Layout with this layoutname (access at DELETE http://localhost:8080/api/sowlayout/:layoutname)
	.delete(function(req, res){
		sowlayout.remove({"_id": ObjectId(req.params._id)}, function (err, layout) {
			if (err)
				res.send(err);
			res.json({message: 'Successfully deleted'});
		});
	});


//get one SOW Layout. Called from the SOW Generator task pane (access at GET http://localhost:8080/api/sowlayout/getone/:layoutname)
router.route('/sowlayout/getone/:layoutname')

	.get(function(req, res) {
		sowlayout.find({"layoutname":req.params.layoutname}, function(err, layout){
			if (err)
				res.send(err);
			//layout = "?(" + layout + ")"
			res.jsonp(layout);
		});
	})

// ====================================================
//  Section layouts route
// ====================================================
router.route('/sectionlayout')

// get all section layouts (access at GET http://localhost:8080/api/sectionlayout)
	.get(function(req, res) {
		seclayout.find({},{secId:1, secName:1, secFileLoc:1}).sort({secId:1}).exec(function(err, layout) {
			if (err)
				res.send(err);

			res.json(layout);
		});
	})

 // create new Section Layout (access at POST http://localhost:8080/api/sectionlayout)
	.post(function(req, res) {
	    var secId = req.body.secId;
	    var secName = req.body.secName;
	    var filename = req.body.secFileLoc;
	    var filedata = fs.readFileSync('./AppContent/XML/Sections/' + filename + '.xml', "utf-8" );
	  
	    //wait for file to load before uploading it to db
	    setTimeout(function() {savelayout()},3000);

	    function savelayout(){
	        //add a new document to the collection
	        newlayout = new seclayout({
	            secId: secId,
	            secName: secName,
	            secFileLoc: filename,
	            secXMLContent: filedata
	        });
	        
	        //save the new document
	        newlayout.save(function (err) {
	            if (err) 
	            	console.log('Error on save!')
	            res.json({message: 'New Section Layout created!'})
	        });
        }
    });

// on routes that end in /sectionlayout/:id
router.route('/sectionlayout/:_id')
	
	// get Section Layout with the ID (accessed at GET http://localhost:8080/api/sectionlayout/:_id)
	.get(function(req, res){
		seclayout.findOne({"_id": ObjectId(req.params._id)}, function(err, seclayout){
			if (err)
				res.send(err);
			res.json(seclayout);
		});
	})

	// update a Section layout
	.put(function(req, res){
		var secId = req.body.secId;
	    var secName = req.body.secName;
	    var secFileLoc = req.body.secFileLoc;
	    var filedata;

	    seclayout.findOne({"_id": ObjectId(req.params._id)}, function(err, seclayout){
			if (err)
				res.send(err);
			
			if (secId)
				seclayout.secId = secId;
			if (secName)
				seclayout.secName = secName;   //update section name
				console.log("secName: " + secName);
			if (secFileLoc)
				seclayout.secFileLoc = secFileLoc;	
				console.log("secFileLoc: " + secFileLoc);			
				filedata = fs.readFileSync('./AppContent/XML/Sections/' + secFileLoc + '.xml', "utf-8" );
				seclayout.secXMLContent = filedata; //update section xml

			// Wait for the file to upload, then save the layout
			setTimeout(function(){
				seclayout.save(function(err){
				if (err)
					res.send(err);
				res.json({message: 'Layout updated!'});
			});
			}, 2500);
		});

	})

	// delete the Section Layout with this layoutname (access at DELETE http://localhost:8080/api/sectionlayout/:layoutname)
	.delete(function(req, res){
		seclayout.remove({"_id": ObjectId(req.params._id)}, function (err, layout) {
			if (err)
				res.send(err);
			res.json({message: 'Successfully deleted'});
		});
	});

// =============================================
// Called from SOW Generator. 
// Query parameter is a list of section IDs (e.g. 2,3,5,7,8,9,11,12);
// IDs are put into an array, split out, then a call to the db is made for each to obtain data
// for each Section layout (i.e. name, order, XML, etc).
// =============================================

app.get("/sections", function (req, res) {
    var url_parts = url.parse(req.url, true),
        query = url_parts.query,
        secarr = [],
        secarr = query.secIds,
        sections = {},
        data = '',
        sections = [];
        
    function oSec (secId,secName,secOrder,secXMLContent) {
        this.secId = secId,
        this.secName = secName,
        this.secOrder = secOrder,
        this.secXMLContent = secXMLContent
    };

    secarr = secarr.split(',');
    console.log(secarr);
    var a = 0
    //secarr = req.params.secIds.split(',');
    for (i=0; i<secarr.length; i++){
        callmongo(i);
    }; //end each 

    function callmongo(i){
        seclayout.findOne({ secId: secarr[i]}).exec(function (err, result) {
            if (!err) {
                console.log("func callmongo init");
                var newoSec = new oSec(result.secId,result.secName,i,result.secXMLContent);
                sections.push(newoSec);
                a++;
            } else {
                //res.end('Error in first query. ' + err)
                console.log("Error in query seclayout.findOne. Error: " + err);
            };
        }); 
    }

   // setTimeout(function() {console.log(sections["3"])}, 3000);
    setTimeout(function () {writeClient()},500);
    
    var str = '';
    function writeClient() {
        // sections.forEach(function(elem){
        //     str += JSON.stringify(elem, undefined, 2);
        // });
         
        str = JSON.stringify(sections,undefined, 2);
        if (utils.isJsonCallback(req)){
            str = utils.wrapDataInCallback(req, str);
        }    
        //deliver json
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(str);
    };
});

// ====================================================
//  Project Management layouts route
// ====================================================
router.route('/pmlayout')

// get all Project Management layouts (access at GET http://localhost:8080/api/sectionlayout)
	.get(function(req, res) {
		pmlayout.find({},{name:1, pmFileLoc:1}, function(err, layout) {
			if (err)
				res.send(err);

			res.json(layout);
		});
	})

	// create new PM layouts
	.post(function(req, res) {
	    var pmname = req.body.name;
	    var filename = req.body.pmFileLoc;
	    var filedata = fs.readFileSync('./AppContent/XML/PM/' + filename + '.xml', "utf-8" );
	  

	    //wait for file to load before uploading it to db
	    setTimeout(function() {savepmlayout()},3000);

	    function savepmlayout(){
	        //add a new document to the collection
	        newpmdoc = new pmlayout({
	            name: pmname,
	            pmxml: filedata,
	            pmFileLoc: filename
	        });
	        
	        //save the new document
	        newpmdoc.save(function (err) {
	            if (err) 
	            	console.log('Error on save!')
	            res.json({message: 'New Project Management Layout created!'})
	        });
        }
    });
    
// on routes that end in /pmlayout/:_id
router.route('/pmlayout/:_id')

// get Project Management Layout with the pmId (accessed at GET http://localhost:8080/api/pmlayout/:_id)
	.get(function(req, res){
		pmlayout.findOne({"_id": ObjectId(req.params._id)}, function(err, layout){
			if (err)
				res.send(err);
			res.json(layout);
		});
	})

	// update the pmlayout (access at PUT http://localhost:8080/api/pmlayout/:_id)
	.put(function(req, res){
		var name = req.body.name;
	    var filename = req.body.pmFileLoc;
	    var filedata;

	    pmlayout.findOne({"_id": ObjectId(req.params._id)}, function(err, layout){
			if (err)
				res.send(err);
			if (name)
				layout.name = name;   //update pm name
			if (filename)
				filedata = fs.readFileSync('./AppContent/XML/PM/' + filename + '.xml', "utf-8" );
				layout.pmFileLoc = filename;
				layout.pmxml = filedata; //update section xml
			
			// Wait for file to load, then save the layout
			setTimeout(function(){
				layout.save(function(err){
					if (err)
						res.send(err);
					res.json({message: 'PM  Layout updated!'});
				});
			}, 2500);
		});
	})

	// delete the PM Layout with this pmId (access at DELETE http://localhost:8080/api/pmlayout/:_id)
	.delete(function(req, res){
		pmlayout.remove({"_id": ObjectId(req.params._id)}, function (err, layout) {
			if (err)
				res.send(err);
			res.json({message: 'Successfully deleted'});
		});
	});


router.route('/pmlayout/getone/:pmname')

// get one PM doc. Called form the SOW Generator (access at GET http://localhost:8080/api/pmlayout/getone/:pmname)
	.get(function(req, res) {
		pmlayout.find({"name": req.params.pmname},function(err, layout) {
			if (err)
				res.send(err);
			//layout = "?(" + layout + ")"
			res.jsonp(layout);
		});
	});

// ====================================================
//  Verbiage Block layouts route
// ====================================================
router.route('/vblayout')

// get all Project Management layouts (access at GET http://localhost:8080/api/vblayout)
	.get(function(req, res) {
		vblayout.find({},{vbId:1, name:1, bindingname:1, vbFileLoc:1 }).sort({vbId:1}).exec(function(err, layout) {
			if (err)
				res.send(err);

			res.json(layout);
		});
	})

	// create new PM layouts
	.post(function(req, res) {
		var vbId = req.body.vbId;
	    var bindingname = req.body.bindingname;
	    var name = req.body.name;
	    var filename = req.body.vbFileLoc;
	    var filedata = fs.readFileSync('./AppContent/XML/VerbiageBlocks/' + filename + '.xml', "utf-8" );
	  
	    //wait for file to load before uploading it to db
	    setTimeout(function() {savevblayout()},3000);

	    function savevblayout(){
	        //add a new document to the collection
	        newlayout = new vblayout({
            vbId: vbId,
            bindingname: bindingname,
            name: name,
            vbFileLoc: filename,
            vbxml: filedata
        });
	        //save the new document
	        newlayout.save(function (err) {
	            if (err) 
	            	console.log('Error on save!')
	            res.json({message: 'New Verbiage Block Layout created!'})
	        });
        }
    });


// on routes that end in /vblayout/:vbId
router.route('/vblayout/:_id')
	
	// get Verbiage Block Layout with the vbId (accessed at GET http://localhost:8080/api/vblayout/:_id)
	.get(function(req, res){
		vblayout.findOne({"_id": ObjectId(req.params._id)}, function(err, layout){
			if (err)
				res.send(err);
			res.json(layout);
		});
	})

	// update the vblayout (access at PUT http://localhost:8080/api/sowlayout/:layoutname)
	.put(function(req, res){
		var vbId = req.body.vbId;
		var name = req.body.name;
		var bindingname = req.body.bindingname;
	    var filename = req.body.vbFileLoc;
	    var filedata;

	    vblayout.findOne({"_id": ObjectId(req.params._id)}, function(err, layout){
			if (err)
				res.send(err);
			if (vbId)
				layout.vbId = vbId;
			if (name)
				layout.name = name;   //update section name
			if (bindingname)
				layout.bindingname = bindingname;  //update bindingname
			if (filename)
				console.log("filename: " + filename);
				filedata = fs.readFileSync('./AppContent/XML/VerbiageBlocks/' + filename + '.xml', "utf-8" );
				layout.vbFileLoc = filename;
				layout.vbxml = filedata; //update section xml
			
			// Wait for file to load, then save the layout
			setTimeout(function(){
				layout.save(function(err){
					if (err)
						res.send(err);
					res.json({message: 'Verbiage Block Layout updated!'});
				});
			}, 2500);
		});
	})

	// delete the VB Layout with this vbId (access at DELETE http://localhost:8080/api/sowlayout/:_id)
	.delete(function(req, res){
		vblayout.remove({"_id": ObjectId(req.params._id)}, function (err, layout) {
			if (err)
				res.send(err);
			res.json({message: 'Successfully deleted'});
		});
	});
// ===========================================================
// Called from SOW Generator. Gets Verbiage Block layouts
// ===========================================================
app.get("/getvblayouts",function(req, res){
    var url_parts = url.parse(req.url, true),
        query = url_parts.query,
        vbarr = [],
        vbarr = query.vbIds,
        data = '',
        vbs = [];

    function oVB (vbId,bindingname,name,vbxml) {
        this.vbId = vbId,
        this.bindingname = bindingname,
        this.name = name,
        this.vbxml = vbxml
    };

    vbarr = vbarr.split(',');
    console.log(vbarr);
    for (i=0; i < vbarr.length; i++ ){
        callmongo(i);
    }

    function callmongo(i){
        vblayout.findOne({ vbId: vbarr[i]}).exec(function (err, result){
            if (!err){
                console.log("func callmongo init for vb: " + i);
                var newVB = new oVB(result.vbId, result.bindingname, result.name, result.vbxml);
                vbs.push(newVB);
            } else {
                console.log("Error in query vblayout.findOne. Error: " + err);
            }
        });
    }

    setTimeout(function() {writeClient()}, 500);
    var str = '';
    function writeClient(){
        str = JSON.stringify(vbs, undefined, 2);
        if (utils.isJsonCallback(req)){
            str = utils.wrapDataInCallback(req, str);
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(str);
    }
});

// ===================================================================
// Utilities
// ===================================================================

//returns the name of the JSON callback, if there is one
utils.getJsonCallbackName = function (req) {
    var url_parts = url.parse(req.url, true),
    query = url_parts.query;

    if (!url_parts.query || !url_parts.query.callback) { return false };

    return url_parts.query.callback;
};

//takes the passed-in string and returns it
//wrapped in the callback name
utils.wrapDataInCallback = function (req, str) {
    var
    start = utils.getJsonCallbackName(req) + '(',
    end = ')';

    return start + str + end;
};

//returns true if the query string contains a "callback" parameter
utils.isJsonCallback = function (req) {
    var retVal = utils.getJsonCallbackName(req);

    if (retVal) { return true };

    return false;
};

//deletes all data in the passed-in model
utils.deleteAllData = function (res, model) {
    var successMessage = ''
    + '<h1 style="color:red">All data has been deleted from the database!</h1>'
    + '<b><a href="/">Home</a></b>';

    //delete all data
    model.remove({}, function (err) {
        if (err) {
            console.log('There was an error deleting the old data.');
        } else {
            console.log('Successfully deleted the old data.');
            res.end(successMessage);
        }
    });
};