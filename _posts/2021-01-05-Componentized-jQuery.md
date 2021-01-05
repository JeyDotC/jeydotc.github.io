---
layout: post
title:  "COMPONENTIZED JQUERY"
date:   2021-01-05
categories: Blog, JavaScript, jQuery, React
---

## What is this?

Well, working with jQuery solely can be very, very messy, the code can be quite difficult to follow, specially when it grows a lot.

What I'm going to expose here is a series of practices and, some code that will allow you to emulate React hooks workflow without requiring any library other than jQuery.

> **Important Notice:** This is not IE11 friendly at all, it uses lots of modern JavaScript! 

## But, why?

For the same reason Doom runs on pregnancy tests, because we can! Also, because I hope someone finds this useful, specially if trapped/attached to jQuery.

## Let's get started

Let's create our componentized jQuery thing.

> If you just want to read the whole code and see it in action, you can just go to this jsFiddle: https://jsfiddle.net/jeyssonguevara/8bxeoua7/23/

The first thing we want to do is create a simple html file with the basic stuff:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Componentized JQuery</title>
</head>
<body>

<div id="app"></div>

<script type="application/javascript" src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
</body>
</html>
```

There we just load jQuery, that's all the external stuff we need. Also, notice the `<div id="app"></div>` element which is all the markup we need to mount our app.

Then, we'll need to follow the these 4 steps:

## 1. No modules? Don't worry

The first thing we do in any react application is to declare and load modules with the `export` and `import` keywords, but we're not bundling or compiling this or even using amd, so, what do we have left? Well, the classic [Immediately Invoked Function Expressions!](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)

```javascript
(function ($, exports){

})(jQuery, window);
```

Notice that the declared function will receive two values: jQuery, which will be re-baptized as '$', and the global window object which will be known as 'exports'.

### 1.1 Let's export something

Now we can create a module that does something and exports it:

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

### 1.2 Let's import it

Now, with our module declared, we can import it from somewhere else:

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

Since we want to mimic the React hooks, we'll just define our functions as such, except that we don't have the markup thing that will be compiled into react createElement calls. Instead, we'll just return a jQuery element.

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

Ok, now we have a skeleton of the state management system. The way it works will be as follows:

1. Transform your component into a stateful one by calling `withState`.
2. Import your component.
3. Call it. This will be the very first render for the component, so, at this moment, we will create a new `StatefulComponent` instance and immediately call `doRender()`. Note that you will never have direct access to the state class, you will receive a jQuery object as a result.
4. Detect a state change, if the state changes (by any of the means we're going to provide in the next sections), we call `doRender()` again. Note that we're not calling the full thing that instantiates the `StatefulComponent` class, we call the `doRender()` on an already existing instance, such instance will have access to the current state.

The above list might look confusing at first, but it will be clearer once we implement our first state management tool: The `use.state` hook.

### 3.2 Use.state 

The first thing we'd like to mimic is the React's `useState` hook. Just to give you an idea, this is what a component using it would typically look like in React:

```jsx
// Our Counter component if made in React:
function Counter(props){
    const [count, setCount] = useState(0);
    
    return (<div>Count: {count} <button onClick={()=> setCount(count + 1)}>Add</button></div>);
}
```

In the above snipped you can see three key parts of the state lifecycle:

1. `const [count, setCount] = useState(0);`: Here we retrieve the current count state if exists or initialize it if it doesn't. 
2. The `count` variable is just the current value and the `setCount` is a callback to notify a state change.
3. When we handle the `onClick` event, we notify that state has changed and that we need to re-render this component.

There are two things that will differ in our experiment from React, and both are caused by the same reason: we're not transpiling anything.

The first thing different from react will be the `useState` function. In React, that call will be transformed to something like `__currentContext__.useState(0);`. But since we don't have such a tool, we'll need to find another way, in this case, we'll just receive the context as an object in our component. Don't worry about the change in the function's signature, because it won't be called directly by the user, but by the `StatefulComponent` class.

The second thing is, obviously, the fact that we won't have the fancy jsx feature, so, we'll be returning jQuery objects instead, as explained in section 2.

So, this is what our version of Counter will look like:

```javascript
// Counter.js 
(function ($, exports){
    const { 
        Button, 
        withState 
    } = exports;
    
    function Counter(props, use){
        const [count, setCount] = use.state(0); //<-- As in React, retrieve the current state if exists, initialize if it doesn't.

        return $("<div>").append(
            "Count: ", count, //<-- Let's render the current value.
            Button().text("Add").on('click', () => setCount(count + 1)) //<-- Notify of state change.
        );
    }
    exports.Counter = withState(Counter); 
})(jQuery, window);
```

As you can see, they look very similar (except for the two differences stated above). The best of all, you don't need to do any change in the other files, you are still able to call the Counter component as `Counter()` and all the stateful stuff will happen internally.

#### 3.2.1 Implementation Time!

We know what we want, it's time to implement it. We'll need to deal with these three lifecycle events:

1. **The first call:** in this part we will initialize the state for the first time and provide the underlying component with the tools to notify of a state change. This happens when instantiating the `StatefulComponent` object.
2. **Handle the state change:** In this case we update the state and schedule a re-render. This happens whenever the provided setXXX state gets invoked.
3. **The re-render:** At this point we will call the component's render function and make sure the changes get reflected into the DOM. This happens (hopefully) at the end of the event loop cycle, and only if the state has changed.

Here's the implementation:

```javascript
// Cjq.js 
(function ($, exports){
    
    function StatefulComponent(props, render) {
        let state = []; //<-- Here we hold our state.
        let statesCount = 0; //<-- Since the use.state can be called multiple times in a single render, we need to keep track on what specific moment is it being called in order to return the correct state value and callback.

        let needsReRender = false; //<-- Do we need to render the component at the end of the event loop? 
        let $currentElement = undefined; //<-- This is the current element. If it is undefined, that means we're rendering for the first time.

        const scheduleRender = () => {
            if (!needsReRender) {
                needsReRender = true;
                setTimeout(() => this.doRender(), 0);
            }
        }; //<-- This function makes sure we call the render only when needed, after all the setState for this component have been invoked.

        // This is the handle we send to the component in order to provide context when rendering.
        const use = {
            state: (initial) => {
                const currentIndex = statesCount; //<-- Here we determine on which state call we are, first, second, nth...

                if (!$currentElement) {
                    state.push(initial);
                } //<-- If this is the first render, we just push the value into the state list.

                statesCount++;

                return [
                    state[currentIndex], //<-- This is the current state. 
                    (newValue) => {
                        state[currentIndex] = newValue; //<-- Update the state value.
                        scheduleRender(); //<-- Notify state changed.
                    }
                ]; //<-- Here we are returning the current state and a function that will update the value and schedule a reRender.
            }
        };

        this.doRender = () => {
           needsReRender = false; //<-- Make sure future state changes will work even if this render fails.

           statesCount = 0; //<-- Reset the states count so the 'use' object works correctly.

           const $resultingElement = render(props || {}, use); //<-- Render the component. Notice that we send the 'use' object as the second parameter.

           if ($currentElement) {
               $currentElement.replaceWith($resultingElement);
           } //<-- If this isn't the first render, we make sure to replace the previous incarnation of this component, so it will draw in the right place.

           $currentElement = $resultingElement; //<-- Update the current element.

           return $currentElement; //<-- Return the result.
        }
    }

    function withState(Component){
        
        return function (props){
            return new StatefulComponent(props, Component).doRender();
        };
    }
    exports.withState = withState;
})(jQuery, window);
```

With this implementation, you can create a component which can hold a state, actually, multiple state values, just as in actual react:

```javascript
// Counter.js 
(function ($, exports){
    const { 
        Button, 
        withState 
    } = exports;
    
    function Counter(props, use){
        const [count, setCount] = use.state(0); 
        const [isOdd, setIsOdd] = use.state(false); //<-- You can hold as many states as needed.

        return $("<div>").append(
            "Count: ", count,
            isOdd ? " is Odd" : " is even",
            Button().text("Add").on('click', () => {
                setCount(count + 1);
                setIsOdd(count % 2 !== 0); //<-- You can issue as many state changes as needed, but there will be only one render call at the end of this event loop.
            })
        );
    }
    exports.Counter = withState(Counter); 
})(jQuery, window);
```

This `use.state` implementation has some rules similar to React's `useState` to avoid unpredictable behaviors:

1. The `use.state` calls should be as close to the function's beginning as possible.
2. Do not put `use.state` calls under conditions or loops.

> Curiously enough, you can skip rule number 2. But **only** if it's under a loop on a collection that will NEVER change, though, for the sake of clarity, just DON'T. 

### 3.3 Use.val

We tend to underestimate the complexity of input fields, but man, they bring lots of complications, from their increased update frequency to the focus/blur logic.

We can't use `use.state` on inputs on this experiment because any render will make the input lose focus, thus, making typing on it impossible. We could tell the `setValue` function to not schedule a render when we update the input, but then, since we don't call the render function, the state value we have will be outdated.

That's where `use.val` come in handy. This hook works like `use.state`, but, instead of returning a value and its setter, it returns two functions: a getter which will return the latest version of the current state, and a setter that will update the state, but won't schedule a render unless you explicitly tell it to.

Let's see an example usage:

```javascript
// Counter.js 
(function ($, exports){
    const { 
        Button, 
        withState 
    } = exports;
    
    function Counter(props, use){
        const [getMultiplier, setMultiplier] = use.val(0); //<-- This is a state associated to our input.
        const [count, setCount] = use.state(0); 
        const [isOdd, setIsOdd] = use.state(false);

        return $("<div>").append(
            $("<input>").attr({ type: 'number', placeholder: 'Multiply count by' })  //<-- Here's a number input.
                .val(getMultiplier()) //<-- Here we set its value using the setter returned by the hook. This is guaranteed to be the latest version.
                .on('keyup', e => setMultiplier(e.target.value)) //<-- This updates the state without scheduling a render.
                .on('change', e => setMultiplier(e.target.value, { shouldRender: true })), //<-- This is called only when the input loses focus, so we can safely schedule a render here. 
            "Count: ", count,
            "Value: ", count * getMultiplier(), //<-- Here we're guaranteed that we have access to the latest multiplier value.
            isOdd ? " is Odd" : " is even",
            Button().text("Add").on('click', () => {
                setCount(count + 1);
                setIsOdd(count % 2 !== 0);
            })
        );
    }
    exports.Counter = withState(Counter); 
})(jQuery, window);
```

#### 3.3.1 Implementation Time!

Now that we know what we want, let's modify our state management thing to reflect that:

```javascript
// Cjq.js 
(function ($, exports){
    
    function StatefulComponent(props, render) {
        let state = [];
        let statesCount = 0;

        let needsReRender = false; 
        let $currentElement = undefined;

        const scheduleRender = () => {
            if (!needsReRender) {
                needsReRender = true;
                setTimeout(() => this.doRender(), 0);
            }
        };

        // This is the handle we send to the component in order to provide context when rendering.
        const use = {
            state: (initial) => { 
                const currentIndex = statesCount; 

                if (!$currentElement) {
                    state.push(initial);
                }

                statesCount++;

                return [
                    state[currentIndex], 
                    (newValue, { shouldRender = true} = {}) => { //<-- First off: Let's receive an options parameter that allows us to skip the rendering scheduling if necessary.
                        state[currentIndex] = newValue;
                        shouldRender && scheduleRender(); //<-- Schedule a render if shouldRender is true.
                    },
                    currentIndex //<-- Let's return the index, this will be useful, not only on val(), but also when implementing use.effect.
                ];
            },
            val: (initial) => { //<-- This is our new hook, it looks just like state, but the returned values are different.
                const [, setValue, valueIndex] = use.state(initial); //<-- Here we get the setter and the index we added in the previous method. We're ignoring the current value in this case.
                return [
                    () => state[valueIndex], //<-- This is the getter, it will directly take the value from state.
                    (value, {shouldRender = false} = {}) => setValue(value, {shouldRender}) //<-- This is the setter, will do exactly the same as use.state,
                                                                                            //    just that it will set the shouldRender option to false by default.
                ];
            },
        };

        this.doRender = () => {
           needsReRender = false;

           statesCount = 0;

           const $resultingElement = render(props || {}, use);

           if ($currentElement) {
               $currentElement.replaceWith($resultingElement);
           }

           $currentElement = $resultingElement;

           return $currentElement;
        }
    }

    function withState(Component){
        
        return function (props){
            return new StatefulComponent(props, Component).doRender();
        };
    }
    exports.withState = withState;
})(jQuery, window);
```

Now we can have an input and only redraw if the control loses focus, all that without losing the state info.

All that comes with a limitation, though: You cannot update components while typing :(. Sad, but, for now, unavoidable, or at least you'd have to fallback to old-school jQuery code.

> **Before we continue:** So far, we've added just enough stuff to do a viable component. But that component will destroy the state of its children on every re-draw. For now, you could make all children stateless and have only one source of truth.
> 
> Such limitation could complicate things a lot. Don't worry, in section 4, we'll cover the Child state preservation topic :)   

### 3.4 Use.reducer

The `useReducer` hook in react is another powerful tool aiming to deal with complex state objects among other things. For now, we'll just cover the most basic use case scenario, managing complex state objects.

In order to explain our reducer implementation, let's take a look at a typical React useReducer example:

```jsx
// This function is in charge of altering the general state.
function reducer(state, action) { //<-- The state parameter is the current state, and the action is an object which tell us how do we want to alter it.
   // The general convention for action is to have this structure: { type: 'the-action-we-want-to-do', payload: {/* extra parameters if needed */} }
   // Off course this is just a convention and action can have whatever structure you want.
  switch (action.type) {
    case 'increment': //<-- Here we check what action we want to perform.
      return {count: state.count + 1}; //<-- And return the new state.
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, {count: 0}); //<-- Here we get the current state or initialize it if it doesn't exist already.
  return (
    <>
      Count: {state.count} <!-- Notice that state is a complex object, so we need to access its properties. --> 
      <button onClick={() => dispatch({type: 'decrement'})}>-</button> <!-- Here we request to alter the state and potentially re-draw -->
      <button onClick={() => dispatch({type: 'increment'})}>+</button> <!-- Here we request to alter the state and potentially re-draw -->
    </>
  );
}
``` 

UseReducer is not that different from useState, just a variant to deal with complex objects instead of (ideally) simple scalar values.

#### 3.4.1 Implementation time!

Actually, the implementation is quite simpler than that of use.state:

```javascript
// Cjq.js 
(function ($, exports){
    
    function StatefulComponent(props, render) {
        let state = [];
        let statesCount = 0;

        const reducibleState = { //<-- Let's hold our reduce state separated from the other one.
            isNew: true,
            data: undefined, //<-- This is the actual state data
            init: (initial) => {
                if (this.isNew) { //<-- We only initialize the state during the first render.
                    this.data = initial;
                    this.isNew = false;
                }
            }
        };

        let needsReRender = false; 
        let $currentElement = undefined;


        const scheduleRender = () => {
            if (!needsReRender) {
                needsReRender = true;
                setTimeout(() => this.doRender(), 0);
            }
        };

        // This is the handle we send to the component in order to provide context when rendering.
        const use = {
            state: (initial) => { 
                const currentIndex = statesCount; 

                if (!$currentElement) {
                    state.push(initial);
                }

                statesCount++;

                return [
                    state[currentIndex], 
                    (newValue, { shouldRender = true} = {}) => {
                        state[currentIndex] = newValue;
                        shouldRender && scheduleRender();
                    },
                    currentIndex
                ];
            },
            val: (initial) => {
                const [, setValue, valueIndex] = use.state(initial);
                return [
                    () => state[valueIndex],
                    (value, {shouldRender = false} = {}) => setValue(value, {shouldRender})
                ];
            },
            reducer: (reducer, initial) => {
                reducibleState.init(initial); //<-- Initialize the state if it isn't already initialized.

                return [
                    reducibleState.data, //<-- Return the current state. 
                    dispatchData => {
                        const newData = reducer(reducibleState.data, dispatchData); //<-- Allow the reducer alter the state.
                        reducibleState.data = newData; //<-- Update the data.
                        scheduleRender(); //<-- Notify state changed.
                    } //<-- This is the dispatcher, it just calls the reducer providing the current state and the dispatchData (the action).
                ];
            },
        };

        this.doRender = () => {
           needsReRender = false;

           statesCount = 0;

           const $resultingElement = render(props || {}, use);

           if ($currentElement) {
               $currentElement.replaceWith($resultingElement);
           }

           $currentElement = $resultingElement;

           return $currentElement;
        }
    }

    function withState(Component){
        
        return function (props){
            return new StatefulComponent(props, Component).doRender();
        };
    }
    exports.withState = withState;
})(jQuery, window);
``` 

With this implementation, we can now implement our simple counter like this:

```javascript
// Counter.js 
(function ($, exports){
    const { 
        Button, 
        withState 
    } = exports;

    function reducer(state, action) { //<-- The state parameter is the current state, and the action is an object which tell us how do we want to alter it.
      switch (action.type) {
        case 'increment':
          return {count: state.count + 1};
        case 'decrement':
          return {count: state.count - 1};
        default:
          throw new Error();
      }
    }
    
    function Counter(props, use){
        const [state, dispatch] = use.reducer(reducer, {count: 0}); //<-- Here we get the current state or initialize it if it doesn't exist already.

        return $("<div>").append(
            "Count: ", count, //<-- Let's render the current value.
            Button().text("Add").on('click', () => dispatch({type: 'increment'})), //<-- Notify of state change.
            Button().text("Substract").on('click', () => dispatch({type: 'decrement'})) //<-- Notify of state change.
        );
    }
    exports.Counter = withState(Counter); 
})(jQuery, window);
```

In this implementation we can only have one reducer. Adding more reducers can be easily done, but, for now I don't see the need.

### 3.5 Use.effect

React's useEffect hook allows invoking functions in specific moments of the component's lifecycle:

```js
// On every render:
useEffect(function (){});

