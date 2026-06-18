describe('App E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  })

  it('affiche la liste des utilisateurs mockée', () => {
    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: {
        utilisateurs: [
          { id: 1, lastName: 'Doe', firstName: 'John', email: 'john@example.com' }
        ]
      }
    }).as('getUsers')

    cy.reload()
    cy.wait('@getUsers')
    cy.contains('John Doe').should('be.visible')
    cy.contains('john@example.com').should('be.visible')
  })

  it("soumet le formulaire d'inscription", () => {
    cy.intercept('POST', '**/users', {
      statusCode: 200,
      body: { success: true, id: 2 }
    }).as('createUser')

    cy.get('input[id="lastName"]').type('Smith')
    cy.get('input[id="firstName"]').type('Jane')
    cy.get('input[id="email"]').type('jane@example.com')
    cy.get('input[id="city"]').type('Paris')
    cy.get('input[id="postalCode"]').type('75000')

    cy.get('input[id="birthDate"]').type('2000-01-15')

    cy.contains('button', 'Sauvegarder').click()
    cy.wait('@createUser')
    cy.contains("Sauvegardé avec succès.").should('be.visible')
  })


  it("affiche les fonctionnalités admin une fois connecté", () => {
    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: {
        utilisateurs: [
          { id: 1, lastName: 'Doe', firstName: 'John', email: 'john@example.com' }
        ]
      }
    }).as('getUsers')

    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { success: true, isAdmin: true, token: "admin-token-secret" }
    }).as('loginAdmin')

    cy.intercept('GET', '**/users', {
      statusCode: 200,
      body: {
        utilisateurs: [
          { id: 1, lastName: 'Doe', firstName: 'John', email: 'john@example.com', city: 'Lyon', postalCode: '69000', birthDate: '2000-01-01' }
        ]
      }
    }).as('getUsersAdmin')

    cy.get('input[placeholder="Admin Email"]').type('loise.fenoll@ynov.com')
    cy.get('input[placeholder="Pass"]').type('PvdrTAzTeR247sDnAZBr')
    cy.contains('Login').click()

    cy.wait('@loginAdmin')
    cy.wait('@getUsersAdmin')

    cy.contains("Connecté en tant qu'admin").should('be.visible')
    cy.contains('Ville: Lyon').should('be.visible')
    cy.contains('Supprimer').should('be.visible')
  })
})
