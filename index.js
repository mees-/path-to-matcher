const defaultOptions = {
  delimiter: ' ',
  end: true,
  variableIndicator: ':'
}

module.exports = function compileMatch(tPath, tOptions = {}) {
  // fill unfilled options
  const options = {}
  Object.assign(options, defaultOptions, tOptions)

  // prevent reassigning function parameters
  let path = tPath
  // remove leading and trailing delimiters
  if (path.startsWith(options.delimiter)) path = path.slice(options.delimiter.length)
  if (path.endsWith(options.delimiter)) path = path.slice(0, -1 * options.delimiter.length)

  // create array of path parts
  const pathParts = path.split(options.delimiter)
  const variables = []

  for (const part of pathParts) {
    if (part.startsWith(options.variableIndicator)) {
      variables.push({ name: part.slice(options.variableIndicator.length), index: pathParts.indexOf(part) })
    }
  }

  // define equal function with access to passed options
  function equal(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if ((!a[i] && b[i]) || (a[i] && !b[i])) return false
      if (!a[i].startsWith(options.variableIndicator)) {
        if (a[i] !== b[i]) return false
      }
    }
    return true
  }

  return Object.assign((tStr) => {
    let str = tStr
    // remove leading and trailing delimiters
    if (str.startsWith(options.delimiter)) str = str.slice(options.delimiter.length)
    if (str.endsWith(options.delimiter)) str = str.slice(0, -1 * options.delimiter.length)

    // create array of parts in string
    let strParts = str.split(options.delimiter)
    if (!options.end) {
      strParts = strParts.slice(0, pathParts.length)
    }

    // init return values
    const match = equal(pathParts, strParts)
    const vars = {}

    // fill vars object with matched variables
    for (const variable of variables) {
      vars[variable.name] = strParts[variable.index]
    }

    return { match, vars }
  }, { pathParts, variables })
}
