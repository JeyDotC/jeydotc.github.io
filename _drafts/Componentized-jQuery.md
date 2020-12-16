---
layout: post
title:  "COMPONENTIZED JQUERY"
date:   2020-12-15
categories: Blog, JavaScript, jQuery, React
---

## What is this?

Well, working with jQuery solely can be very, very messy, the code can be quite difficult to follow, specially when it grows a lot.

What I'm going to expose here is a series of practices and, some code that will allow you to emulate React hooks workflow without requiring any library other than jQuery.

> **Important Notice:** This is not IE11 friendly at all, it uses lots of modern JavaScript! 

## But, why?

For the same reason Doom runs on pregnancy tests, because we can! Also, because I hope someone finds this useful, specially if you're trapped/attached to jQuery.

## Let's get started

Let's create our componentized jQuery thing. To do that, we'll need to follow the next 4 steps. For this experiment all we need is jQuery and Bootstrap (bootstrap is not mandatory, is just pretty useful).

> If you just want to read the whole code and see it in action, you can just go to this jsFiddle: https://jsfiddle.net/jeyssonguevara/8bxeoua7/21/

## Setup the page

The first thing we want to do is create a simple html file with the basic stuff:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Componentized JQuery</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" />
</head>
<body>

<div id="app"></div>

<script type="application/javascript" src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
</body>
</html>
```

There we just load Bootstrap and jQuery, that's all the external stuff we need. Also, notice the `<div id="app"></div>` element which is all the markup we need to mount our app.

## 1. No modules? Don't worry

The first thing we do in any react application is to declare and load modules with the `export` and `import` keywords, but we're not bundling or compiling this or even using amd, so, what do we have left? well, the classic self-invoking functions!

The convention we're going to use here, in order to keep code organized, is to create a self-invoking function to represent our modules, with just a basic convention in order to emulate the export and import logic.

```javascript
(function ($, exports){

})(jQuery, window);
```

Notice that the declared function will receive two values: jQuery, which will be re-baptized as '$', and the global window object which will be known as 'exports'.

### 1.1 Let's export something

Now we can create a module that does something and export it:

```javascript
// MyCoolModule.js 
(function ($, exports){
    const someCoolVariableOnlyKnownByMyModuleAndInitializedOnlyOnce = 'Weeeeee';
    function MyCoolModule(){
        // Do cools tuff here:
    }
    exports.MyCoolModule = MyCoolModule;
})(jQuery, window);
``` 

If you're familiar with node modules in general, you'll notice that you get some of its benefits, like, local variables, once per module load initialization logic and all that stuff.

### 1.2 Let's import something

Now our module has been declared, we can import it from somewhere else:

```javascript
 // SomeOtherModule.js 
 (function ($, exports){
    // Get the cool function:
     const { MyCoolModule } = exports;
    // Use it:
    MyCoolModule();
 })(jQuery, window);
``` 

> If you are not familiar with this syntax: `const { MyCoolModule } = exports;` please, take a look at [Object Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring), it is a pretty cool modern JavaScript feature we'll be using a lot here.

**Just make sure to load the script files in order!**

```html
<script src="MyCoolModule.js"></script>
<script src="SomeOtherModule.js"></script>
```

Ok, now we know how to declare "modules", we can start with the real fun stuff! 

## 2. Render something

The first thing we want to do is to display things, for now we won't worry about changing stuff, that will come later. We'll focus on establishing the guidelines for rendering components.

Since we want to mimic the react hooks, we'll just define our functions as such, just that we don't have the markup thing that will be compiled into react createElement calls. Instead, we'll just return a jQuery element.

```javascript
// Button.js 
(function ($, exports){
    
    function Button(props){
        // Here we just create and return a jQuery element.
        return $("<button>");
    }
    exports.Button = Button;
})(jQuery, window);
```

As you can see, the Button function just creates and returns an element which can have children appended, attributes added and all the things you can do with a typical jQuery object.

> **In case you didn't know it:** In jQuery, calling `$("<element>")` will create a new full DOM `<element>` wrapped into a jQuery object. 

Now, in order to use that simple component from another one, all we need to do is import and call it.

```javascript
// Counter.js 
(function ($, exports){
    // Here we import our button.
    const { Button } = exports;
    
    function Counter(props){
        // Here we render our control.
        return $("<div>").append(
            "Count: ",
            Button().text("Add")
        );
    }
    exports.Counter = Counter;
})(jQuery, window);
```

In this case, we created a new `<div>` and appended a text node "Count: " followed by our fancy button which text says "Add". The resulting markup would be something like:

```html
<div>
    Count: <button>Add</button>
</div>
```

Finally, in order to make it actually render on the screen, we need to append our counter to the page on load:

```javascript
// App.js 
(function ($, exports){
    // Here we import our Counter.
    const { Counter } = exports;
    
    // On document ready, render it.
    $(function (){
        // Render the component as an `<div id="app"></div>` child.
        $("#app").append(Counter());
    });
})(jQuery, window);
```

### Wrap up so far

By now, our experiment should look something like this:

- js/
    - Button.js
    - Counter.js
    - App.js
- index.html

Our index.html should look like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Componentized JQuery</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" />
</head>
<body>

<div id="app"></div>

<script type="application/javascript" src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script type="application/javascript" src="/js/Button.js"></script>
<script type="application/javascript" src="/js/Counter.js"></script>
<script type="application/javascript" src="/js/App.js"></script>
</body>
</html>
```

## 3. I want some State!

Just displaying things on screen is not enough, we need action, we need change. This is where stateful components come in play.

Since we don't have the full control over the DOM during rendering, we can't do the fancy stuff we see in actual React, that is, the shadow DOM.

Another thing we want to do is to preserve as much as possible the pure function convention we have established for our components. That means we don't want to "fallback" into class components.

What can we do then? Well, we can make a **higher order function**. That is, a function that takes our simple component and equips it with all the necessary tools to handle state and call itself when state changes.

The general idea of the function would look like this:

```javascript
// Cjq.js -- CJQ stands for Componentized jQuery
(function ($, exports){
    function withState(Component){
        // Transform the component into a stateful component and return it.
    }
    exports.withState = withState;
})(jQuery, window);
```

Then our stateful component would look like this:

```javascript
// Counter.js 
(function ($, exports){
    const { 
        Button, 
        withState //<-- Note we're now also importing the new higher order function. 
    } = exports;
    
    function Counter(props){

        return $("<div>").append(
            "Count: ",
            Button().text("Add")
        );
    }
    exports.Counter = withState(Counter); //<-- Here we transform our component into a stateful component. 
})(jQuery, window);
```

### 3.1 Defining the workflow

In order to manage state, the best option I know so far is using classes. For that reason we're going to define a 'class' that will hold the state and react to its changes by calling our component when necessary.

```javascript
// Cjq.js 
(function ($, exports){
    // Let's define our stateful component class:
    function StatefulComponent(props, render) {
        // Here we hold our state.
        let state = [];

        this.doRender = () => {
           // Here we call the `render` function (our component) and return the results.
        }
    }

    function withState(Component){
        // Now we're returning a render function capable of handling state.
        return function (props){
            return new StatefulComponent(props, Component).doRender();
        };
    }
    exports.withState = withState;
})(jQuery, window);
```



### 3.2 Use.state 

### 3.3 Watch out the inputs!  

### 3.4 Use.reducer

### 3.5 Use.effect

## 4. Child state preservation

