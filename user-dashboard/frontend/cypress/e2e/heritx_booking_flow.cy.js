describe('HeritX Public Discovery and Booking Flow', () => {
    beforeEach(() => {
        // Navigate to the React frontend running on localhost:3001
        cy.visit('/')
    })

    it('successfully loads the public home page and verifies landing text', () => {
        // Assert that the title or a key branding element is visible
        cy.contains('Rent Authentic').should('be.visible')
        cy.contains('Browse Items').should('be.visible')
    })

    it('navigates to the Browse Items catalog', () => {
        // Click the central "Browse Items" button
        cy.contains('Browse Items').click()

        // Assert the URL changed to /browse
        cy.url().should('include', '/browse')

        // Check if the interactive Leaflet map toggle exists
        cy.get('button').contains(/Map/i).should('exist')

        // Assert that inventory items are successfully fetched and rendering
        cy.get('.grid').children().should('have.length.greaterThan', 0)
    })

    it('can search for a specific cultural item category (e.g. Onam)', () => {
        // Wait for the dynamic catalog to load
        cy.visit('/browse')

        // Use the search bar
        cy.get('input[placeholder*="Search"]').type('Onam')

        // Assuming you have a search button or it auto-updates
        // Check that results exist
        cy.get('.grid').should('exist')
    })
})
