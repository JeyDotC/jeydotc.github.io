---
layout: post
title:  "Hosting Nancy in Dnn Part 1: hello world"
date:   2015-11-26
categories: Blog, ASP, Nancy, Nancyfx, DNN, DotNetNuke
---

Hosting Nancy in DNN is fairly easy, but it has some gotchas; I'll explain how to do it with a simple hello world module connected to DotNetNuke via Nancy.Hosting.Aspnet.  

## Motivation

We are living cloudy times. Making flexible and adaptative software is more important now than ever, especially to avoid vendor lock-in and to deal with $tratageic change$ which occur more often than before.

I've found that even ASP.NET MVC is kind of difficult to modularize(any link to a post on how to do it would be appreciated), and for 'modularize' I mean to have groups of functionalities (from controllers-up) in independent dlls so they can be all in the same server today and in separated servers tomorrow.  The Areas feature is, as long as I know, insufficient to achieve that.

Then we have Nancy(http://nancyfx.org/) which has two characteristics that I find perfect to couple with these changing cloudy days:

* You can spread your Controllers (Modules in Nancy jargon) across multiple dlls, which allows to easily add and remove functionalities in a deployment node.
* It can be deployed in a [wide range of environments](https://github.com/NancyFx/Nancy/wiki/Documentation#hosting), from ASP.NET to Raspberry pi.

These two characteristics make nancy suitable for both, stand alone applications and what I call *"remora software"*, software that lives bedides other systems, extending them or exposing some infrastructure functionality that otherwise would be cumbersome to add. Examples:

* A backend for DesktopModules that work as SPAs. Such backend would still valid if you stopped using DNN, something that (IMHO) still impossible with Dnn Web API implementation.
* A management API that lives aside a legacy project. Adding and removing 'remoras' for an existing system is easier with Nancy.

Wrapping up, Nancy is a very flexible alternative if your system's front end deployment changes very often.

## Let's do it!

### Choosing the Host

As stated before, Nancy can be deployed in several environments, so, the first thing to do is to choose the host.

The most natural options to the time o this writing (with DNN 7.4.2 as the latest version) are [OWIN](https://github.com/NancyFx/Nancy/wiki/Hosting-nancy-with-owin) and [ASP.NET](https://github.com/NancyFx/Nancy/wiki/Hosting-Nancy-with-asp.net).

Each one may have their own advantages and disadvantages, in what concerns to modules, they are the exactly the same.

This time I've chosen ASP.NET, I haven't made any comparisons, that's for another post, the reason is simply to keep using what is already there; the asp.net stack.

 ### Getting the libraries
 
 All you need to start using Nancy is these two dlls: Nancy.dll and Nancy.Host.\*.dll where Nancy.Host.\*.dll will be Nancy.Host.Aspnet.dll for this post. You can get them from NuGet as usual.
 
 > **Tip:** None of the dlls containing modules need to reference the host dll, only Nancy.dll is required for those. 
 
 ### Writing owr module
 
 Creating a module in nancy is as simple as creating a library project, reference Nancy.dll and creating a public class like this:
 
 ```csharp
 // Details here: https://github.com/NancyFx/Nancy/wiki/Exploring-the-nancy-module
 public class SampleModule : Nancy.NancyModule
{
    public SampleModule() : base("/MyServices")
    {
        Get["/"] = _ => "Hello World!";
    }
}
 ```
 
 Note that we call the base constructor to pass it a base URL, this is important to avoid conflicts with DNN routing system. Just make sure that all modules have a base path and that it is the same for everyone, we'll see why later.
 
 ### Configuring the handler
 
 For the ASP.NET host, we need to configure an HTTP handler. To do so, we just add a new entry in the Web.config file of DNN under configuration > system.webserver > modules:
 
 ```xml
  <add name="NancyHandler" verb="*" type="Nancy.Hosting.Aspnet.NancyHttpRequestHandler" path="MyServices*" /> 
 ```
 
 ### Building the thing
 
 Just make sure that the dlls are in the bin folder of DNN.
 
 ### Launching in 3...2...1... wait! where is the rocket?
 
 Having everthing configured and built, all we need is to navigate to http://yoursite/MyServices and we will see a fancy hello world, isn't it?. Well **NO!** the first thing you'll find is a blank page or the DNN's 404. Really sad :(
	 
After hours of suffering and blaming Dnn, I fond [this post](http://www.dnnsoftware.com/community-blog/cid/154902/getting-signalr-to-work-with-advanced-urls-in-dnn-71). 

The problem was that Dnn has some redirection rules and the main one states that any route that is not a folder or file, gets redirected to `Default.aspx` thus, the nancy handler gets ignored.

To avoid that, one must run this script:

```sql
insert into {databaseOwner}{objectQualifier}hostsettings
(SettingName
, SettingValue
, SettingIsSecure 
, CreatedByUserId
, CreatedOnDate
, LastModifiedByUserId
, LastModifiedOnDate
)
values(
'AUM_DoNotRewriteRegEx'
,'/MyServices(/.*)'
, 0
, -1
, GETDATE()
, -1
, GETDATE()
)  
```

Where  `{databaseOwner}` is usually `dbo.` and `{objectQualifier}` is the one specified at the moment of installation.

This script tells Dnn not to redirect any routes that matches the given regular expression.

After that, our module should work propperly.

Be careful in chosing your regular expression, it should affect only those routes that point to nancy modules, if it were, for example, `/Admin(/.*)` you may hide the administration funcionalities of DNN.

If the entry already exists, for example, if your site has it configured for SignalR, just edit it and add your route with a pipe, example: `'SignalR|/MyServices(/.*)'`.

And that's it, we have a hello world with Nancy in DNN. For my next post I'll be extending it to add further integration with DNN.