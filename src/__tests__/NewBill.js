import { screen, fireEvent  } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import userEvent from "@testing-library/user-event"
import firebase from "../__mocks__/firebase"
import Firestore from "../app/Firestore.js"
import { bills } from "../fixtures/bills"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I submit a new bill", () => {
      test("Then I should be redirected to Bills page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const newBillss = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
        const handleSubmit = jest.fn((e) => newBillss.handleSubmit(e))
        formNewBill.addEventListener("submit", handleSubmit)
        fireEvent.submit(formNewBill)

        expect(handleSubmit).toHaveBeenCalled()

        const billsTable = screen.queryByTestId("tbody")
        expect(billsTable).toBeTruthy()
      })
    })

    describe("When I change the file in the file input for a correct format file", () => {
      test("change is detected", ()=> {
        const html = NewBillUI()
        document.body.innerHTML = html

        const file = new File(['hello'], 'hello.png', {type: 'image/png'})
        const fileInput = document.querySelector(`input[data-testid="file"]`)
        const handleChangeFile = jest.fn((e) => e.preventDefault())
        fileInput.addEventListener("change", handleChangeFile)
        userEvent.upload(fileInput, file)

        expect(handleChangeFile).toHaveBeenCalled()
      })
    })

    describe("When I change the file in the file input for a wrong format file", () => {
      test("Then the input is emptied", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const newBillss = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const file = new File(['hello'], 'hello.gif', {type: 'image/gif'})
        const fileInput = document.querySelector(`input[data-testid="file"]`)
        const handleChangeFile = jest.fn((e) => newBillss.handleChangeFile(e)) 
        fileInput.addEventListener("change", handleChangeFile)
        userEvent.upload(fileInput, file)

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.value).toMatch("")
      })
    })
  })
})

//Integration test POST
describe("Given I am connected as an employee", () => {
  describe("When I submit a new bill", () => {
    test("Bill is sent to mock API POST", async () => {
      const bill = {
        "id": "qcCK3SzECmaZAGRrwgtwg",
        "status": "refused",
        "pct": 20,
        "amount": 250,
        "email": "a@a",
        "name": "PostTest",
        "vat": "40",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2002-02-05",
        "commentAdmin": "pas la bonne facture",
        "commentary": "test2",
        "type": "Restaurants et bars",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
      }

      const getSpy = jest.spyOn(firebase, "post")
      const postTest = await firebase.post(bill)

      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(postTest.data.length).toBe(5)
      expect(postTest.data[4].id).toBe("qcCK3SzECmaZAGRrwgtwg")
      expect(postTest.status).toBe(200)
      expect(postTest.message).toBe("New bill sucessfully added")
    })
  })
})