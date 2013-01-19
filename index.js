// Cheezburger
// I can has api

// Dependencies
// ---

var request = require('request'),
    qs = require('querystring')

// Private Vars
// ---
var access_token
var cheezburger_url = "https://api.cheezburger.com"
var config_keys = ['id','secret','verbose']
var cheezburger

// Main
// ---
var Cheezburger = module.exports = function(config){
  if(!config) throw new Error("You must instantiate Cheezburger with a config object")
  this.config = validateOptions(config_keys,config,this.config)
  cheezburger = this
}

// Public Methods
// ---
Cheezburger.prototype.ohai = function(message,callback){
  doRequest(['ohai',{message : message}],parseResponse.bind(this,callback))
}
Cheezburger.prototype.assets = {
  post : function(options,callback){
    var params = {}
    if(!options.content){
      // allow posting with just content & default values
      params.content = options
    } else {
      // validate options
      params = validateOptions(['content','title','description','site_id','anonymous'],options,params)
    }
    if(!params.content) return callback(new Error("Content is requred for posting an asset"))
    doRequest(['assets'],{
      form : params,
      method : 'post'
    },parseResponse.bind(this,callback))
  },
  get : function(id,callback){
    if(isNaN(parseInt(id,10))) return callback(new Error("Invalid ID passed to assets.get"))
    doRequest([['assets',id]],parseResponse.bind(this,callback))
  }
}
Cheezburger.prototype.assettypes = Cheezburger.prototype.assetTypes = function(callback){
  doRequest(['assettypes'],parseResponse.bind(this,callback))
}
Cheezburger.prototype.sitetypes = Cheezburger.prototype.siteTypes = function(callback){
  doRequest(['sitetypes'],parseResponse.bind(this,callback))
}
Cheezburger.prototype.me = function(callback){
  doRequest(['me'],parseResponse.bind(this,callback))
}
Cheezburger.prototype.user = Cheezburger.prototype.users = function(id,callback){
  if(isNaN(parseInt(id,10))) return callback(new Error("Invalid ID passed to user endpoint"))
  doRequest([['users',id]],parseResponse.bind(this,callback))
}
Cheezburger.prototype.sites = function(options,callback){
  if(!isNaN(parseInt(options,10))){
    // this was passed an ID. get the site.
    return doRequest([['sites',options]],parseResponse.bind(this,callback))
  } else if(options == "mine" || options == "my"){
    return this.mysites(callback)
  } else {
    var params = validateOptions(['parent_site_id','site_type_id'],options)
    doRequest(['sites',params],parseResponse.bind(this,callback))
  }
}
Cheezburger.prototype.mysites = Cheezburger.prototype.mySites = function(options,callback){
  if(!callback){
    callback = options
    options = {}
  }
  doRequest([['my','sites'],options],parseResponse.bind(this,callback))
}
// meta method for calling any above method with page size
Cheezburger.prototype.page = function(page,pageSize,method /* [arguments] */){
  var pagingEndpoints = ['sites','mysites','mySites']
  var args = Array.prototype.slice.call(arguments,3)
  if(~pagingEndpoints.indexOf(method) && isNaN(parseInt(args[0],10)) && !/m(ine|y)/.test(args[0])){
    args[0].page = page || 1
    args[0].page = page_size || 10
    this[method].apply(this,args)
  } else {
    // not a pageable endpoint, just call it
    this[method].apply(this,args)
  }
}
// logging method
Cheezburger.prototype.log = function(){
  if(!this.config || !this.config.verbose) return false
  console.log.apply(console,arguments)
}


// Authorization
Cheezburger.prototype.authUrl = function(successUrl){
  if(!this.config.id) throw new Error("You must instantiate Cheezburger with an id to generate access token urls")
  successUrl = successUrl || "https://api.cheezburger.com/oauth/login_success"
  return cheezburger_url + "/oauth/authorize?client_id=" + this.config.id + "&response_type=token&redirect_uri=" + successUrl
}
Cheezburger.prototype.setAccessToken = function(token){
  access_token = token
}

// Private Methods
// ---
// get access token - gets a server side access token. Cannot be used with mine or me endpoints.
var getAccessToken = function(callback){
  if(!this.config.id || !this.config.secret) throw new Error("Instantiated without access token or client credentials. Please pass id & secret in instantiation object.")
  request.post('https://api.cheezburger.com/oauth/access_token',{form : {client_id : this.config.id, client_secret : this.config.secret, grant_type : "client_credentials"}},function(err,res){
    parseResponse(function(err,info){
      if(err || !info.access_token) return callback(err || new Error("Cheezburger did not return an access_token"))
      access_token = info.access_token
      callback(null)
    },err,res)
  })
}
// do request - wraps request, making sure an access token is available first.
var doRequest = function(){
  var args = Array.prototype.slice.call(arguments)
  // callback is always last argument
  var callback = args[args.length-1]
  if(access_token){
    args[0] = getCheezburgerUrl.apply(this,args[0])
    request.apply(this,args)
  } else {
    cheezburger.log("No access token. Generating token.")
    getAccessToken.call(cheezburger,function(err){
      cheezburger.log("Auto generated access token: " + access_token)
      if(err) return callback(err)
      args[0] = getCheezburgerUrl.apply(this,args[0])
      request.apply(this,args)
    })
  }
}
// validate options - removes options not specified in 'valid' array
var validateOptions = function(valid,opts,params){
  params = params || {}
  // always allow page size params
  valid = valid.concat(['page','page_size'])
  for(var o in opts){
    if(!opts.hasOwnProperty(o) || !~valid.indexOf(o)) continue
    params[o] = opts[o]
  }
  return params
}
// parse response - cb is first arg to allow binding.
var parseResponse = function(callback,err,res){
  if(err) return callback(err)
  var parsed
  try {
    parsed = JSON.parse(res.body)
  } catch(e){
    return callback(new Error("Malformed response: " + res.body))
  }
  callback(null,parsed)
}
// get a cheezburger url - pass an array or string endpoint and an optional query.
var getCheezburgerUrl = function(endpoint,query){
  if(typeof endpoint == "string") endpoint = [endpoint]
  //if(!access_token) throw new Error("No Access Token set. Please set access token or pass access token in config.")
  if(!query.access_token) query.access_token = access_token
  var url = cheezburger_url + "/v1/" + endpoint.join('/') + "?" + qs.stringify(query)
  cheezburger.log("calling cheezburger url:",url)
  return url
}