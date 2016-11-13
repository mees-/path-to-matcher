const defaultOptions = {
  delimiter: ' ',
  end: true,
  variableIndicator: ':',
  optionalIndicator: '?'
}

module.exports = function compileMatch(tPath, tOptions = {}) {
  // fill unfilled options
  const options = {}
  Object.assign(options, defaultOptions, tOptions)

  // prevent reassigning function parameters
  let path = tPath
  // remove leading and trailing delimiters
  if (path.startsWith(options.delimiter)) {
    path = path.slice(options.delimiter.length)
  }
  if (path.endsWith(options.delimiter)) {
    path = path.slice(0, -1 * options.delimiter.length)
  }

  // create array of path parts
  const pathParts = path.split(options.delimiter)
  const variables = []

  for (const part of pathParts) {
    if (part.startsWith(options.variableIndicator)) {
      variables.push({
        name: part.slice(options.variableIndicator.length),
        index: pathParts.indexOf(part),
        optional: false
      })
    }
    if (part.startsWith(options.optionalIndicator)) {
      variables.push({
        name: part.slice(options.optionalIndicator.length),
        index: pathParts.indexOf(part),
        optional: true
      })
    }
  }
  // check that all optional variables are at the end
  let lastNonOptIndex = 0
  let firstOptIndex = Infinity
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]
    if (!part.startsWith(options.optionalIndicator) && i > lastNonOptIndex) {
      lastNonOptIndex = i
    }
    if (part.startsWith(options.optionalIndicator) && i < firstOptIndex) {
      firstOptIndex = i
    }
  }

  if (lastNonOptIndex > firstOptIndex) {
    throw new Error('path-to-matcher: Optional variables must be defined at ' +
    'the end of the path')
  }

  const isEqual = module.exports.equal.bind(null, options)

  function matcher(tStr) {
    let str = tStr
    // remove leading and trailing delimiters
    if (str.startsWith(options.delimiter)) {
      str = str.slice(options.delimiter.length)
    }
    if (str.endsWith(options.delimiter)) {
      str = str.slice(0, -1 * options.delimiter.length)
    }

    // create array of parts in string
    let strParts = str.split(options.delimiter)
    if (!options.end) {
      strParts = strParts.slice(0, pathParts.length)
    }

    // init return values
    const match = isEqual(pathParts, strParts)
    const vars = Object.create(null)

    // fill vars object with matched variables
    for (const variable of variables) {
      vars[variable.name] = strParts[variable.index] || null
    }

    return { match, vars }
  }
  return Object.assign(matcher, { pathParts, variables })
}

// define equal function with access to passed options
module.exports.equal = function equal(options, a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const condition1 = !!a[i]
    const condition2 = a[i].startsWith(options.optionalIndicator) ? true : !!b[i]
    if (!condition1 || !condition2) return false
    if (!a[i].startsWith(options.variableIndicator) && !a[i].startsWith(options.optionalIndicator)) {
      if (a[i] !== b[i]) return false
    }
  }
  return true
}
