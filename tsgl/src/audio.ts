import TSGL from "./index";
import Component, { ComponentContext } from "./component";

export type AudioConfig = {
  source?: string;
  autoplay?: boolean;
  loop?: boolean;
  rolloff?: number;
}

/**
 * A component which plays directional audio.
 */
class AudioComponent implements Component {
  private static audioContext: AudioContext = new AudioContext();
  private static lastUpdate: number = 0;

  private element: HTMLAudioElement;
  private source: MediaElementAudioSourceNode;
  private panner: PannerNode;

  public autoplay: boolean;

  /**
   * Creates a new audio component.
   * 
   * If the configuration is not specified, it defaults to autoplay and loop off, and rolloff set to 1.
   * 
   * @param config The audio configuration.
   */
  constructor(config?: AudioConfig) {
    this.element = new Audio(config?.source);
    this.source = AudioComponent.audioContext.createMediaElementSource(this.element);

    this.panner = AudioComponent.audioContext.createPanner();
    this.panner.panningModel = "HRTF";
    this.panner.distanceModel = "inverse";
    this.panner.refDistance = 1;
    this.panner.rolloffFactor = config?.rolloff ?? 1;

    this.autoplay = config?.autoplay ?? false;
    this.element.loop = config?.loop ?? false;

    this.source
      .connect(this.panner)
      .connect(AudioComponent.audioContext.destination);
  }

  /**
   * Plays the audio.
   */
  public play() {
    this.element.play();
  }

  /**
   * Pauses the audio.
   */
  public pause() {
    this.element.pause();
  }

  /**
   * Stops the audio.
   */
  public stop() {
    this.element.pause();
    this.element.currentTime = 0;
  }

  get loop(): boolean {
    return this.element.loop;
  }

  set loop(value: boolean) {
    this.element.loop = value;
  }

  get rolloff(): number {
    return this.panner.rolloffFactor;
  }

  set rolloff(value: number) {
    this.panner.rolloffFactor = value;
  }

  start(ctx: ComponentContext) {
    if (AudioComponent.audioContext.state === "suspended") {
      AudioComponent.audioContext.resume();
    }

    if (this.autoplay) {
      this.play();
    }
  }

  update(ctx: ComponentContext) {
    let entityPosition = ctx.entity.position;

    this.panner.positionX.value = entityPosition.x;
    this.panner.positionY.value = entityPosition.y;
    this.panner.positionZ.value = entityPosition.z;

    AudioComponent.staticUpdate(ctx); // TODO: make less bad
  }

  static staticUpdate(ctx: ComponentContext) {
    if (this.lastUpdate !== TSGL.currentFrame) {
      this.lastUpdate = TSGL.currentFrame;

      let position = ctx.tsgl.camera.position;
      let forward = ctx.tsgl.camera.getDirection();
      let up = ctx.tsgl.camera.getUp();

      this.audioContext.listener.positionX.value = position.x;
      this.audioContext.listener.positionY.value = position.y;
      this.audioContext.listener.positionZ.value = position.z;

      this.audioContext.listener.forwardX.value = forward.x;
      this.audioContext.listener.forwardY.value = forward.y;
      this.audioContext.listener.forwardZ.value = forward.z;

      this.audioContext.listener.upX.value = up.x;
      this.audioContext.listener.upY.value = up.y;
      this.audioContext.listener.upZ.value = up.z;
    }
  }
}

export default AudioComponent;