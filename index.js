/* global Audio, Blob, File, URL */
const record = require('media-recorder-stream')
const MediaStream = window.MediaStream || window.webkitMediaStream

module.exports = function (context) {

  class MediaStreamWrapper {
    constructor (stream) {
      // Hack, but Chrome won't work without this
      // We never do anything with this node, it's just a workaround
      let node = new Audio()
      node.src = URL.createObjectURL(stream)

      this.microphone = context.createMediaStreamSource(stream)
      this.gainFilter = context.createGain()
      this.destination = context.createMediaStreamDestination()
      this.microphone.connect(this.gainFilter)
      this.gainFilter.connect(this.destination)
      this.stream = this.destination.stream
    }
  }

  class Waudio {
    constructor () {
      this.el = new Audio()
      this.source = context.createMediaElementSource(this.el)
      this.gainFilter = context.createGain()
      this.destination = context.createMediaStreamDestination()
      this.source.connect(this.gainFilter)
      this.gainFilter.connect(this.destination)
      this.stream = this.destination.stream
      this.context = context
    }
    connect (dest) {
      if (dest.gainFilter) dest = dest.gainFilter
      this.gainFilter.connect(dest)
    }
    disconnect (dest) {
      if (dest && dest.gainFilter) dest = dest.gainFilter
      this.gainFilter.disconnect(dest)
    }
    record (opts) {
      return record(this.stream, opts)
    }
    volume (value) {
      this.gainFilter.gain.value = value
    }
    seek (value) {
      this.el.currentTime = value
    }
    mute () {
      this._volume = this.gainFilter.gain.value
      this.volume(0)
    }
    unmute () {
      if (!this._volume) return
      this.volume(this._volume)
      this._volume = null
    }
    play () {
      this.el.play()
    }
    pause () {
      this.el.pause()
    }
    fadeVolume (value, delay) {
      let now = context.currentTime
      let gainNode = this.gainFilter.gain
      gainNode.setValueAtTime(0, now)
      gainNode.linearRampToValueAtTime(value, now + delay)
    }
  }

  function createWaudio (inst, play) {
    let waud
    if (inst instanceof MediaStream) {
      let wrapper = new MediaStreamWrapper(inst)
      waud = new Waudio()
      wrapper.gainFilter.connect(waud.gainFilter)
    }
    if (inst instanceof Blob || inst instanceof File) {
      waud = new Waudio()
      waud.el.src = URL.createObjectURL(inst)
    }
    if (typeof inst === 'boolean') {
      play = inst
      inst = null
    }
    if (!inst) {
      waud = new Waudio()
    } else {
      // TODO: type error.
    }
    if (play) waud.gainFilter.connect(context.destination)
    return waud
  }

  let exports = createWaudio
  exports.context = context
  exports.Waudio = Waudio

  return exports
}
