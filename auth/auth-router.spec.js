const request = require('supertest')
const server = require('../api/server')
const db = require('../database/dbConfig')

const registerApi = '/api/auth/register'
const loginApi = '/api/auth/login'
const jokesApi = '/api/jokes'
const exampleUser = {
  username: 'exampleUser',
  password: 'examplePassword'
}

beforeEach(async () => {
  await db('users').truncate()
})

beforeEach(async () => {
  await request(server)
    .post(registerApi)
    .send(exampleUser)
})

describe('auth-router', () => {
  describe('register endpoint', () => {
    it('should return 200', async () => {
      const res = await request(server)
        .post(registerApi)
        .send(exampleUser)
      expect(res.status).toBe(200)
    })
    it('should have a body', async () => {
      const response = await request(server)
        .post(registerApi)
        .send({
          username: 'Tony',
          password: '1234'
        })
      // console.log(response.body)
      expect(response.body.username).toEqual('Tony')
    })
    it('should not allow duplicates', async () => {
      const response = await request(server)
        .post(registerApi)
        .send(exampleUser)
        console.log(response.res.text);
        expect(response.res.text).toContain('SQLITE_CONSTRAINT')
    })
  })

  describe('login endpoint', () => {
    it('should return a token', async () => {
      const loginResponse = await request(server)
        .post(loginApi)
        .send(exampleUser)
      // console.log(loginResponse.status)
      // let token = loginResponse.body.token
      expect(loginResponse.body).toHaveProperty('token')
      expect(loginResponse.status).toBe(200)
    })
  })
  describe('login endpoint', () => {
    it("shouldn't return a token", async () => {
      const loginResponse = await request(server)
        .post(loginApi)
        .send({
          username: 'does not exist',
          password: 'incorrect'
        })
      // console.log(loginResponse.status)
      // let token = loginResponse.body.token
      expect(loginResponse.status).toBe(401)
    })
  })
})

describe('jokes api', () => {
  it('should return jokes', async () => {
    const loginResponse = await request(server)
      .post(loginApi)
      .send(exampleUser)
    let token = loginResponse.body.token
    // console.log(token)
    const jokesResponse = await request(server)
      .get(jokesApi)
      .set({ Authorization: token })
    // console.log(jokesResponse.status)
    expect(jokesResponse.status).toBe(200)
  })
  it("shouldn't return jokes", async () => {
    const jokesResponse = await request(server)
      .get(jokesApi)
      .set({ Authorization: 'incorrectToken' })
    // console.log(jokesResponse.status)
    expect(jokesResponse.status).toBe(401)
  })
})

