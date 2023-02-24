// import * as dat from "dat.gui";

export class AudioManager {
  constructor() {
    navigator.mediaDevices.getUserMedia({ audio: true });
    this.context = new window.AudioContext();
    this.analyser = this.context.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.7;
    this.analyser.fftSize = 2048;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.fftSize);
    document.addEventListener("click", async () => await this.resume());
    document.addEventListener("scroll", async () => await this.resume());
  }

  async resume() {
    if (this.context.state === "closed" || this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  async #registerStream(stream) {
    if (this.input) {
      this.input.disconnect(this.analyser);
    }
    this.input = this.context.createMediaStreamSource(stream);
    this.input.connect(this.analyser);
    await this.resume();
  }
  async getInputDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === "audioinput"
    );
  }
  updateAudioInfo() {
    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);
  }

  async getOutputDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === "audiooutput"
    );
  }

  async listenTo(deviceId) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });
    await this.#registerStream(stream);
  }
}

export class GUIAudio {
  constructor(gui, audioInterfaceController) {
    this.gui = gui;
    this.audioInterfaceController = audioInterfaceController;
    this.state = {
      audioSelected: "",
    };
  }
  async init() {
    const audioDevices = await this.audioInterfaceController.getInputDevices();
    if (audioDevices.length === 0) return;
    this.state.audioSelected = audioDevices[0].label;
    this.audioFolder = this.gui.addFolder("Audio");
    this.audioFolder
      .add(this.state, "audioSelected")
      .options(audioDevices.map((d) => d.label))
      .name("Audio Input")
      .onFinishChange(async (val) => {
        const selectedDevice = audioDevices.filter((d) => d.label === val)[0];
        this.audioInterfaceController.listenTo(selectedDevice.deviceId);
      });
  }
}

// export async function setupGUI() {
//   console.log('setup gui');
//   this.gui = new dat.GUI();
//   this.guiAudio = new GUIAudio(
//     this.gui,
//     this.audioMidiParticlesController.audioInterfaceController
//   );
//   this.guiMidi = new GUIMidi(this.gui, this.audioMidiParticlesController);
//   this.guiControls = new GUIControls(
//     this.gui,
//     this.audioMidiParticlesController
//   );

//   await this.guiAudio.init();
//   this.guiMidi.init();
//   this.guiControls.init();

//   if (this._debug) document.body.appendChild(this.stats.dom);
//   this.gui.close();
// }