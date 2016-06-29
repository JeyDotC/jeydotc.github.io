---
layout: post
title:  "Recursive functions with Freddy Krueger"
date:   2016-06-28
categories: Blog
---

Today while preparing for myself a lemonade, I though: how would I explain recursive functions? I found out that I can't think of an analogy or metaphor or whatever thing in reality to explain such a weird concept. So the question transformed into:  What kind of abstract thing exists that everybody knows and allows one to create rules that, being absurd, can be accepted easily by most people? that is, dreams!

Or more exactly, nightmares. So, we can think of a recursive function with this story:

## A Freddy Krueger nightmare

One day you fall asleep and suddenly you appear trapped on a chair. Then enters Freddy Krueger in scene with his evil claws, laughing at you and, when you are really, really, scared, he just makes you a scratch. Yup, a little scratch on your belly, it hurts, but, it wont kill you.

Fred realizes that you are not dead so he puts you some anesthesia and you fall asleep. Then you appear in the exact same room, sat down on the exact same chair, the only difference is that little scratch on your belly. Freddy enters, doing exactly de same things as before, scratching you with the same strength in the same place. Your injuries are now deeper, but they still far from killing you, so Mr Krueger decides to put you the anesthesia again, and you fall asleep, straight to another nested dream.

The process repeats once and again and again, nested dream after nested dream, the only thing that changes is you, whose injures get deeper and deeper until you are cut-half (or whenever such a repetitive action kills you). 

Then Fred sees that you have passed away, "yay! my job is finished" says and then the dream collapses, and then, the dream that contained it, and the another, and the another until we get to the first layer of nested dreams and, finally, to reality.

## But, what has that story to do with recursive functions?

Let's illustrate this with a simple example:

Say we have an array like this `[ 1, 2, 3, 4, 5, 6, 7, 8, 9]`. We need to find a given number and we decided that a recursive function is the way to do it.

So, we have this:

```javascript
function MyFunction(array, numberToLookFor, currentIndex = 0){
    if(array[currentIndex] == numberToLookFor)
        return array[currentIndex];
    else{
       currentIndex++;
       MyFunction(array, numberToLookFor, currentIndex);
    } 
}
```

> **Note:** For simplicity of code we are assuming that `numberToLookFor` is always present in the array.

Let's call our function and see the events under the light of the story:

| Function | Story       |
|----------|-------------|
| `MyFunction(array, 3)` | You fall asleep. |
| `currentIndex++`       | Freddy scratches you. |
| `if(array[currentIndex] == numberToLookFor)` | Fred checks if you are dead. | 
| `MyFunction(array, numberToLookFor, currentIndex);` | Puts you anesthesia and you fall in a nested dream. |
| `return array[currentIndex];` | You are officially dead, so we are done. |

As you can see, here are the usual elements of a recursive function:

| Element | Definition | Story | Code
|---------|------------|-------|-------
| **A stop condition** | Something that finishes the function | "You are dead" | "We found the number"
| **A state** | Something that changes by each call | "Your injuries" | "The current index"
| **A state changer** | An action that changes the conditions | "Fred scratches you" | "Add one to the current index"
| **A recursive call** | A call to the function | "Fred puts you anesthesia" | "The function calls himself"

## Some things to consider

* The **stop condition** is not guaranteed to be reached (e.g. the number is not present or you are Wolverine). Take this into account to avoid index out of range or stack overflow exceptions or an endless story if that is not your intention. Just add a second check where: if the stop condition is not met and invoking the function would cause an error or is an stupid idea, stop or throw an error (e.g. Fred realizes that this guy is Wolverine and then leave       s him alone or the number is not present in the array and the function throws an `ObjectNotFoundException`)
* Each nested function call stays alive as long as the one they are calling haven't finished its task. This may be a problem if the recursion is too deep, or the **state changer** takes a long time to be executed. So, be sure that your recursive function is short and cheap. Or go to the *async* world, which I will not cover in this article.
* The above mentioned issue will cause a memory leak if each function call generates new information which lifespan goes beyond the inner call. That is, just imagine each time Fred enters the room there is a new trash bag, and that bag can only be removed when the inner dream ends, the room will soon be totally filled with garbage! So the advice here is, dont't generate new instances of objects (especially if they are heavy) unless you can ensure they will not be present after the recursive call.
```javascript
function MyFunction(array, numberToLookFor, currentIndex = 0){
    //....
        //Avoid this whenever possible as its life goes behod the inner function call!
        var something = ....;

        //Better do something like this:
        if(true){
            let something = ....;
        } 
        //Or this if it is available
        let(something = ...){
            ...
        }
        //Or just
        var something = ...;
        //do your thing with the variable....
        //and then set it to null
        something = null;

       currentIndex++;
       MyFunction(array, numberToLookFor, currentIndex);
    //.... 
}
```

## Conclusion

This was an attempt to explain recursiveness in a way that may be easier to understand, just remember, recursiveness is like a dream that sends you into the same dream and and does it again until some condition is met. I hope this post have helped you to have an understanding of recursive functions, feel free to *disqus* in the comments below, thanks for reading.

P.D.: This would be a little more complete version of the function:

 ```javascript
function MyFunction(array, numberToLookFor, currentIndex = 0){
    if(currentIndex > array.length)
        throw "Number not found!";

    if(array[currentIndex] == numberToLookFor)
        return array[currentIndex];
    else{
       currentIndex++;
       MyFunction(array, numberToLookFor, currentIndex);
    } 
}
```

