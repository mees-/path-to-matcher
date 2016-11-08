const compileMatcher = require('./index')
const { describe, it } = require('mocha')
const { expect } = require('chai')

describe('matcher', () => {
  it('should return a match funtion', () => {
    const match = compileMatcher('test is :working')
    console.log(match)
    expect(match).to.be.a('function')
  })

  describe('match function', () => {
    describe('end: true, no variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is testing'
        const match = compileMatcher(path, { end: true })

        const result = match(path)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is testing'
        const route = 'testing test is'
        const match = compileMatcher(path, { end: true })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('end: false no variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is testing'
        const longerPath = `${ path } this should match`
        const match = compileMatcher(path, { end: false })

        const result = match(longerPath)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is testing'
        const route = 'testing test is this should not match'
        const match = compileMatcher(path, { end: false })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('end: true with variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is :testing'
        const route = 'test is working'
        const match = compileMatcher(path, { end: true })

        const result = match(route)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is :testing'
        const route = 'is test working'
        const match = compileMatcher(path, { end: true })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('end: false with variables', () => {
      it('should match when given correct inputs', () => {
        const path = 'test is :testing'
        const route = 'test is working and this should match'
        const match = compileMatcher(path, { end: false })

        const result = match(route)
        expect(result.match).to.equal(true)
      })

      it('should not match when given wrong inputs', () => {
        const path = 'test is :testing'
        const route = 'is test working and this should not match'
        const match = compileMatcher(path, { end: false })

        const result = match(route)
        expect(result.match).to.equal(false)
      })
    })

    describe('variables', () => {
      it('should work with one variable', () => {
        const path = 'is the test working :answer'
        const route = 'is the test working yes'
        const match = compileMatcher(path)

        const result = match(route)
        expect(result.vars).to.eql({ answer: 'yes' })
      })

      it('should work with multiple variables', () => {
        const path = ':name :age :coolness'
        const route = 'matcher 1minute over9000'
        const match = compileMatcher(path)

        const result = match(route)
        expect(result.vars).to.eql({ name: 'matcher', age: '1minute', coolness: 'over9000' })
      })
    })

    describe('options', () => {
      describe('delimiter', () => {
        it('should work with a different delimiter', () => {
          const path = 'test/is/testing'
          const route = 'test/is/testing/and/works'
          const match = compileMatcher(path, { delimiter: '/', end: false })

          const result = match(route)
          expect(result.match).to.equal(true)
        })
      })

      describe('variableIndicator', () => {
        it('should work with a different variableIndicator', () => {
          const path = 'test is §§working §working'
          const route = 'test is indeed §working'
          const match = compileMatcher(path, { variableIndicator: '§§' })

          const result = match(route)
          expect(result.match).to.equal(true)
          expect(result.vars).to.eql({ working: 'indeed' })
        })
      })
    })
  })
})