// Only on the first render:
useEffect(function (){}, []);

// Only when stateValue changes:
useEffect(function (){}, [ stateValue ]);
```

When we call `useEffect`, we're telling React to invoke the given function when the dependencies (the second parameter) are met.

The first two forms can be implemented pretty much as they look like in the original React, but the third form requires an important change due to the lack of transpiling on our experiment:

 ```javascript
 // Counter.js 
 (function ($, exports){
     const { 
         Button, 
         withState 
     } = exports;
     
     function Counter(props, use){
         const [count, setCount, countHandle] = use.state(0); //<-- The third returned value is the state index, we added it as part of the use.val implementation, but we can re-use it here.

        // On every render:
        use.effect(function (){
            console.log('Component Rendererd!');
        });
        
        // Only on the first render:
        use.effect(function (){
            console.log('First Component Render!');
        }, []);
        
        // Only when stateValue changes:
        use.effect(function (){
            console.log('Count changed!');
        }, [ countHandle ]); //<-- Here we're declaring a dependency between the given function and the count state value.
 
         return $("<div>").append(
             "Count: ", count,
             Button().text("Add").on('click', () => setCount(count + 1))
         );
     }
     exports.Counter = withState(Counter); 
 })(jQuery, window);
 ```

As you can notice, instead of directly sending the value, we provide a `countHandle` which is just the index of the count value in the state list. We have to do that because we're not transpiling the code, so we can't calculate the dependencies as in React.

#### 3.4.1 Implementation time!

Registering effects is quite simple, most of the magic happens on rendering.

```javascript
// Cjq.js 
(function ($, exports){
    
    function StatefulComponent(props, render) {
        let state = [];
        let statesCount = 0;
        let changedIndexes = []; //<-- An array to keep track of the states that have changed since the last render.
        const effects = []; //<-- Our effect specs.

        const reducibleState = {
            isNew: true,
            data: undefined,
            init: (initial) => {
                if (this.isNew) {
                    this.data = initial;
                    this.isNew = false;
                }
            }
        };

        let needsReRender = false; 
        let $currentElement = undefined;


        const scheduleRender = () => {
            if (!needsReRender) {
                needsReRender = true;
                setTimeout(() => this.doRender(), 0);
            }
        };

        // This is the handle we send to the component in order to provide context when rendering.
        const use = {
            state: (initial) => { 
                const currentIndex = statesCount; 

                if (!$currentElement) {
                    state.push(initial);
                }

                statesCount++;

                return [
                    state[currentIndex], 
                    (newValue, { shouldRender = true} = {}) => {
                        state[currentIndex] = newValue;
                        changedIndexes.push(currentIndex); //<-- Register this state change in the changed indexes.
                        shouldRender && scheduleRender();
                    },
                    currentIndex
                ];
            },
            val: (initial) => {
                const [, setValue, valueIndex] = use.state(initial);
                return [
                    () => state[valueIndex],
                    (value, {shouldRender = false} = {}) => setValue(value, {shouldRender})
                ];
            },
            reducer: (reducer, initial) => {
                reducibleState.init(initial);

                return [
                    reducibleState.data, 
                    dispatchData => {
                        const newData = reducer(reducibleState.data, dispatchData);
                        reducibleState.data = newData;
                        scheduleRender();
                    }
                ];
            },
            effect: (action, dependencies) => (action, dependencies) => {
                if (!$currentElement) {
                  effects.push({ action, dependencies });
                }
            }, //<-- This is the hook, its sole purpose is to register the effects.
        };

        this.doRender = () => {
           needsReRender = false;

           statesCount = 0;

            const firstRender = !$currentElement; //<-- Is this the first render?

           const $resultingElement = render(props || {}, use);

            effects.forEach(effect => {
                const hasDependencies = effect.dependencies !== undefined; //<-- Any dependencies were provided (including an empty array)? 
                const onceEffect = hasDependencies && firstRender && effect.dependencies.length === 0; //<-- If an empty array was given and this is the first render, then we can execute the effect.
                const dependencyChanged = hasDependencies && effect.dependencies.some(index => changedIndexes.some(changed => changed === index)); //<-- If any of the dependencies changed, we can execute this effect.
            
                if (!hasDependencies || onceEffect || dependencyChanged) {
                    effect.action();
                }
            }); //<-- For each registered effect, check if it complies with any of the execution rules, and execute if that's the case.

           changedIndexes = []; //<-- Cleanup the changed indexes.

           if (!firstRender) {
               $currentElement.replaceWith($resultingElement);
           }

           $currentElement = $resultingElement;

           return $currentElement;
        }
    }

    function withState(Component){
        
        return function (props){
            return new StatefulComponent(props, Component).doRender();
        };
    }
    exports.withState = withState;
})(jQuery, window);
``` 

## 4. Child state preservation

Until now, we have created a library that allows us to render UI in a React-like fashion, keeping state of that component. Yet, we have a problem: Any stateful child component will lose its state if the parent component re-renders.

This limits our capability to build complex UIs. Fortunately, we can do some tricks in order to store and recover the state of a child component when the parent re-renders. Since the previous version of the dom still exists until we replace it during rendering, the trick would be to:

1. On every render, store the component's state as some data-attributes in its root element.
2. When instantiating the `StatefulComponent` class, attempt to recover the state if the element already exists.

The challenging part here is locating the previously existing element of step 2. That's because, when a parent component renders, their children get instantiated as in their first render. We have no predictable way to relate a component with a DOM element automatically, you must provide a key in order to locate the existing DOM element if it exists.

### 4.1 Implementation time!

```javascript
// Cjq.js 
(function ($, exports){
    
    function StatefulComponent(props, render) {
        const {key} = props; //<-- We need this key if we want to recover the state.

        key === undefined && console.warn(`At [${render.name}]: Stateful components should have a 'key' prop in order to recover state if the parent component gets re-rendered.`);

        let state = [];
        let statesCount = 0;
        let changedIndexes = [];
        const effects = [];

        const reducibleState = {
            isNew: true,
            data: undefined,
            init: (initial) => {
                if (this.isNew) {
                    this.data = initial;
                    this.isNew = false;
                }
            }
        };

        let needsReRender = false; 
        let $currentElement = undefined;

        const scheduleRender = () => {
            if (!needsReRender) {
                needsReRender = true;
                setTimeout(() => this.doRender(), 0);
            }
        };

        const tryRecoverState = () => {
            if (!key) { //<-- No key? no way to recover the state :(
                return;
            }
            const $recoveredElement = $(`[data-key="${key}"]`); //<-- Get the element by key.
            if ($recoveredElement.length > 0) {
                $currentElement = $recoveredElement; //<-- If the element exists, take it as the current element.
                state = JSON.parse($currentElement.attr('data-state')); //<-- Load the state
                reducibleState.init(JSON.parse($currentElement.attr('data-reducible-state'))); //<-- Load the reducible state (see use.reducer section)
            }
        }; //<-- Here we attempt to load the state from a previously existing element (if it exists).
        
        const saveState = () => {
            if (key) {
                $currentElement.attr('data-key', key);
            }
            return $currentElement.attr({
                'data-state': JSON.stringify(state),
                'data-reducible-state': JSON.stringify(reducibleState.data || {}),
            });
        } //<-- Here we save the state as data-attributes in JSON format.
        
        tryRecoverState(); //<-- The try recover state only makes sense on the "first render"

        // This is the handle we send to the component in order to provide context when rendering.
        const use = {
            state: (initial) => { 
                const currentIndex = statesCount; 

                if (!$currentElement) {
                    state.push(initial);
                }

                statesCount++;

                return [
                    state[currentIndex], 
                    (newValue, { shouldRender = true} = {}) => {
                        state[currentIndex] = newValue;
                        changedIndexes.push(currentIndex);

                         if (shouldRender) { 
                            scheduleRender();
                        } else {
                            saveState(); 
                        }
                    },
                    currentIndex
                ];
            },
            val: (initial) => {
                const [, setValue, valueIndex] = use.state(initial);
                return [
                    () => state[valueIndex],
                    (value, {shouldRender = false} = {}) => setValue(value, {shouldRender})
                ];
            },
            reducer: (reducer, initial) => {
                reducibleState.init(initial);

                return [
                    reducibleState.data, 
                    dispatchData => {
                        const newData = reducer(reducibleState.data, dispatchData);
                        reducibleState.data = newData;
                        scheduleRender();
                    }
                ];
            },
            effect: (action, dependencies) => (action, dependencies) => {
                if (!$currentElement) {
                  effects.push({ action, dependencies });
                }
            },
        };

        this.doRender = () => {
           needsReRender = false;

           statesCount = 0;

            const firstRender = !$currentElement;

           const $resultingElement = render(props || {}, use);

            effects.forEach(effect => {
                const hasDependencies = effect.dependencies !== undefined; 
                const onceEffect = hasDependencies && firstRender && effect.dependencies.length === 0;
                const dependencyChanged = hasDependencies && effect.dependencies.some(index => changedIndexes.some(changed => changed === index));
            
                if (!hasDependencies || onceEffect || dependencyChanged) {
                    effect.action();
                }
            });

           changedIndexes = [];

           if (!firstRender) {
               $currentElement.replaceWith($resultingElement);
           }

           $currentElement = $resultingElement;

           return saveState(); //<-- Whenever we do a render, we save the state.
        }
    }

    function withState(Component){
        
        return function (props){
            return new StatefulComponent(props, Component).doRender();
        };
    }
    exports.withState = withState;
})(jQuery, window);
``` 

With this implementation we can now create a hierarchy of components that will retain their state even if the parent component gets re-rendered. This at the cost of needing a key attribute.

## Conclusion

Working with jQuery this way is (hopefully) an interesting idea, there are plenty of subjects not considered here (performance, async methods, bundling, etc.), but it might be a valid resource for maintaining legacy projects or even the foundation for an alternative to React for people not ready to embrace it (I actually doubt they exist).

As previously mentioned, you can check the full sample [here](https://jsfiddle.net/jeyssonguevara/8bxeoua7/23/).