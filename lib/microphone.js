// cred: Franks Lab -- https://www.youtube.com/watch?v=VXWvfrmpapI&t=574s

/* eslint-env browser */
export class Microphone{

  constructor(fftSize) {
    this.initalized = false

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then( function(stream) {
      this.context = new window.AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = 0.7;
      this.analyser.fftSize = fftSize ? fftSize : 512;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);
      document.addEventListener("click", async () => await this.resume());
      document.addEventListener("scroll", async () => await this.resume());

      this.initalized = true

    }.bind(this)).catch( err => {
      alert(err)
    })
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

  // getBufferLength(){
  //   const bufferLength = this.analyser.frequencyBinCount
  //   return bufferLength
  // }

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

  getSamples(){
    this.analyser.getByteTimeDomainData(this.freqData)
    let normSamples = [...this.freqData].map(e => e / 128 - 1)
    // let normSamples = [...this.freqData].map(e => e / 2)
    return normSamples
  }

  getVolume(){

    this.analyser.getByteTimeDomainData(this.freqData)
    let normSamples = [...this.freqData].map(e => e / 128 - 1)
    let sum = 0

    for(let i = 0; i < normSamples.length; i++){
      sum += normSamples[i] * normSamples[i]
    }

    let volume = Math.sqrt(sum / normSamples.length)
    return volume
    // return sum
  }
}