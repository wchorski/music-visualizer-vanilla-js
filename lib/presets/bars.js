export const bars = (canv, ctx, fftSizeState, mic) =>{

  const dataArray = mic.getVolume()
  const bufferLength = mic.getSamples()
  // const bufferLength = 10000
  console.log('bufferLength, ', bufferLength);

  const barWidth = canv.width/bufferLength
  let barHeight
  let x

  function animate() {
    x = 0

    ctx.clearRect(0,0, canv.width, canv.height)
    // analyser.getByteFrequencyData(dataArray)

    for(let i = 0; i < bufferLength; i++){
      barHeight = dataArray[i]
      ctx.fillStyle = 'red'
      ctx.fillRect(x, canv.height = barHeight, barWidth, barHeight)
      x += barWidth
    }

    requestAnimationFrame(animate)
  }
  animate()
}