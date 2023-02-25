import {useRef, useEffect, useState} from 'react'
import { Microphone } from "@/lib/microphone";
// import { Engine } from "@/lib/engine";
import DatGui, { DatBoolean, DatColor, DatNumber, DatString, DatFolder, DatSelect } from 'react-dat-gui';
import {spiral} from "@/lib/presets/spiral";
import {bar_graph} from "@/lib/presets/bar_graph";
import {bars} from "@/lib/presets/bars";

export const Visualizer = () => {

  const canvasRef = useRef(null)
  const audioSourcesRef = useRef(null)
  const localVideoref = useRef(null)

  const [currentPreset, setCurrentPreset] = useState('bars')
  const [activeMic, setActiveMic] = useState()
  const [fftSizeState, setFftSizeState] = useState(512) //2^5 and 2^15, (32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768)
  const [audioDevicesState, setAudioDevicesState] = useState()
  const [presetArray, setPresetArray] = useState(['spiral', 'bar_graph', 'donut', 'bars'])
  const [datData, setDatData] = useState({
    package: 'react-dat-gui',
    power: 9001,
    isAwesome: true,
    feelsLike: '#d62fc2',
    audioFolder: "Audio",
    audioSelections: 'default'
  })


  async function handleRender(mic){
    // const canv = canvasRef.current
    const canv = document.getElementById('myCanvas')
    const ctx = canv.getContext('2d')
    canv.width = window.innerWidth
    canv.height = window.innerHeight

    switch (currentPreset) {
      case 'spiral':
        return spiral(canv, ctx, fftSizeState, mic)
      
      case 'bar_graph':
        return bar_graph(canv, ctx, fftSizeState, mic)

      case 'bars':
        return bars(canv, ctx, fftSizeState, mic)
        
      default:
        return console.log(`NO PRESET SELECTED.`);
    }
  
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

      handleRender(mic)
      
    } catch (err) {
      console.warn(err);
    }
  }

  async function handlePresetChange(name){
    console.log(name);
    setCurrentPreset(name)
  }


  useEffect(() => {

    getAudioDevice()

  }, [canvasRef, fftSizeState, currentPreset ])

  // const handleUpdate = newData => {
  //   setDatData(prev => ( { ...prev, ...newData } ));
  // }

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

      <button onClick={e => handlePresetChange('heyyyy')}>hello</button>

      {audioDevicesState && presetArray && (
        <div className="options">
          <div className="audio-sources-cont">
            <label htmlFor="audio-sources">input:</label>
            <select name="audio-source" id="audio-sources" ref={audioSourcesRef} onChange={e => getAudioDevice(e.target.value)}>
              {audioDevicesState.map((device, i) => (
                <option key={i} value={device.deviceId}> {device.label} </option>
              ))}
            </select>
          </div>

          <div className="preset-cont">
            <label htmlFor="preset">preset:</label>
            <select name="preset" id="preset" onChange={e => setCurrentPreset(e.target.value)}>
              {presetArray.map((name, i) => (
                <option key={i} value={name}> {name} </option>
              ))}
            </select>
          </div>
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