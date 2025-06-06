import logo from './assets/logo.svg'
import './App.css'
import { DateTimeDisplay } from './components/DateTimeDisplay'

function App() {
    return (
        <div className="content">
            <div className="logo">
                <a href="https://aws.amazon.com" target="_blank">
                    <img src={logo} className="logo" width={80} alt="AWS logo" />
                </a>
            </div>
            <h1>🎉 Congratulations</h1>
            <p className="read-the-docs">
                You've got yourself a web application!<br/>The date and time displayed below is fetched from the API.
            </p>
            <DateTimeDisplay />
        </div>
    )
}

export default App
