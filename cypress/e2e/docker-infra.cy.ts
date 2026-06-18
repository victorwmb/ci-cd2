/**
 * Tests d'infrastructure Docker
 *
 * Ces tests vérifient que l'architecture Docker fonctionne correctement :
 * - Chaque service (React, API, Adminer, MySQL) est accessible
 * - La communication inter-services fonctionne (React → API → MySQL)
 * - Les headers CORS sont correctement configurés
 * - Les données seed sont présentes en base
 */

describe('Infrastructure Docker — Services', () => {

  it('le frontend React est accessible (HTTP 200)', () => {
    cy.request({
      url: 'http://localhost:5173',
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(200)
      expect(response.headers['content-type']).to.include('text/html')
    })
  })

  it("l'API Python (FastAPI) répond sur /users", () => {
    cy.request({
      url: 'http://localhost:8000/users',
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('utilisateurs')
      expect(response.body.utilisateurs).to.be.an('array')
    })
  })

  it('Adminer est accessible (HTTP 200)', () => {
    cy.request({
      url: 'http://localhost:8081',
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(200)
    })
  })

})

describe('Infrastructure Docker — Communication inter-services', () => {

  it('API ↔ MySQL : les données seed sont présentes', () => {
    cy.request('http://localhost:8000/users').then(response => {
      expect(response.status).to.eq(200)
      const users = response.body.utilisateurs
      expect(users).to.be.an('array')
      // La migration v003 insère un utilisateur seed (Victor Test)
      expect(users.length).to.be.greaterThan(0)
    })
  })

  it('API ↔ MySQL : création et lecture d\'un utilisateur', () => {
    const uniqueEmail = `infra-test-${Date.now()}@test.com`

    // Créer un utilisateur via l'API
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/users',
      body: {
        lastName: 'InfraTest',
        firstName: 'Docker',
        email: uniqueEmail,
        birthDate: '1995-06-15',
        city: 'Lyon',
        postalCode: '69000',
      },
    }).then(createResponse => {
      expect(createResponse.status).to.eq(200)
      expect(createResponse.body.success).to.be.true
      expect(createResponse.body.id).to.be.a('number')
    })

    // Vérifier que l'utilisateur est bien en base
    cy.request('http://localhost:8000/users').then(response => {
      const users = response.body.utilisateurs
      const found = users.find((u: any) => u.email === uniqueEmail)
      expect(found).to.not.be.undefined
      expect(found.lastName).to.eq('InfraTest')
      expect(found.firstName).to.eq('Docker')
    })
  })

  it('React ↔ API : le frontend charge la liste depuis l\'API', () => {
    cy.visit('http://localhost:5173')
    // Le composant UserList fait un GET /users au chargement
    // On vérifie que le frontend affiche au moins le user seed
    cy.contains('Inscrits', { timeout: 10000 }).should('be.visible')
  })

})

describe('Infrastructure Docker — CORS', () => {

  it("l'API renvoie les headers CORS corrects", () => {
    cy.request({
      method: 'OPTIONS',
      url: 'http://localhost:8000/users',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
      },
      failOnStatusCode: false,
    }).then(response => {
      // FastAPI CORS middleware doit répondre avec les headers appropriés
      expect(response.headers).to.have.property('access-control-allow-origin')
    })
  })

})

describe('Infrastructure Docker — Authentification', () => {

  it("le login admin fonctionne avec les bons identifiants", () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/login',
      body: {
        email: 'loise.fenoll@ynov.com',
        password: 'PvdrTAzTeR247sDnAZBr',
      },
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      expect(response.body.isAdmin).to.be.true
      expect(response.body.token).to.be.a('string')
    })
  })

  it("le login échoue avec de mauvais identifiants", () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/login',
      body: {
        email: 'fake@example.com',
        password: 'wrongpassword',
      },
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(401)
    })
  })

  it("l'accès admin affiche les détails supplémentaires", () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/users',
      headers: {
        'Authorization': 'Bearer admin-token-secret',
      },
    }).then(response => {
      expect(response.status).to.eq(200)
      const users = response.body.utilisateurs
      expect(users.length).to.be.greaterThan(0)
      // En mode admin, les champs supplémentaires sont visibles
      const user = users[0]
      expect(user).to.have.property('city')
      expect(user).to.have.property('postalCode')
      expect(user).to.have.property('birthDate')
    })
  })

  it("la suppression est refusée sans token admin", () => {
    cy.request({
      method: 'DELETE',
      url: 'http://localhost:8000/users/9999',
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(403)
    })
  })

})
