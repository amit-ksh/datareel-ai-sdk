import bulletpointsTemplate from './bulletpoints'
import piechartTemplate from './piechart'

/**
 * Generates presentation HTML based on the bullet points type
 * @param {Array|Object|string} bulletPoints - The bullet points data
 * @returns {string} HTML content for the presentation
 */
export const generatePresentationHTML = (bulletPoints: Array<string> | Record<string, number> | string) => {
  // Case 1: Array of bullet points
  if (Array.isArray(bulletPoints)) {
    const bulletPointsHTML = bulletPoints
      .map((point) => `<div class="bullet">${point}</div>`)
      .join('')

    return bulletpointsTemplate.replace(
      '{bullet_points_html}',
      bulletPointsHTML,
    )
  }

  // Case 2: Object (for pie chart)
  if (
    typeof bulletPoints === 'object' &&
    bulletPoints !== null &&
    !Array.isArray(bulletPoints)
  ) {
    return generatePieChartHTML(bulletPoints)
  }

  // Case 3: HTML string
  if (typeof bulletPoints === 'string') {
    return bulletPoints
  }

  return '<div>No content available</div>'
}

/**
 * Generates a pie chart HTML using the provided data
 * @param {Object} dataObject - Key-value pairs for the chart
 * @returns {string} HTML content with embedded chart
 */
const generatePieChartHTML = (dataObject: Record<string, number>) => {
  const labels = Object.keys(dataObject)
  const data = Object.values(dataObject)

  const chartConfig = {
    labels: JSON.stringify(labels),
    data: JSON.stringify(data),
  }

  let html = piechartTemplate

  // Replace the chart data in the template
  html = html.replace(/labels: \[.*?\]/, `labels: ${chartConfig.labels}`)

  html = html.replace(/data: \[.*?\]/, `data: ${chartConfig.data}`)

  return html
}

/**
 * Check if the presentation is skip case or not
 * @param {Array<string>} presentationList - List of strings
 * @return {boolean} - Returns true if the presentation is a skip case, otherwise false
 */
export const isSkipPresentation = (presentationList: Array<string>) => {
  if (!Array.isArray(presentationList)) {
    return false
  }

  return presentationList.length === 1 && presentationList[0] === 'skip_case'
}
