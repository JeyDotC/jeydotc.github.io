---
layout: post
title:  "PHP Traits for interface contract testing"
date:   2019-03-25
categories: Blog
---

Interfaces, those neat artifacts created to represent contracts to be fulfilled by classes. When appropriately used, they're a very powerful way to express the expectations a client class has on implementations. Yet, most languages lack of tools to express those aspects you can't see by looking at the method signatures.

What should a method return under certain circumstances? If condition X is met, should it throw an exception? If so, of what type? All those questions can be answered by writing good documentation, that's true, but, what about enforcing those rules? And who writes good docs in a world where working code is more important than documented code? That's where the documenting facet of unit tests come in handy.

```php
interface IPacman {
    public function eatCookie(string $cookie): IPacman;

    public function getCookies(): array;
}

class ArrayPacman implements IPacman {
    private $stomach = [];
    
    public function eatCookie(string $name): IPacman {
        $this->stomach[] = $name;
        return $this;
    }

    public function getCookies(): array {
        return $this->stomach;
    }
}

class ArrayPacmanTest extends TestCase {
    public function testEatCookie(){
        // Arrange
        $pacman = new ArrayPacman();
        
        // Act
        $result = $pacman->eatCookie('John');

        // Assert
        $this->assertOftype(IPacman, $result);
        $this->assertEquals([ 'John' ], $result->getCookies());
    }

    public function testGetCookies(){
        // Arrange
        $pacman = new ArrayPacman();
        $result = $pacman
                        ->eatCookie('John')
                        ->eatCookie('Jane')
                        ->eatCookie('Jim');
        
        // Act
        $eatenCookies = $result->getCookies();

        // Assert
        $this->assertEquals([ 'John', 'Jane', 'Jim' ], $eatenCookies);
    }
}
```

So far, so good, we have successfully documented what we expect from the `IPacman` interface. We expect their implementations to do something with the string we give to them and we want the result of that returned. But, there are two questions that will circle around in the stomach of the person who wrote the Unit test:

* How many times will I have to repeat this code? (a.k.a. how many implementations of this interface will we create?)
* If the non-explicit rules (exceptions, invariants) change, at how many places will I have to reflect that change?

And this will be his face:

