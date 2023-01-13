<div align="center">
  <img src="https://raw.githubusercontent.com/w-henderson/TSGL/master/game/assets/logo.png" width=128>

  <h3 align="center">TSGL</h3>

  <p align="center">
    A WebGL game engine, written in TypeScript.<br>
    <a href="https://tsgl.whenderson.dev"><strong>Play the Demo »</strong></a>
  </p>
</div>

<hr><br>

TSGL (TypeScript Game/Graphics Library) is a WebGL game engine, written in TypeScript, with no core dependencies. With an API inspired by that of Unity, it is designed to be easy to use and learn. TSGL handles much of the work behind the scenes, making it very easy to get started building a game.

Try the [demo game](https://tsgl.whenderson.dev) to see what TSGL can do!

## Getting Started

To get started with TSGL, we'll build a simple game that displays a rotating OBJ model.

### Installation

TSGL is available on NPM, so you can install it into your project with

```bash
$ npm install @w-henderson/tsgl
```

### Setting Up the Canvas

TSGL, like all WebGL engines, requires a canvas element to render to. Let's create a basic HTML file with a canvas.

```html
<html>
  <head>
    <title>TSGL Demo</title>
  </head>

  <body>
    <canvas id="canvas" width="800" height="600"></canvas>

    <script src="main.js"></script>
  </body>
</html>
```

The `main.js` JavaScript file will be the compiled output of our project, so you can use any bundler you like. There's also no requirement to use TypeScript - you can use plain JavaScript if you prefer.

### Setting Up TSGL and Importing Models

Now, in our `index.ts` file, we'll import and initialise TSGL, load an OBJ model, and start the game loop. For this example, we'll use the lorry model from the TSGL demo game, *Road Run*, but you can use any model you like.

```ts
import TSGL from "@w-henderson/tsgl";

import Light from "@w-henderson/tsgl/light";
import Entity from "@w-henderson/tsgl/entity";
import { Vector } from "@w-henderson/tsgl/matrix";

const MODEL = "https://raw.githubusercontent.com/w-henderson/TSGL/master/game/assets/models/lorry.obj";

window.onload = async () => {
  const canvas = document.querySelector("canvas")!;
  const tsgl = new TSGL(canvas);

  // add a light so we can see the model
  tsgl.addLight(Light.directional(new Vector(-1, -1, -1)));

  // load and add the lorry model
  let entity = await Entity.loadObj("lorry", MODEL);
  tsgl.root.addChild(entity);

  // have the camera look at the lorry
  // (the lorry position is the front bottom centre, so we add a small offset to look at the actual centre)
  tsgl.camera.lookAt(entity.position.add(new Vector(0, 0.5, -1)));

  tsgl.start();
}
```

If you compile and run the project now, you'll see a colourful lorry model stationary in the middle of the screen. Now, let's add some behaviour to the model using a component.

### Rotating the Model with a Component

A component is a class that implements the `Component` interface. Components are attached to entities, and are passed the entity object and the TSGL instance when they are updated, which happens once every frame. This works exactly the same as Unity's component system.

Let's create a new file, `RotateComponent.ts`, and create a component that will rotate the entity it is attached to.

```ts
import Component, { ComponentContext } from "@w-henderson/tsgl/component";
import { Vector } from "@w-henderson/tsgl/matrix";

export default class RotateComponent implements Component {
  private speed: number = Math.PI * 2;

  update(ctx: ComponentContext) {
    ctx.entity.rotate(new Vector(0, this.speed * ctx.deltaTime, 0));
  }
}
```

Notice that we multiply the rotation speed by `ctx.deltaTime`, which is the time in seconds since the last frame. This ensures that the rotation speed is consistent across different frame rates. In this case, the model will rotate 2π radians (360°) every second.

Now, we can attach the component to the lorry entity in our `index.ts` file.

```ts
import RotateComponent from "./RotateComponent";

// --snip--

entity.addComponent(new RotateComponent());
```

It's as simple as that! Now, if you compile and run the project, you'll see the lorry rotating.

### Further Features

TSGL has many more features, the majority of which are demonstrated in the demo game source code.