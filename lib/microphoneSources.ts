import { checkForMediaDevicePermissions } from 'sources/sources'
import { 
  SET_AUDIO_SOURCE,
  ADD_AUDIO_SOURCE,
  SET_MODAL,
  SET_MICROPHONE_PERMISSION_GRANTED
} from 'sync/storeInterface'

export const createMicrophoneSources = () => { 

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const addMicrophoneSources = () => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const microphones = devices.filter(device => device.kind === 'audioinput')
          microphones.forEach(({deviceId, label}, index) => {
            (<any> navigator.mediaDevices).getUserMedia({ audio: { mandatory: { sourceId: deviceId, echoCancellation: false, googAutoGainControl: false} } })
            .then((stream: any) => { 
              // transform label 
              // from: Default - Microphone (HD Pro Webcam C920) (046d:082d)
              //   to: HD Pro Webcam C920
              const isDefault = label.includes('Default')
              const isCommunication = label.includes('Communications')
              label = label.substring(label.indexOf('(') + 1).slice(0,-1)
              if (label.indexOf(') (') !== -1) {
                label = label.substring(0, label.indexOf(') ('));
              }
              if (isDefault) {
                label = label.concat(' (Default)')
              }
              else if (isCommunication) {
                label = label.concat(' (Communications)')
              }

              ADD_AUDIO_SOURCE({
                name: label,
                source: stream,
                type: 'microphone'
              })
              if (index === 0 || label === localStorage.getItem('preferredAudioSource')) { SET_AUDIO_SOURCE(label) }
            })
          })
        })
      }  

      const continueCreatingMicrophoneSources = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          SET_MICROPHONE_PERMISSION_GRANTED(true)
          stream.getTracks().forEach((track) => track.stop())
          addMicrophoneSources()
        })
        .catch(() => {
          alert('To sync effects to live music, please give AVsync.LIVE permission to access your microphone. Go to chrome://settings/content/microphone') 
          SET_MODAL('') // close AskPermision modal
        })
      }

      (async () => {
        const mediaDevicePermissions = await checkForMediaDevicePermissions()

        if (mediaDevicePermissions.audioinput) {
          continueCreatingMicrophoneSources()
        }
        else {
          continueCreatingMicrophoneSources()
          SET_MODAL('AskPermission')
        }
      })()

      
  }
}