![Oh boy!](https://i.kym-cdn.com/photos/images/original/000/140/966/3332f6ef40a0ae9dd34d6d5eaa7e7524656a1f77.png)

## Enter the Traits

In PHP, since version 5.4.0, we have these artifacts called **traits**, which basically inject variables and methods into a class, making them actually **part of the class**.

That allows all sort of neat tricks like, giving a base interface implementation without making the inheritance tree deeper or having some common algorithms in a single place.

But, what does this have to do with unit tests? well, lets get started by adding a new implementation of our `IPacman` interface:

```php
interface IPacman {
    public function eatCookie(string $cookie): IPacman;

    public function getCookies(): array;
}

class ArrayPacman implements IPacman {
    private $stomach = [];
    
    public function eatCookie(string $name): IPacman {
        $this->stomach[] = $name;
        return $this;
    }

    public function getCookies(): array {
        return $this->stomach;
    }
}

class FancyCollectionPacman implements IPacman {
    private $belly;

    public function __construct(){
        $this->belly = new SomeFancyCollectionClass();
    }
    
    public function eatCookie(string $name): IPacman {
        $this->belly->add($name);
        return $this;
    }

    public function getCookies(): array {
        return $this->belly->toArray();
    }
}
```

Now, if we follow the usual practices on unit testing, we would have to create the corresponding tests for the new class:

```php
class ArrayPacmanTest extends TestCase {
    public function testEatCookie(){
        // Arrange
        $pacman = new ArrayPacman();
        
        // Act
        $result = $pacman->eatCookie('John');

        // Assert
        $this->assertOftype(IPacman, $result);
        $this->assertEquals([ 'John' ], $result->getCookies());
    }

    public function testGetCookies(){
        // Arrange
        $pacman = new ArrayPacman();
        $result = $pacman
                        ->eatCookie('John')
                        ->eatCookie('Jane')
                        ->eatCookie('Jim');
        
        // Act
        $eatenCookies = $result->getCookies();

        // Assert
        $this->assertEquals([ 'John', 'Jane', 'Jim' ], $eatenCookies);
    }
}

class FancyCollectionPacmanTest extends TestCase {
    public function testEatCookie(){
        // Arrange
        $pacman = new FancyCollectionPacman();
        
        // Act
        $result = $pacman->eatCookie('John');

        // Assert
        $this->assertOftype(IPacman, $result);
        $this->assertEquals([ 'John' ], $result->getCookies());
    }

    public function testGetCookies(){
        // Arrange
        $pacman = new FancyCollectionPacman();
        $result = $pacman
                        ->eatCookie('John')
                        ->eatCookie('Jane')
                        ->eatCookie('Jim');
        
        // Act
        $eatenCookies = $result->getCookies();

        // Assert
        $this->assertEquals([ 'John', 'Jane', 'Jim' ], $eatenCookies);
    }
}
```

Mmm, that didn't require much effort, just copy, paste, and change a few things here and there, but, now think of this: What if that interface had 3 methods, or 6, or 36? and what if the cases for each method were 8, or 32? Every new implementation would be a really boring task if we wanted to have them tested.

So, let's try moving all repeated stuff into a trait:

```php
trait IPacmanContractTrait {

    public function testEatCookie(){
        // Arrange
        $pacman = $this->createPacman();
        
        // Act
        $result = $pacman->eatCookie('John');

        // Assert
        $this->assertOftype(IPacman, $result);
        $this->assertEquals([ 'John' ], $result->getCookies());
    }

    public function testGetCookies(){
        // Arrange
        $pacman = $this->createPacman();
        $result = $pacman
                        ->eatCookie('John')
                        ->eatCookie('Jane')
                        ->eatCookie('Jim');
        
        // Act
        $eatenCookies = $result->getCookies();

        // Assert
        $this->assertEquals([ 'John', 'Jane', 'Jim' ], $eatenCookies);
    }

    protected abstract function createPacman(): IPacman;    
}
```

That pretty much covers all possible implementations of `IPacman` interface. All you have to do, is create a new test, use the trait in it and implement the abstract method:

```php
class ArrayPacmanTest extends TestCase {
    use IPacmanContractTrait;

    public function createPacman(){
        return new ArrayPacman();
    }
}

class FancyCollectionPacmanTest extends TestCase {
    use IPacmanContractTrait;

    public function createPacman(){
        return new FancyCollectionPacman();
    }
}

```

The new implementation tests will now worry only about the methods specific to them, like, factory methods, non-default constructors and methods related to other classes and interfaces they might implement. 

Whatever new test case that gets added to the interface methods, will be automatically tested for all implementations without modifying their tests, just adjusting the implementation if it doesn't pass the new assertions.

## The Actual Value of Contract Traits

> Invoking Lishkov, the goddess who embodies the 'L' in the SOLID pantheon!

So far, we can see a good save on repeated code for your unit tests. That's cool! but what makes the most out of this practice, is the fact that you can:

* Document the implicit parts of the interface's contract in your tests.
* Enforce rules on every single interface's implementation under your control.
* Become actually aware of the need of preserving the Lishkov substitution principle.

Let's dig further in the above points:

### Documenting the Implicit Stuff

Let's continue with our Pacman example. Our interface has an `eatCookie()` method, and for every implementation there's a test that will check that it actually works. Great, but a few weeks after the first release of our Pacman software, we got buried into an avalanche of "Hey, I see empty and nully cookies out there! I don't like them, I want my cookies pretty and tasty!". And that's because we forgot to enforce a rule of not allowing null or empty cookies in our `IPacman` implementations!

So, what can we do then, well, we could fix all implementations to throw in case of null/empty (a.k.a. falsy) cookies:

