import {useRef, useEffect, useState} from 'react'
import { Microphone } from "@/lib/microphone";
// import { Engine } from "@/lib/engine";
import DatGui, { DatBoolean, DatColor, DatNumber, DatString, DatFolder, DatSelect } from 'react-dat-gui';

export const Visualizer = () => {

  const canvasRef = useRef(null)
  const audioSourcesRef = useRef(null)
  const localVideoref = useRef(null)

  const [activeMic, setActiveMic] = useState()
  const [fftSizeState, setFftSizeState] = useState(512) //2^5 and 2^15, (32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768)
  const [audioDevicesState, setAudioDevicesState] = useState()
  const [datData, setDatData] = useState({
    package: 'react-dat-gui',
    power: 9001,
    isAwesome: true,
    feelsLike: '#d62fc2',
    audioFolder: "Audio",
    audioSelections: 'default'
  })


  async function handleMain(id, mic){
    // const canv = canvasRef.current
    const canv = document.getElementById('myCanvas')
    const ctx = canv.getContext('2d')
    canv.width = window.innerWidth
    canv.height = window.innerHeight
  
    class Bar {
  
      constructor(x, y, width, height, color, index){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.index = index
      }
    
      update(micInput){
        const sound = micInput * 1000
        if (sound > this.height){
          this.height = sound
        } else {
          this.height -= this.height * 0.05
        }
      }
    
      draw(context, volume){
        context.strokeStyle = this.color
        context.save()
        // context.fillStyle = this.color
        // context.fillRect(this.x, this.y, this.width, this.height)
        context.translate(0, 0)
        context.rotate(this.index * 0.03)
        context.scale(1 + volume * 0.2, 1 + volume * 0.2 )
  
        context.beginPath()
        // context.moveTo(this.x, this.y)
        context.moveTo(100, 100)
        // context.lineTo(this.x, this.height)
        // context.lineTo(100, this.height)
        context.bezierCurveTo(0,0,this.height, this.height*3,0,0)
        context.stroke()
  
        // context.strokeRect(this.x, this.y, this.height/2, this.height)
        // context.strokeRect(this.x + this.index * 1.5, this.height, this.width, this.height) // RECTANGLES
  
        const baseSize = 4
        context.beginPath()
        context.arc(this.x + this.index * 2.5, this.y, this.height * 0.1 + baseSize, 0, Math.PI * 3)
        context.stroke()
  
        context.restore()
      }
    }


    let bars = []
    let barWidth = canv.width/(fftSizeState/2)
    
    function createBars(){
  
      for(let i = 0; i < (fftSizeState/2); i++){
        let clr = `hsl(${ 100 + i * .3}, 100%, 40%)`
        // bars.push(new Bar(i * barWidth, canv.height/2, 10, 50, c, i))
        bars.push(new Bar(0, i * 2, 10, 50, clr, i))
      }
    }
    createBars()
  
    let angle = 0
    let rotSpeed = -0.001
    let softVol = 0
    let amplitude = .0001
  
    function handleAnimate(){
      if(mic.initalized){
        ctx.clearRect(0,0, canv.width, canv.height)
        const samples = mic.getSamples()
        const volume = mic.getVolume()
    
        angle += rotSpeed + (-volume * 0.05)
        ctx.save()
        ctx.translate(canv.width/2, canv.height/2)
        ctx.rotate(angle)
        bars.forEach(function(bar, i){
          bar.update(samples[i])
          bar.draw(ctx, volume * amplitude)
        })
  
        ctx.restore()
        softVol = softVol * 0.9 + volume * 0.1
      } 
  
      requestAnimationFrame(handleAnimate)
    }
    handleAnimate()
  
  }

  async function getAudioDevice(id) {

    try {
      const mic = new Microphone(fftSizeState)
      setActiveMic(mic)
      
      const audioDevices = await mic.getInputDevices();
      setAudioDevicesState(audioDevices)
      
      // TODO auto pics my Virtual Cable. figure out how to save this to local storage
      const theID = id ? id : audioDevices[4].deviceId
      mic.listenTo(theID);

      handleMain(theID, mic)
      
    } catch (err) {
      console.warn(err);
    }
  }


  useEffect(() => {
    getAudioDevice()
    // handleMain(0)

  }, [canvasRef, fftSizeState])

  const handleUpdate = newData => {
    setDatData(prev => ( { ...prev, ...newData } ));
  }
  

  return (
    <div>
      <h1>visualz</h1>
      {/* <DatGui data={datData} onUpdate={handleUpdate}>
        <DatString path='package' label='Package' />
        <DatNumber path='power' label='Power' min={9000} max={9999} step={1} />
        <DatBoolean path='isAwesome' label='Awesome?' />
        <DatColor path='feelsLike' label='Feels Like' />
        <DatFolder path='audioFolder' title='Audio'>
          <DatSelect path='audioSelections' options={audioDeviceIDsState} />
        </DatFolder>
      </DatGui> */}

      {datData && audioDevicesState && (
        <div className="audio-sources-cont">
          <label htmlFor="audio-sources">input:</label>
          <select name="audio-source" id="cars" ref={audioSourcesRef} onChange={e => getAudioDevice(e.target.value)}>
            {audioDevicesState.map((device, i) => (
              <option key={i} value={device.deviceId}> {device.label} </option>
            ))}
          </select>
        </div>
      )}


      {/* <video ref={localVideoref} autoPlay ></video> */}

      <canvas 
        id='myCanvas'
        ref={canvasRef}
      >

        </canvas>
    </div>
  )
}