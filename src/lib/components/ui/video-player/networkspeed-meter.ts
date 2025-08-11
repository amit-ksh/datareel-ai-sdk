export class NetworkSpeedMeter {
  private testFileUrl: string
  private speedHistory: { speed: number; timestamp: number }[]

  constructor() {
    this.testFileUrl =
      'https://video.dev.datareel.ai/api/v1/cdn/sample_1mb_file.bin' // 1MB test file
    this.speedHistory = []
  }

  // Main method to get current network speed
  async getNetworkSpeed() {
    try {
      // Method 1: Try Network Information API first (most accurate)
      const connectionSpeed = this.getConnectionSpeed()
      if (connectionSpeed) {
        return connectionSpeed
      }

      // Method 2: Download speed test
      const downloadSpeed = await this.measureDownloadSpeed()
      return downloadSpeed
    } catch (error) {
      console.warn('Speed measurement failed:', error)
      return this.getEstimatedSpeed()
    }
  }

  // Network Information API (Chrome/Edge)
  getConnectionSpeed() {
    const nav =
      // @ts-ignore
      navigator?.connection ||
      // @ts-ignore
      navigator?.mozConnection ||
      // @ts-ignore
      navigator?.webkitConnection
    if (nav && typeof nav.downlink === 'number') {
      const speedMbps = nav.downlink // in Mbps
      const speedKbps = speedMbps * 1000
      this.updateSpeedHistory(speedKbps)
      return {
        speed: speedKbps,
        unit: 'kbps',
        method: 'connection_api',
      }
    }
    return null
  }

  // Download speed test
  async measureDownloadSpeed() {
    const testSizes = [
      {
        url: 'https://video.dev.datareel.ai/api/v1/cdn/sample_1mb_file.bin',
        size: 1000000,
      }, // 1MB
    ]

    for (const test of testSizes) {
      try {
        const speed = await this.performDownloadTest(test.url, test.size)
        if (speed > 0) {
          this.updateSpeedHistory(speed)
          return {
            speed: speed,
            unit: 'kbps',
            method: 'download_test',
          }
        }
      } catch (error) {
        console.warn(`Download test failed for ${test.size} bytes:`, error)
      }
    }

    throw new Error('All download tests failed')
  }

  async performDownloadTest(url: string, expectedSize: number) {
    const startTime = performance.now()

    const response = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.arrayBuffer()
    const endTime = performance.now()

    const durationSeconds = (endTime - startTime) / 1000
    const sizeKB = data.byteLength / 1024
    const speedKbps = (sizeKB * 8) / durationSeconds // Convert to kbps

    return speedKbps
  }

  updateSpeedHistory(speed: number) {
    this.speedHistory.push({
      speed: speed,
      timestamp: Date.now(),
    })

    // Keep only last 5 measurements
    if (this.speedHistory.length > 5) {
      this.speedHistory.shift()
    }
  }

  // Get average of recent measurements
  getAverageSpeed() {
    if (this.speedHistory.length === 0) return 0

    const totalSpeed = this.speedHistory.reduce(
      (sum, record) => sum + record.speed,
      0,
    )
    return totalSpeed / this.speedHistory.length
  }

  // Fallback estimation
  getEstimatedSpeed() {
    const avgSpeed = this.getAverageSpeed()
    return {
      speed: avgSpeed || 1000, // Default to 1Mbps
      unit: 'kbps',
      method: 'estimated',
    }
  }

  // Categorize connection quality
  getConnectionQuality(speedKbps: number): 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor' {
    if (speedKbps >= 5000) return 'excellent' // 5+ Mbps
    if (speedKbps >= 2000) return 'good' // 2-5 Mbps
    if (speedKbps >= 1000) return 'fair' // 1-2 Mbps
    if (speedKbps >= 500) return 'poor' // 0.5-1 Mbps
    return 'very_poor' // < 0.5 Mbps
  }

  getSupportedQualities(speedKbps: number, availableQualities: Record<string, boolean>): string {
    console.log(`Calculating supported qualities for speed: ${speedKbps} kbps`)
    const thresholds = [
      { quality: '1080', minSpeed: 6000 },
      { quality: '720', minSpeed: 3000 },
      { quality: '480', minSpeed: 1500 },
      { quality: '240', minSpeed: 600 },
    ]

    // Filter qualities by speed threshold
    const supportedBySpeed = thresholds
      .filter(({ minSpeed }) => speedKbps >= minSpeed)
      .map(({ quality }) => quality)

    // Cross-check with available qualities
    const available = Object.entries(availableQualities)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([quality]) => quality)

    // Find the best matching quality
    for (const quality of supportedBySpeed) {
      if (available.includes(quality)) {
        return quality // Best match
      }
    }

    // Fallback: pick the nearest lower available (or lowest available)
    const allOrdered = thresholds.map(({ quality }) => quality)

    // Find nearest fallback in available list
    for (const quality of allOrdered.reverse()) {
      if (available.includes(quality)) {
        return quality
      }
    }

    // No match at all
    return '1080'
  }
}
