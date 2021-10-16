import EventEmitter from 'events'
import { formatDistanceToNow, addSeconds } from 'date-fns'
import throttle from 'lodash.throttle'
import bytes from 'bytes'
import { Response } from 'node-fetch'
import { print, println } from './stdout'

export interface IProgressOptions {
  interval?: number
}

export interface IProgressMeta {
  total: number
  done: number
  startAt: number
  totalDescribe: string
  doneDescribe: string
  elapsed: number
  rate: number
  rateDescribe: string
  estimated: number
  progress: number
  eta: number
  etaDate: Date
  etaDescribe: string
}

export class Progress extends EventEmitter {
  options: IProgressOptions = {}
  total = 0
  done = 0
  startAt = 0

  constructor(response: Response, options: IProgressOptions) {
    super()
    this.options = options
    this.total = Number(response.headers.get('content-length'))
    this.done = 0
    this.startAt = Date.now()

    const throttled = throttle(
      this.onProgress.bind(this),
      this.options.interval || 0
    )
    response.body.on('data', (chunk: any) => {
      this.done += chunk.length
      if (this.done < this.total) {
        throttled()
      }
    })
    response.body.on('end', () => {
      this.emit('finish')
    })
  }

  onProgress() {
    const totalDescribe = bytes(this.total)
    const doneDescribe = bytes(this.done)
    const elapsed = (Date.now() - this.startAt) / 1000
    const rate = this.done / elapsed
    const rateDescribe = `${bytes(rate)}/s`
    const estimated = this.total / rate
    const progress = this.done / this.total
    const eta = estimated - elapsed
    const etaDate = addSeconds(new Date(), eta)
    const etaDescribe = formatDistanceToNow(etaDate, { includeSeconds: true })

    const meta: IProgressMeta = {
      total: this.total,
      done: this.done,
      startAt: this.startAt,
      totalDescribe,
      doneDescribe,
      elapsed,
      rate,
      rateDescribe,
      estimated,
      progress,
      eta,
      etaDate,
      etaDescribe,
    }

    this.emit('progress', meta)
  }
}

export function withProgress(response: Response, description: string) {
  const progress = new Progress(response, { interval: 100 })
  progress.on('progress', (meta: IProgressMeta) => {
    const message = `[Info] njar: ${description} (${Math.round(
      meta.progress * 100
    )}%) ${meta.rateDescribe}`
    print(message)
  })
  progress.on('finish', () => {
    const message = `[Info] njar: ${description} - done.`
    println(message)
  })
}
