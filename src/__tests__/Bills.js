import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import userEvent from "@testing-library/user-event"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import { ROUTES, ROUTES_PATH } from "../constants/routes"

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

    describe("When I click the New Bills button", () => {
      test("Then I should be sent on new bill with a form of ID: data-testid=form-new-bill", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const billss = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
        const handleClickNewBill = jest.fn((e) => billss.handleClickNewBill())
        buttonNewBill.addEventListener("click", handleClickNewBill)
        fireEvent.click(buttonNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()
        const newBillForm = screen.queryByTestId("form-new-bill")
        expect(newBillForm).toBeTruthy()
      })
    })

    describe("When I click the Eye Icon on a bill", () => {
      test('A modal should open', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const billss = new Bills({
          document, onNavigate, firestore, bills, localStorage: window.localStorage
        })
  
        const eye = document.querySelector(`div[data-testid="icon-eye"]`)
        const handleClickIconEye = jest.fn(billss.handleClickIconEye(eye))

        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
  
        const modale = screen.getByTestId('modaleFileEmployee')
        expect(modale).toBeTruthy()
      })

      describe("When no image is present in the database", () => {
        test("Then a no justification text is displayed instead of an image", () => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          const testData = [
            {
              "id": "47qAXb6fIm2zOKkLzMro",
              "vat": "80",
              "fileUrl": null,
              "status": "pending",
              "type": "Hôtel et logement",
              "commentary": "séminaire billed",
              "name": "encore",
              "fileName": "preview-facture-free-201801-pdf-1.jpg",
              "date": "2004-04-04",
              "amount": 400,
              "commentAdmin": "ok",
              "email": "a@a",
              "pct": 20
            },
          ]
          const html = BillsUI({ data: testData })
          document.body.innerHTML = html
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const firestore = null
          const billss = new Bills({
            document, onNavigate, firestore, localStorage: window.localStorage
          })
  
          const eye = document.querySelector(`div[data-testid="icon-eye"]`)
          const handleClickIconEye = jest.fn((e) => billss.handleClickIconEye(eye))
  
          eye.addEventListener("click", handleClickIconEye)
  
          userEvent.click(eye)
          expect(handleClickIconEye).toHaveBeenCalled()
          expect(screen.getAllByText('No justification image to display')).toBeTruthy()
        })
      })
    })
  })
})

//GET bills integration test
describe("Given I am a user connected as Employee", () => {
  describe("when I navigate to bills page", () => {
    test("fetched bills from mock API GET", async () => {
      const userEmail = "a@a"

      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)

      bills.data.filter(bill => bill.email === userEmail)
      expect(bills.data[0].email).toMatch(userEmail)

    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})