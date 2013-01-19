node-cheezburger
================

A module for interfacing with the cheezburger api

Usage
=====

Add cheezburger to your package.json

    npm install --save cheezburger


Require & Instantiate a Cheezburger instance with your access token

    var Cheezburger = require('cheezburger')
    var cheezburger = new Cheezburger({ access_token : "<your access token>"})

You can now make cheezburger calls:

cheezburger.ohai("Hello Ohai",function(err,response){
  console.log(response)
})

All responses are javascript objects with an `items` key containing an array of responses. If pagination is available, it will be returned as `page` and `page_size` keys.

Endpoints & Options
===================

### ohai
#### cheezburger.ohai(message - String, callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/ohai)

Returns an object with an items key. The first item is the response.


### Assets
#### cheezburger.assets.get(id - String, callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/assets)

Returns an object with an items key. The first item is the requested asset.

#### cheezburger.assets.post(options - Mixed, callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/assets)

Accepts the following options (or you can pass a file in place of options to accept all defaults):

- content	The image file	Required	File name, URL, or encoded data.
- title	Title of the asset	Optional	string
- description	Description of the asset	Optional	string
- site_id	ID of the site to post on	Optional	integer
- anonymous	Whether the posting is anonymous or not. If false, then the asset is associated with the current user account.	Optional. Default is false.	Boolean

Returns an object with an items key. The first item is the posted asset info.

### Asset Types
#### cheezburger.assettypes(callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/assettypes)

Returns an object with an items key. Each item is an asset type.

### Site Types
#### cheezburger.sitetypes(callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/sitetypes)

Returns an object with an items key. Each item is a site type.

### Me
#### cheezburger.me(callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/users)

Returns an object with an items key. The first item is the user belonging to the access token.

### User
#### cheezburger.user(id - String,callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/users)

Returns an object with an items key. The first item is the user belonging to the specified id.

### Me
#### cheezburger.me(callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/me)

Returns an object with an items key. The first item is the user belonging to the access token.

### Sites
#### cheezburger.sites(options - Mixed, callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/sites)

If called with an object, accepts the following arguments:

- parent_site_id	Parent site ID. If supplied, restricts the response to only children of that parent. Only a single value can be provided.	Optional	integer
- site_type_id	Site type ID. If supplied, restricts the response to only sites of a particular type. Default is 1 (Network). See sitetypes for more information.	Optional	integer

If called with an id as the first argument, will return the specified site.

If called with `mine` or `my` as the first argument, will return the logged in users' sites.

This endpoint may return more than 10 items. If it does, paging info will also be returned.

Returns an object with an items key. Each Item is a site.

### My Sites
#### cheezburger.mysites([options],callback)
[Cheezburger docs](https://developer.cheezburger.com/docs/sites)

If called without options, returns up to the first 10 sites for the current user.

Returns an object with an items key. Each item is a site belonging to the logged in user.


### Page
#### cheezburger.page(page,pageSize,method, [arguments ...])
[Cheezburger docs](https://developer.cheezburger.com/overview#paging)

Meta method for calling other methods with paging info. The only methods that will return paged info are `sites` and `mysites`.

Call curried with page, pageSize, and method - the other arguments are the same as the method specified. For instance, to call requesting sites:

    cheezburger.page(2,25,'sites','mine',function(err,obj){
      // obj.items is now an array of the 2nd page (25 per page) of my own sites.
    })

Using without an access token
=============================

You can use cheezburger without an access token by instantiating with a client id and secret:

    var cheezburger = new Cheezburger({ id : "<your client id>", secret : "<your client secret>" })

Cheezburger will automatically try to generate a token when you call the api.

Note that any user specific API endpoints will not work unless a user has logged in (see next section)

Prompting a user to log in
==========================

If using without an initial access_token, you can generate a url to send the user to.

Instantiate the Cheezburger API with your client_id:

    var cheezburger = new Cheezburger({ id : "<your client id>" })

Then when prompting your user to authorize your app, redirect them to:

    cheezburger.authUrl("http://yoursite.com/auth/success/handler")

where the passed url is where you want cheezburger to redirect back with the access token or error.

The redirected request will contain JSON with an access_token key. When you have that, set the access token on cheezburger to use the rest of the API:

    cheezburger.setAccessToken(response.access_token)

Reference for the cheezburger api is located here: [https://developer.cheezburger.com/docs/](https://developer.cheezburger.com/docs/)

Bugs & Stuff
============

Please file any bugs in the github issue tracker for this repo.

You can also contact me on twitter: @jesseditson