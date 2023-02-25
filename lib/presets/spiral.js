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
    context.arc(this.x + this.index * 0.1, this.y, this.height * 0.1 + baseSize, 0, Math.PI * 3)
    context.stroke()

    context.restore()
  }
}

export const spiral = (canv, ctx, fftSizeState, mic) =>{
  
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