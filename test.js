const compileMatch = require('./index')
const { describe, it } = require('mocha')
const { expect } = require('chai')

describe('compileMatch', () => {
  it('should return a match funtion', () => {
    const match = compileMatch('test is :working')
    expect(match).to.be.a('function')
  })

  describe('match function', () => {
    describe('end: true, no variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is testing'
        const match = compileMatch(path, { end: true })

        const result = match(path)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is testing'
        const route = 'testing test is'
        const match = compileMatch(path, { end: true })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('end: false no variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is testing'
        const longerPath = `${ path } this should match`
        const match = compileMatch(path, { end: false })

        const result = match(longerPath)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is testing'
        const route = 'testing test is this should not match'
        const match = compileMatch(path, { end: false })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('end: true with variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is :testing'
        const route = 'test is working'
        const match = compileMatch(path, { end: true })

        const result = match(route)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is :testing'
        const route = 'is test working'
        const match = compileMatch(path, { end: true })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('end: false with variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is :testing'
        const route = 'test is working and this should match'
        const match = compileMatch(path, { end: false })

        const result = match(route)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is :testing'
        const route = 'is test working and this should not match'
        const match = compileMatch(path, { end: false })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('variables', () => {
      it('should work with one variable', () => {
        const path = 'is the test working :answer'
        const route = 'is the test working yes'
        const match = compileMatch(path)

        const result = match(route)
        expect(result.vars).to.eql({ answer: 'yes' })
      })

      it('should work with multiple variables', () => {
        const path = ':name :age :coolness'
        const route = 'matcher 1minute over9000'
        const match = compileMatch(path)

        const result = match(route)
        expect(result.vars).to.eql({ name: 'matcher', age: '1minute', coolness: 'over9000' })
      })
      describe('optionalVariables', () => {
        it('should work with filled in optionalVariables', () => {
          const path = 'testing opt ?variables'
          const route = 'testing opt working'
          const match = compileMatch(path)

          const result = match(route)
          expect(result.vars).to.eql({ variables: 'working' })
        })

        it('should work with left out optionalVariables', () => {
          const path = 'testing opt ?variables ?test'
          const route = 'testing opt testistrue'
          const match = compileMatch(path)

          const result = match(route)
          expect(result.vars).to.eql({ variables: 'testistrue', test: null })
        })

        it('should throw when optionalVariables appear before normal variables', () => {
          const path = 'testing opt ?variables :test'
          const toTest = compileMatch.bind(null, path)

          expect(toTest).to.throw(Error)
        })

        it('should throw an when optionalVariables appear before normal path parts', () => {
          const path = 'testing opt ?variables test'
          const toTest = compileMatch.bind(null, path)

          expect(toTest).to.throw(Error)
        })
      })
    })

    describe('options', () => {
      it('should work with a different delimiter', () => {
        const path = 'test/is/testing'
        const route = 'test/is/testing/and/works'
        const match = compileMatch(path, { delimiter: '/', end: false })

        const result = match(route)
        expect(result.match).to.equal(true)
      })

      it('should work with a different variableIndicator', () => {
        const path = 'test is §§working §working'
        const route = 'test is indeed §working'
        const match = compileMatch(path, { variableIndicator: '§§' })

        const result = match(route)
        expect(result.match).to.equal(true)
        expect(result.vars).to.eql({ working: 'indeed' })
      })

      it('should work with a different optionalIndicator', () => {
        const path = 'testing is >working'
        const route = 'testing is'
        const match = compileMatch(path, { optionalIndicator: '>' })

        const result = match(route)
        expect(result.vars).to.eql({ working: null })
      })
    })
  })
})

describe('equal', () => {
  const stubOptions = {
    variableIndicator: ':',
    optionalIndicator: '?'
  }

  it('should work without variables', () => {
    const pathParts = ['test', 'is', 'testing']
    const routeParts = ['test', 'is', 'testing']

    const result = compileMatch.equal(stubOptions, pathParts, routeParts)
    expect(result).to.equal(true)
  })

  it('should work with variables', () => {
    const pathParts = ['test', 'is', ':testing']
    const routeParts = ['test', 'is', 'working']

    const result = compileMatch.equal(stubOptions, pathParts, routeParts)
    expect(result).to.equal(true)
  })

  it('should work with optionalVariables not filled in', () => {
    const pathParts = ['test', 'is', '?testing']
    const routeParts = ['test', 'is']

    const result = compileMatch.equal(stubOptions, pathParts, routeParts)
    expect(result).to.equal(true)
  })

  it('should work with optionalVariables filled in', () => {
    const pathParts = ['test', 'is', '?testing']
    const routeParts = ['test', 'is', 'working']

    const result = compileMatch.equal(stubOptions, pathParts, routeParts)
    expect(result).to.equal(true)
  })
})
