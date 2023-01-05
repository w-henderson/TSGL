import Component, { ComponentContext } from "tsgl/component";
import Entity from "tsgl/entity";
import { Vector } from "tsgl/matrix";

import InputManager from "./input";
import PlayerAnimation from "./animation";
import { lerp, lerpVector } from "./util";

const LEADERBOARD_URL = "/api/v1/leaderboard";
const LEADERBOARD_ADD_URL = "/api/v1/add";

class GameManager implements Component {
  private player: Entity | null = null;
  private inputManager: InputManager | null = null;
  private gameState: "pregame" | "game" | "postgame" = "pregame";
  private score: number = 0;

  private scoreDisplay: HTMLDivElement | null = null;
  private submitButton: HTMLButtonElement | null = null;

  public isGameRunning(): boolean {
    return this.gameState === "game";
  }

  public startGame() {
    this.player!
      .getComponent(PlayerAnimation)!
      .playAnimation("run", 2);

    this.gameState = "game";
  }

  public endGame() {
    this.gameState = "postgame";

    fetch(LEADERBOARD_URL)
      .then(res => res.json())
      .then(data => {
        let el = document.getElementById("leaderboard") as HTMLDivElement;
        el.innerHTML = "";

        if (data.length === 0) {
          el.innerHTML = "No scores yet, be the first?";
          document.querySelector(".leaderboard")!.className = "leaderboard";
          return;
        }

        for (let entry of data) {
          let div = document.createElement("div");
          let name = document.createElement("span");
          let score = document.createElement("span");
          name.innerText = entry.name;
          score.innerText = entry.score;
          div.appendChild(name);
          div.appendChild(score);
          el.appendChild(div);
        }

        document.querySelector(".leaderboard")!.className = "leaderboard";
      });
  }

  private submitScore() {
    if (this.gameState !== "postgame") return;

    let name = window.localStorage.getItem("roadrunName");
    let key = window.localStorage.getItem("roadrunKey");

    if (name === null || key === null) {
      name = prompt("Enter your name");
      if (name === null) return;
      key = null;
    }

    fetch(LEADERBOARD_ADD_URL, {
      method: "POST",
      body: JSON.stringify({
        name,
        score: this.score,
        key: key || undefined
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.localStorage.setItem("roadrunName", name!);
          window.localStorage.setItem("roadrunKey", data.key);
          alert("Score submitted!");

          this.endGame();
        } else {
          alert(`Error submitting score: ${data.error}`);
        }
      })
  }

  start(ctx: ComponentContext) {
    this.player = ctx.tsgl.root.getChild("player")!;
    this.inputManager = this.player.getComponent(InputManager)!;
    this.scoreDisplay = document.getElementById("score") as HTMLDivElement;
    this.submitButton = document.getElementById("submitButton") as HTMLButtonElement;

    this.scoreDisplay.innerHTML = "Tap or press enter to start";
    this.submitButton.onclick = this.submitScore.bind(this);
  }

  update(ctx: ComponentContext) {
    if (this.gameState === "pregame") {
      if (this.inputManager!.isStartingGame()) {
        this.startGame();
      }
    } else if (this.gameState === "game") {
      this.score = Math.floor(- 2 - this.player!.position.z);
      this.scoreDisplay!.innerHTML = `Score: ${this.score}`;
    } else if (this.gameState === "postgame") {
      ctx.tsgl.camera.position = lerpVector(ctx.tsgl.camera.position, this.player!.position.add(new Vector(0, 2, 4)), 0.05);
      ctx.tsgl.camera.elevation = lerp(ctx.tsgl.camera.elevation, -0.5, 0.05);

      if (this.inputManager!.isStartingGame()) {
        window.location.reload();
      }
    }
  }
}

export default GameManager;