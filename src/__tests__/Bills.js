import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    
    //Added: Unit testing to increase views/Bills component coverage report to 100%
    test("When data is Loading, Loading... text should be rendered", () => {
      const html = BillsUI({ data: bills, loading: true})
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })

    describe("When error is detected", () => {
      test("Without empty error description, then ErrorPage should be rendered without description", () => {
        const html = BillsUI({ data: bills, error: " "})
        document.body.innerHTML = html
        expect(screen.getAllByText('Erreur')).toBeTruthy()
        expect(screen.getByTestId('error-message').innerHTML.trim().length).toBe(0)
      })
      test("With an error message, then ErrorPage should be rendered with the message as description", () => {
        const errorMessage = "Not connected to the internet"
        const html = BillsUI({ data: bills, error: errorMessage})
        document.body.innerHTML = html
        expect(screen.getAllByText(errorMessage)).toBeTruthy()
      })
    })
    
  })
})