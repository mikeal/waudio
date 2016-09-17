
module.exports = function (context) {
  class Waudio {
    constructor (inst) {
      this.inst = inst
      if (inst instanceof MediaStream) {
        // Hack to get certain MediaStreams to work with contexts
        this.node = new Audio()
        this.node.src = URL.createObjectURL(inst)
      }
      if (!inst) {
        this.inst = new Audio()
      }
    }
    send (dest) {
      if (!(dest instanceof Waudio)) {
        dest = new Waudio(dest)
      }
      let source
      if (this.inst instanceof MediaStream) {
        source = context.createMediaStreamSource(this.inst)
      }
      if (this.inst instanceof Audio) {
        source = context.createMediaElementSource(this.inst)
      }
      if (this.inst instanceof AudioNode) {
        source = this.inst
      }
      if (!source) throw new Error('Not Implemented send for this type.')
      source.connect(dest.getDest())
      return dest
    }
    getDest () {
      let dest
      if (this.inst instanceof MediaStream) {
        dest = context.createMediaStreamDestination(this.inst)
      }
      if (this.inst instanceof Audio) {
        dest = context.createMediaElementDestination(this.inst)
      }
      if (this.inst instanceof AudioNode) {
        dest = this.inst
      }
      if (!dest) throw new Error('Not Implemented dest for this type.')

      return dest
    }
    mute () {
      if (this.inst instanceof MediaStream) {
        this.inst.getAudioTracks().forEach(t => t.enabled = false)
      }
      this.muted = true
    }
    unmute () {
      if (this.inst instanceof MediaStream) {
        this.inst.getAudioTracks().forEach(t => t.enabled = true)
      }
      this.muted = false
    }
    set (key, value) {
      if (!value && typeof key === 'object') {
        for (var k in key) {
          this.set(k, key[k])
        }
        return
      }
      if (this.inst instanceof GainNode) {
        this.isnt.gain.value = key
        return
      }
      this.inst[key] = value
    }
    output () {
      if (this.inst instanceof AudioNode) {
        this.inst.connect(context.destination)
      }
    }
  }

  let exports = inst => new Waudio(inst)
  exports.context = context
  exports.Waudio = Waudio
  exports.gain = inst => new Waudio(inst || context.createGain())

  return exports
}

