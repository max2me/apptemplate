import logo from './assets/logo.svg'
import './App.css'

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
                You've got yourself a website. This is just the beginning of your cloud journey. Take a moment to celebrate – you've accomplished something great!
            </p>
        </div>
    )
}

export default App
