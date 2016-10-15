/* global Audio, Blob, File,  URL */
const record = require('media-recorder-stream')
const MediaStream = window.MediaStream || window.webkitMediaStream

module.exports = function (context) {
  class Waudio {
    constructor (inst) {
      if (!inst) inst = new Audio()
      if (inst instanceof Blob || inst instanceof File) {
        let url = URL.createObjectURL(inst)
        this.inst = new Audio()
        this.inst.src = url
      }
      this.inst = inst

      this.destination = context.createMediaStreamDestination()
      this.gain = context.createGain()

      if (inst instanceof MediaStream) {
        this.source = context.createMediaStreamSource(inst)
        let oldtracks = inst.getAudioTracks()
        let _add = track => inst.addTrack(track)
        this.destination.stream.getAudioTracks().forEach(_add)
        oldtracks.forEach(track => inst.removeTrack(track))
      }
      if (inst instanceof Audio) {
        this.source = context.createMediaElementSource(inst)
      }

      this.source.connect(this.gain)
      this.gain.connect(this.destination)
    }
    toMediaStream () {
      return this.destination.stream
    }
    connect (dest) {
      if (dest instanceof Waudio) dest = dest.gain
      this.gain.connect(dest)
    }
    record (opts) {
      return record(this.toMediaStream(), opts)
    }
    volume (value) {
      this.gain.gain.value = value
    }
  }

  let exports = inst => new Waudio(inst)
  exports.context = context
  exports.Waudio = Waudio

  return exports
}

