var mongoose = require('mongoose');

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
    secXMLContent: String
});

//define project management schema
pmschema = new mongoose.Schema({
    name: String,
    pmxml: String
})

vbschema = new mongoose.Schema({
    vbId: Number,
    bindingname: String,
    name: String,
    vbxml: String
})

//define data models, using the schemas that we just created
sowlayout = mongoose.model('SOWLayout', layoutschema);
seclayout = mongoose.model('SectionLayout', sectionheadings);
pmlayout = mongoose.model('PMLayout', pmschema);
vblayout = mongoose.model('vblayout', vbschema);


//get all sow layouts
app.get("/api/sowlayout", function (req, res) {
    //return every record in the database
    sowlayout.find({}).exec(function (err, result) {
        var str = null;

        if (!err) {
            //stringify the database search result
            str = JSON.stringify(result, undefined, 2);

            //if a json callback was provided in the query string
            if (utils.isJsonCallback(req)) {
                //wrap the json data with the named callbacck
                str = utils.wrapDataInCallback(req, str);
            };

            //deliver the json
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(str);
        } else {
            res.end('Error in first query. ' + err)
        };
    });
});

//get all section layouts
app.get("/viewsechead", function (req, res) {
    //return every record in the database
    seclayout.find({}).exec(function (err, result) {
        var str = null;

        if (!err) {
            //stringify the database search result
            str = JSON.stringify(result, undefined, 2);

            //if a json callback was provided in the query string
            if (utils.isJsonCallback(req)) {
                //wrap the json data with the named callbacck
                str = utils.wrapDataInCallback(req, str);
            };

            //deliver the json
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(str);
        } else {
            res.end('Error in first query. ' + err)
        };
    });
});

//get sow layout based on ID
app.get("/get", function (req, res) {
    var url_parts = url.parse(req.url, true),
        query = url_parts.query,
        ID = query.layoutname,
        pmname = query.name;

    if (ID){
        sowlayout.find({layoutname: ID}).exec(function (err, result){
            write(err, result);
        });
    } else if (pmname){
        pmlayout.find({name: pmname}).exec(function (err, result) {
            write(err,result);
        });
    }
   
    function write(err,result){
        
    var str = null;   
        if (!err) {
            str = JSON.stringify(result, undefined, 2);
            if (utils.isJsonCallback(req)) {
                str = utils.wrapDataInCallback(req, str);
            };
            //deliver the json
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(str);
        } else {
            res.end('Error in first query. ' + err)
        };
    }
    
});

//get sections xml
app.get("/api/sections", function (req, res) {
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
app.get("/api/getvblayouts",function(req, res){
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

//update Section xml
app.get("/api/updatesec", function(req,res){
    var str = '', 
    menu = '<br /><br /><b><a href="/">Home</a>   <a href="/json">View JSON Data</a></b>',
    url_parts = url.parse(req.url, true), 
    query = url_parts.query,
    secId = query.secId, 
    filename = query.filename,
    filedata = fs.readFileSync('./AppData/XML/Sections/' + filename + '.xml', "utf-8" );
    
    //set conditions for updating XML data
    var conditions = {secId: secId}
        , update = {$set: {secXMLContent: filedata }}
        , options = { multi: false};

    seclayout.update(conditions, update, options,callback);

    function callback(err, numAffected){
       res.writeHead(200, { 'Content-Type': 'text/html' });
        
        if (!err){
            str = '<p>' + numAffected + ' documents have been updated successfully!</p>' + menu;
            //send the response
            res.end(str);
        } else {
            str = '<p> The following error has occurred during the update: ' + err + '</p>'
            //send the response
            res.end(str);
        }
    }
})

//add SOW layout 
app.get("/addlayout", function (req, res) {
    var
    str = '',
    menu = '<br /><br /><b><a href="/">Home</a>   <a href="/json">View JSON Data</a></b>',
    url_parts = url.parse(req.url, true),
    query = url_parts.query,
    layoutname = query.layoutname,
    sec = query.sections
  
    //add a new document to the collection
    newlayout = new sowlayout({
        layoutname: layoutname,
        sections: sec
    });
    
    //save the new document
    newlayout.save(function (err) {
        if (err) console.log('Error on save!')
    });

    //prepare the response
    res.writeHead(200, { 'Content-Type': 'text/html' });

    str = ''
        + '<h1>New Layout Added!</h1><b>Layout Name:</b> ' + newlayout.layoutname
        + '<br /><br /><b>Layaout Sections: </b> ' + newlayout.sections
        + '<br /><br /><b>This layout\'s id is:</b> ' + newlayout._id
        + menu;

    //send the response
    res.end(str);
});

//add PM Layout
app.get("/addPMLayout", function(req, res){
    var str = '',
    menu = '<br /><br /><b><a href="/">Home</a>     <a href="/json">View JSON Data</a></b>',
    url_parts = url.parse(req.url, true),
    query = url_parts.query,
    name = query.name,
    filename = query.filename,
    filedata = fs.readFileSync('./AppData/XML/PM/' + filename + '.xml', "utf-8" );

     setTimeout(function() {savepmlayout()},2500);

    function savepmlayout(){
        //add a new document to the colleciton
        newpmdoc = new pmlayout({
            name: name,
            pmxml: filedata
        })

        //save the new document
        newpmdoc.save(function (err) {
            if (err) {console.log('Error on Save!')}
        })

        //prep the response
        res.writeHead(200, { 'Content-Type': 'text/html' });

        str = ''
            + '<h1>New Layout Added!</h1><b>PM Layout Name:</b> ' + newpmdoc.name
            + '<br /><br /><b>This layout\'s id is:</b> ' + newpmdoc._id
            + '<br /><br /><b>Layaout Content: </b> ' + newpmdoc.pmxml
            + menu;

        //send the response
        res.end(str);
    }; //end save layout

})

//add Section Heading (XML) layout 
app.get("/addsecheadlayout", function (req, res) {
    var
    str = '',
    menu = '<br /><br /><b><a href="/">Home</a><a href="/viewsechead">View JSON Data</a></b>',
    url_parts = url.parse(req.url, true),
    query = url_parts.query,
    secId = query.secId,
    secName = query.secName,
    filename = query.filename;


    //var filedata = fs.readFileSync("./1_VB.xml", "utf-8");
    var filedata = fs.readFileSync('./AppData/XML/Sections/' + filename + '.xml', "utf-8" );
       
    setTimeout(function() {savelayout()},3000);

    function savelayout(){
        //add a new document to the collection
        newlayout = new seclayout({
            secId: secId,
            secName: secName,
            secXMLContent: filedata
        });
        
        //save the new document
        newlayout.save(function (err) {
            if (err) console.log('Error on save!')
        });

        //prepare the response
        res.writeHead(200, { 'Content-Type': 'text/html' });

        str = ''
            + '<h1>New Layout Added!</h1><b>Section ID: </b> ' + newlayout.secId
            + '<br /><br /><b>Section Name: </b> ' + newlayout.secName
            + '<br /><br /><b>This layout\'s id is:</b> ' + newlayout._id
            + '<br /><br /><b>XML Content: </b>' + newlayout.secXMLContent
            + menu;

        //send the response
        res.end(str);

    }; //end save layout
});

//add verbiage block layouts
app.get("/addVBlayout", function(req, res){
    var
    str = '',
    menu = '<br /><br /><b><a href="/">Home</a><a href="/viewsechead">View JSON Data</a></b>',
    url_parts = url.parse(req.url, true),
    query = url_parts.query,
    vbId = query.vbId,
    bindname = query.bindingname,
    name = query.name,
    filename = query.filename,
    filedata =  fs.readFileSync('./AppData/XML/VerbiageBlocks/' + filename + '.xml', "utf-8" );

    setTimeout(function() {savelayout()}, 3000);

    function savelayout(){
        //add a new document to the collection
        newlayout = new vblayout({
            vbId: vbId,
            bindingname: bindname,
            name: name,
            vbxml: filedata
        });
        
        //save the new document
        newlayout.save(function (err) {
            if (err) console.log('Error on save!')
        });

        //prepare the response
        res.writeHead(200, { 'Content-Type': 'text/html' });

        str = ''
            + '<h1>New Layout Added!</h1><b>Verbiage Block ID: </b> ' + newlayout.vbId
            + '<br /><br /><b>Verbiage Block Name: </b> ' + newlayout.name
            + '<br /><br /><b>This layout\'s id is:</b> ' + newlayout._id
            + '<br /><br /><b>XML Content: </b>' + newlayout.vbxml
            + menu;

        //send the response
        res.end(str);

    }; //end save layout

});

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