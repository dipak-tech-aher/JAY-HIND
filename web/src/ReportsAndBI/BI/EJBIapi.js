/* eslint-disable no-restricted-globals */
/*!
  * @(#) EJBIapi.js Version: 4.0 <May 10, 2014>
  * 
  * Copyright 2015 Elegant MicroWeb Technologies Pvt. Ltd. (India). All Rights Reserved. Use is subject to license terms.
  * 
  */
import $ from 'jquery' 

var contextUrl="";
var scrolling = "No";
export default function EJBIapi (params) {

	var formId = '';
	var formName = '';
	var iframeId = '';
	var iframeName = '';
	var getTokenUrl = "/API/getToken";
	var getObjectUrl = "/API/getObject";
	var getNLPTokenUrl = "/API/getNLPToken";
	var getNLPObjectUrl = "/API/getNLPObject";
	var ssoURL = "/API/getToken";
	
	
	/* OBJECT TYPES CONSTANTS */
	this.CROSSTAB=0;
	this.GRAPH=1;
	this.TABULAR =2;
	this.DASHBOAR=3;
	this.KPI=13;
	this.KPI_GROUP = 14;
	
	var options = {
	// AUTH CONFIG *
		// Access KEY Conf	
		 accesskey : '',
		 	//or
		 username:'',
		 password:'',
		 //OR TOKEN Conf
		 tokenid:'',
		 //OR SSO Conf
		 ssoParams:'',
	// CONFIGURATION
		//Server url and object configuration *  
		 objectid :'',
		 type:'', // Type Of Response : Data/Object
		 url :'',
		// object Behaviour Conf 
		 toolbar:'',
		 showobjectname:'',
		 
	//  New Object Configuration
		 objectType:-1, // Type Of Object : Crosstab/Graph/Tabular/Dashboard/KPI/KPI_Group
		// Container Conf 
		 
		 height:'100%',
		 width:'100%',
		 containerid:'', //document.currentScript.parentNode.id,
		 teamup:'',
		 responsive:'',/*,
		 filter:''*/
		 tokenURL : getTokenUrl,
		 objectURL : getObjectUrl 
	};
	
	var NLPoptions = {
			// AUTH CONFIG *
				// Access KEY Conf	
				 accesskey : '',
				 	//or
				 username:'',
				 password:'',
				 //OR TOKEN Conf
				 tokenid:'',
				 //OR SSO Conf
				 ssoParams:'',
			// CONFIGURATION
				//Server url and object configuration *  
				 objectid :'',
				 type:'', // Type Of Response : Data/Object/typeAhead
				 url :'',
				// object Behaviour Conf 
			/*	 toolbar:'',
				 showobjectname:'',*/
				 
			//  New Object Configuration
//				 objectType:-1, // Type Of Object : Crosstab/Graph/Tabular/Dashboard/KPI/KPI_Group
				// Container Conf 
				 rightpane:'',
				 selectdataset:'',
				 height:'100%',
				 width:'100%',
				 containerid:'', //document.currentScript.parentNode.id,
//				 teamup:'',
				 responsive:'',/*,
				 filter:''*/
				 query:'',
				 tokenURL : getNLPTokenUrl,
				 objectURL : getNLPObjectUrl,
				 submitFunction :''
			};
	
	
	
	if(params){
		merge(options,params);
		merge(NLPoptions,params);
		contextUrl = options.url+"/";
		
	}
	function createFromAndIframe(from, opts){
		var nm = "";
		
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ ) {
	    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    formId = nm;
	    formName = nm;
	    nm = '';
	    for( var i=0; i < 5; i++ ) {
	    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    iframeId = nm;
	    iframeName = nm;
	    var inputHidden = "";

	    for(var key in opts){
	    	inputHidden += "<input type=\"hidden\" name=\""+key+"\" value=\""+opts[key]+"\">"
	    }
		var frmName = "<form action="+opts.url+opts.tokenURL+" name="+formName+" target="+iframeName+" id="+formId+"  method=\"POST\">"
					+ inputHidden
					+"<input type=\"hidden\" name=\"isfromjs\"  value=\"true\">"
					+"<input type=\"hidden\" name=\"isNew\"  value=\""+(from === 'new')+"\">"
					/*+"<input type=\"hidden\" name=\"accesskey\" value="+options.accesskey+">"
					+"<input type=\"hidden\" name=\"objectid\"  value="+options.objectid+">"
					+"<input type=\"hidden\" name=\"username\"  value="+options.username+">"
					+"<input type=\"hidden\" name=\"password\"  value="+options.password+">"
					+"<input type=\"hidden\" name=\"toolbar\"  value="+options.toolbar+">"
					+"<input type=\"hidden\" name=\"showobjectname\"  value="+options.showobjectname+">"
					+"<input type=\"hidden\" name=\"type\"  value="+options.type+">"
					+"<input type=\"hidden\" name=\"objectType\"  value="+options.objectType+">"
					
					+"<input type=\"hidden\" name=\"url\"  value=\""+options.url+"\">"
					
					+"<input type=\"hidden\" name=\"teamup\"  value="+options.teamup+">"
					+"<input type=\"hidden\" name=\"responsive\"  value="+options.responsive+">"*/
					
					+"</form>";
		/*+"<input type=\"hidden\" name=\"filter\"  value="+options.filter+">"*/
		const divForm = document.createElement("div");		
		divForm.id = (formId+opts.containerid);
		divForm.innerHTML = frmName;
		document.body.appendChild(divForm);
		//append to Body 
		//document.body.innerHTML +=frmName;
		var htmlValue = createIframe(iframeId,iframeName);
		document.getElementById(opts.containerid).innerHTML = htmlValue; 
		/*var iframeContent="<html><head><script src='"+options.url+"/js/common.js' type='text/javascript'></script>"+
				"<link rel='stylesheet' href='"+options.url+"/themes/default/css/default.css'></head>"+
				"<body><div id='loading' className='displaynone'>"+
					"<img id='loading-image' alt='Loading...' src='"+options.url+"/themes/default/img/loading.gif'>"+
				"</div>"+
				"<script type='text/javascript'>showProgressOverlay();</script></body></html>";
		var doc = document.getElementById(iframeId).contentWindow.document;
		doc.open();
		doc.write(iframeContent);
		doc.close();*/
	}
	function createIframe (id, name){
		var iFrameName = "<iframe id='"+iframeId+"' name='"+iframeName+"' scrolling='"+scrolling+"' style=\"width:"+options.width+"; height:"+options.height+";\"frameBorder=\"0\">"+
				"</iframe>";
		return iFrameName;
	} 
	
	this.loadObject = function(){
		scrolling = "No";
		if (options.tokenid !=='')
		{
			var nm = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    formId = nm;
		    formName = nm;
		    nm = '';
		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    iframeId = nm;
		    iframeName = nm;
			//alert('token found');
			document.getElementById(options.containerid).innerHTML =createIframe(iframeId,iframeName);
			//alert(options.url+getObjectUrl+"?TokenKey="+options.tokenid.trim());
			document.getElementById(iframeId).src = options.url+getObjectUrl+"?tokenid="+options.tokenid.trim();
		}
		else if (options.ssoParams != null && options.ssoParams !==''){
			var nm = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    iframeName = nm;
		    iframeId=nm;
		    
		    document.getElementById(options.containerid).innerHTML =createIframe(nm,nm);
		    var defaultParams =(options.ssoParams.trim()==='')?'':'&';
		    defaultParams +='isSSO=true&isfromjs=true&showobjectname='+options.showobjectname+'&toolbar='+options.toolbar+'&objectid='+options.objectid+'&teamup='+options.teamup+'&responsive='+options.responsive;		
		    for(var key in options){
		    	if(key !== "isSSO" && key !== "isfromjs" && key !== "showobjectname" && key !== "toolbar" && key !== "objectid" && key !== "teamup" &&
		    			key !== "responsive" && key !== "url" && key !== "ssoParams" && key !== "accesskey" && key !== "autoHeight" && key !== "containerid" && key !== "height"
		    				&& key !== "objectType" && key !== "objectid" && key !== "password" && key !== "teamup" && key !== "tokenid" && key !== "type" && key !== "username" 
		    					&& key !== "width" && key !== "__proto__") {
		    		defaultParams +='&'+key+"="+options[key];
		    	}
		    }
		    var ssoUrl = options.url+ssoURL+'?'+options.ssoParams+defaultParams;
		    document.getElementById(nm).src= ssoUrl;
			
		}
		else{
			createFromAndIframe('load',options);
			//var frmid = options.iframeId;
			document.forms[formId].submit();
			document.getElementById(formId+options.containerid).innerHTML = '';
		}
	};
	
	this.loadNLPObject = function(){
		scrolling ="No";
		if (options.tokenid !=='')
		{
			var nm = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    formId = nm;
		    formName = nm;
		    nm = '';
		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    iframeId = nm;
		    iframeName = nm;
			//alert('token found');
			document.getElementById(options.containerid).innerHTML =createIframe(iframeId,iframeName);
			//alert(options.url+getObjectUrl+"?TokenKey="+options.tokenid.trim());
			document.getElementById(iframeId).src = options.url+getNLPObjectUrl+"?tokenid="+options.tokenid.trim()+"&query="+options.query.trim();
		}
		else if (options.ssoParams != null && options.ssoParams !==''){
			var nm = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    iframeName = nm;
		    iframeId=nm;
		    
		    document.getElementById(options.containerid).innerHTML =createIframe(nm,nm);
		    var defaultParams =(options.ssoParams.trim()==='')?'':'&';
		    defaultParams +='isSSO=true&isfromjs=true&showobjectname='+options.showobjectname+'&toolbar='+options.toolbar+'&objectid='+options.objectid+'&teamup='+options.teamup+'&responsive='+options.responsive;		
		    for(var key in options){
		    	if(key !== "isSSO" && key !== "isfromjs" && key !== "showobjectname" && key !== "toolbar" && key !== "objectid" && key !== "teamup" &&
		    			key !== "responsive" && key !== "url" && key !== "ssoParams" && key !== "accesskey" && key !== "autoHeight" && key !== "containerid" && key !== "height"
		    				&& key !== "objectType" && key !== "objectid" && key !== "password" && key !== "teamup" && key !== "tokenid" && key !== "type" && key !== "username" 
		    					&& key !== "width" && key !== "__proto__") {
		    		defaultParams +='&'+key+"="+options[key];
		    	}
		    }
		    var ssoUrl = options.url+ssoURL+'?'+NLPoptions.ssoParams+defaultParams;
		    document.getElementById(nm).src= ssoUrl;
			
		}
		else{
			createFromAndIframe('load',NLPoptions);
			//var frmid = options.iframeId;
			document.forms[formId].submit();
			document.getElementById(formId+NLPoptions.containerid).innerHTML = '';
		}
	};
	
	this.loadTypeAhed = function(){
		if (options.tokenid  == ''){
			console.error("Token not Set :  Option tikenid must be set for TypeAhed");
		} else {
			var params = '?tokenid='+options.tokenid+"&objectid="+options.objectid+"&type="+options.type+"&query="+NLPoptions.query+"&selectdataset="+NLPoptions.selectdataset;
			
			$.ajax({
		          url: options.url+getNLPObjectUrl+params,
		          //type: 'GET',
		          headers: {
		            //WRITE IF THEIR HAVE SOME HEADER REQUEST OR DATA
		          },
		          crossDomain: true,
		          success: function (data, textStatus, xhr) {
		            console.log(data);
		            document.getElementById(options.containerid).innerHTML = data;
		            // DOM: Create the script element
		            var jsElm = document.createElement("script");
		            // set the type attribute
		            jsElm.type = "application/javascript";
		            // make the script element load file
		            jsElm.src = options.url+"/js/typeahead.bundle.js";
		            // finally insert the element to the body element in order to load the script
		            document.body.appendChild(jsElm);
		            
		            // DOM: Create the script element
		            /*jsElm = document.createElement("script");
		            // set the type attribute
		            jsElm.type = "application/javascript";
		            // make the script element load file
		            jsElm.src = options.url+"/js/common.js";
		            // finally insert the element to the body element in order to load the script
		            document.body.appendChild(jsElm);
		            
		            // DOM: Create the script element
		            jsElm = document.createElement("script");
		            // set the type attribute
		            jsElm.type = "application/javascript";
		            // make the script element load file
		            jsElm.src = options.url+"/js/ajax.js";
		            // finally insert the element to the body element in order to load the script
		            document.body.appendChild(jsElm);*/
		            // DOM: Create the script element
		            jsElm = document.createElement("script");
		            // set the type attribute
		            jsElm.type = "application/javascript";
		            // make the script element load file
		            jsElm.src = options.url+"/js/APInlpTypeAhead.js";
		            // finally insert the element to the body element in order to load the script
		            document.body.appendChild(jsElm);
		            
		            // DOM: Create the script element
		            jsElm = document.createElement("link");
		            // set the type attribute
		            jsElm.rel = "stylesheet";
		            // make the script element load file
		            jsElm.href = options.url+"/themes/default/css/nlpTypeAhead.css";
		            // finally insert the element to the body element in order to load the script
		            document.body.appendChild(jsElm);
		            
		            
		            if (NLPoptions.submitFunction != ''){
		        		$('#typeahead').keydown(function (e) {
		      			  if (e.which == 13) {
		      				  var fromNlpPage = $(".top-search #fromNlpPage").val();
		      				  var datasetId = $(".top-search #selectedDataset").val();
		      				  var sentance = $(".top-search #typeahead").val();
		      			//	  submitNlpQuery(fromNlpPage,datasetId, sentance);
		      				  var funToCall = NLPoptions.submitFunction+"('"+datasetId+"','"+sentance+"')";
		      				  eval(funToCall);

		      				  setTimeout(function(sentance){ $(".top-search #typeahead").val(sentance);  }, 200,sentance);
		      				 event.preventDefault(); 
		      			  }
		        		});
		            }
		          },
		          error: function (xhr, textStatus, errorThrown) {
		            console.log(errorThrown);
		          }
		        });
		}
	};
	
	this.loadPredictive = function(){
		if (options.tokenid !=='') {
			var params = '?tokenid='+options.tokenid;
			
		} else{
			scrolling ="Yes";
			createFromAndIframe('load',options);
			//var frmid = options.iframeId;
			document.forms[formId].submit();
			document.getElementById(formId+options.containerid).innerHTML = '';
		}
	};
	
	
	this.newObject=function(objectType){
		options.objectType= objectType;
		if (options.objectType == -1 ){
			console.log("Type Not Set : option type must be set for newObject.")
		}
		if (options.tokenid !=='') {
			var nm = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    formId = nm;
		    formName = nm;
		    nm = '';
		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    iframeId = nm;
		    iframeName = nm;
			//alert('token found');
			document.getElementById(options.containerid).innerHTML =createIframe(iframeId,iframeName);
			//alert(options.url+getObjectUrl+"?TokenKey="+options.tokenid.trim());
			document.getElementById(iframeId).src = options.url+getObjectUrl+"?tokenid="+options.tokenid.trim();
		} else if (options.ssoParams != null && options.ssoParams !==''){
			var nm = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 5; i++ ) {
		    	nm += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    iframeName = nm;
		    iframeId=nm;
		    
		    document.getElementById(options.containerid).innerHTML =createIframe(nm,nm);
		    var defaultParams =(options.ssoParams.trim()==='')?'':'&';
		    defaultParams +='isSSO=true&isNew=true&isfromjs=true&objectid=new&objectType='+options.objectType+'&teamup='+options.teamup+'&responsive='+options.responsive;	
		    var ssoUrl = options.url+ssoURL+'?'+options.ssoParams+defaultParams;
		    document.getElementById(nm).src= ssoUrl;
			
		}	else{
			createFromAndIframe('new',options);
			//var frmid = options.iframeId;
			document.forms[formId].submit();
			document.getElementById(formId+options.containerid).innerHTML = '';
		}
		
		document.getElementById(options.containerid).style.minHeight = "500px";

		
	};
	
	function merge(options,params){
	    for(var key in params){
	        if(params.hasOwnProperty(key)){
	        	options[key] = params[key];
	        }
	    }
	    return options;
	}
	// browser compatibility: get method for event 
    // addEventListener(FF, Webkit, Opera, IE9+) and attachEvent(IE5-8)
    var myEventMethod = 
        window.addEventListener ? "addEventListener" : "attachEvent";
    // create event listener
    var myEventListener = window[myEventMethod];
    // browser compatibility: attach event uses onmessage
    var myEventMessage = 
        myEventMethod == "attachEvent" ? "onmessage" : "message";
    // register callback function on incoming message
    myEventListener(myEventMessage, function (e) {
        // we will get a string (better browser support) and validate
        // if it is an int - set the height of the iframe #my-iframe-id
        if (e.data === parseInt(e.data)) 
        	{
        		console.log('the data :: ' +  e.data + " iframeId "+ iframeId);
        		if(document.getElementById(iframeId)) {
	        		document.getElementById(iframeId).style.height = "";
	        		document.getElementById(iframeId).style.height = e.data+"px";
        		}
//        		$("#"+iframeId).css('height', '');
//        		$("#"+iframeId).css("height",e.data+"px");
        	}
    }, false);
}

function getPredicionFromJS(id,dataForPrediction,url,username,password,callBackFunction){
var data = "{\"predictiveId\":\""+id+"\",\"predictiveData\":"+dataForPrediction+"}";
	var settings = {
			  "async": true,
			  "crossDomain": true,
			  "url": url+"/API/predictive/getPrediction",
			  "method": "POST",
			  "headers": {
			    "authorization": "Basic YWRtaW46YWRtaW4=",
			    "content-type": "application/json",
			    "password": username,
			    "username": password,
			    "cache-control": "no-cache"
			  },
			  "processData": false,
			  "data": data
			}
			$.ajax(settings).done(function (response) {
					eval(callBackFunction);
			});
}

function getModelDataPredictiveFromJS(id,url,username,password,callbackFunction){
	var data = "{\"predictiveId\":\""+id+"\"}";
	var settings = {
			  "async": true,
			  "crossDomain": true,
			  "url": url+"/API/predictive/getModelData",
			  "method": "POST",
			  "headers": {
			    "authorization": "Basic YWRtaW46YWRtaW4=",
			    "content-type": "application/json",
			    "password": username,
			    "username": password,
			    "cache-control": "no-cache"
			  },
			  "processData": false,
			  "data": data
			}
	debugger;
			$.ajax(settings).done(function (response) {
					eval(callbackFunction);
			});
}


