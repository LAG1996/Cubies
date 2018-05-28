# Cubies: The Polycube Editor

Welcome to the GitHub page for Cubies! 

## What is Cubies?

Cubies is a research tool made to make thinking about [polycube](https://en.wikipedia.org/wiki/Polycube) edge-unfolding easier (check out this short description from [Euclid Lab](http://euclidlab.org/unsolved/349-edge-unfolding-polycubes)). Currently, users can

- build polycubes
- unfold/fold polycubes
- tape faces back together

You can check [Cubies](http://andrewwinslow.com/cubies) out for yourself right now!

## What's *in* Cubies?

Cubies is heavily front-ended, using the following technologies:

 - HTML
 - CSS ([Bootstrap](https://getbootstrap.com/))
 - JavaScript
 - [THREE.JS](https://threejs.org/)

It was made ~~mostly~~ with MVC architecture in mind. This is why there is a literal **Controller** file. We also use some geometric data structures such as the *face dual graph* and *spatial networks* to represent polycubes in data.

## Can I run it locally?

Of course! You just need to be aware of the [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy) most browsers follow. Long story short, most browsers (I used Google Chrome pretty extensively during Cubies' development) will not let you run Cubies without running a local server. The THREE.JS site features some solutions to this problem [here](https://threejs.org/docs/index.html#manual/introduction/How-to-run-things-locally).

Once you've gotten a local server running, it's just a matter of opening`index.html`, found at the first level of the project directory.

## Can I contribute?

Absolutely! There are still some features we're interested in adding to Cubies (and, of course, bugs to squish). In particular, we'd like to add

- undoing and redoing actions
- graphical updates like anti-aliasing
- removing individual faces and cubes from polycubes
- adding support for small screens and mobile
- general bug fixes

And much more! If you've got a change you want to make, go for it.

## Fun Fact

Cubies was originally developed on the Unity Engine. It's a very early, rough prototype, but the code is still [around](https://github.com/LAG1996/Polycubes).
