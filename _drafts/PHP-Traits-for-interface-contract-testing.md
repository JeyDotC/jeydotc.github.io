---
layout: post
title:  "PHP Traits for interface contract testing"
date:   2019-03-25
categories: Blog
---

Interfaces, those neat artifacts created to represent contracts to be fulfilled by classes. When appropriately used, they're a very powerful way to express the expectations a client class has on implementations. Yet, most languages lack of tools to express those aspects you can't see by looking at the method signatures.

What should a method return under certain circumstances? If condition X is met, should it throw an exception? If so, of what type? All those questions can be answered by writing good documentation, that's true, but, what about enforcing those rules? And who writes good docs at all? That's where the documenting facet of unit tests come in handy.

``` php
interface IDoSomething {
    public function doSomething(string $name): string;
}

class SayHello implements IDoSomething {
    public function doSomething(string $name): string {
        return "Hello, $name";
    }
}

class SayHelloTest extends TestCase {
    public function testDoSomething(){
        // Arrange
        $somethingDoer = new SayHello();
        
        // Act
        $result = $somethingDoer->doSomething('John');

        // Assert
        $this->assertEquals('Hello, John', $result);
    }
}
```

So far, so good, we have successfully documented what we expect from the `IDoSomething` interface. We expect their implementations to do something with the string we give to them and we want the result of that returned.
 but, there are two questions that will circle around in the stomach of the person who wrote the Unit test:

* How many times will I have to repeat the code for the tests?
* If the non-explicit rules (exceptions, invariants) change, at how many places will I have to reflect that change?

And this will be his face:

![Oh boy!](https://i.kym-cdn.com/photos/images/original/000/140/966/3332f6ef40a0ae9dd34d6d5eaa7e7524656a1f77.png)

``` php
interface IDoSomething {
    public function doSomething(string $name): string;
}

class SayHello implements IDoSomething {
    public function doSomething(string $name): string {
        return "Hello, $name";
    }
}

class SayWhatsup implements IDoSomething {
    public function doSomething(string $name): string {
        return "What's up, $name?";
    }
}

trait IDoSomethingContractTrait {

    /**
    * @dataProvider doSomethingProvider
    */
    public function testDoSomething(IDoSomething $instance, $input, $expectedResult){ 
        // Act
        $result = $somethingDoer->doSomething($input);

        // Assert
        $this->assertEquals($expectedResult, $result);
    }

    public function doSomethingProvider() {
        return [ 
            'SomeBasicCase' => [
                $this->createDoer(),
                'John',
                $this->whenSomeBasicCase()
            ]
        ];
    }

    protected abstract function createDoer(): IDoSomething;    
    protected abstract function whenSomeBasicCase(): string;    
}

class SayHelloTest extends TestCase {
    use IDoSomethingContractTrait;

    public function createDoer(){
        return new SayHello();
    }

    public function whenSomeBasicCase() {
        return 'Hello, John';
    }
}

class SayWhatsupTest extends TestCase {
    use IDoSomethingContractTrait;

    public function createDoer(){
        return new SayHello();
    }

    public function whenSomeBasicCase() {
        return 'What's up, John?';
    }
}

```

``` php
trait IDoSomethingContractTrait {

    /**
    * @dataProvider doSomethingProvider
    */
    public function testDoSomething(IDoSomething $instance, $input, $expectedResult){ 
        // Act
        $result = $somethingDoer->doSomething($input);

        // Assert
        $this->assertEquals($expectedResult, $result);
    }

    /**
    * @expectedException NameShouldNotBeNullException
    */
    public function testDoSomethingRejectNullValues(){
        // Arrange
        $instance = $this->createDoer();
        
        // Act
        $instance->doSomething(null);
    }

    public function doSomethingProvider() {
        return [ 
            'SomeBasicCase' => [
                $this->createDoer(),
                'John',
                $this->whenSomeBasicCase()
            ]
        ];
    }

    protected abstract function createDoer(): IDoSomething;    
    protected abstract function whenSomeBasicCase(): string;    
}
```

``` php
class SayHello implements IDoSomething {
    public function doSomething(string $name): string {
        if($name == null){
            throw new NameShouldNotBeNullException();
        }
        return "Hello, $name";
    }
}

class SayWhatsup implements IDoSomething {
    public function doSomething(string $name): string {
        if($name == null){
            throw new NameShouldNotBeNullException();
        }
        return "What's up, $name?";
    }
}
``` 

``` php
trait DoSomethingBasicImplementation {
    protected abstract function actuallyDoSomething(string $name): string;

    public function doSomething(string $name): string {
        if($name == null){
            throw new NameShouldNotBeNullException();
        }
        return $this->actuallyDoSomething();
    }
}

class SayHello implements IDoSomething {
    use DoSomethingBasicImplementation;

    public function actuallyDoSomething(string $name): string {
        return "Hello, $name";
    }
}

class SayWhatsup implements IDoSomething {
    use DoSomethingBasicImplementation;

    public function actuallyDoSomething(string $name): string {
        return "What's up, $name?";
    }
}
``` 