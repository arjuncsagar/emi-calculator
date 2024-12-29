import './index.scss';

export default function Home() {
    return (<div className="container">
        <header>
            <h1 className="app-header">Emi Calculator with Prepayments</h1>
        </header>
        <main>
            <label htmlFor="loanAmount">Loan Amount</label>
            <input type="number" id="loanAmount" name="loanAmount" placeholder="Enter Loan Amount"/>
        </main>
    </div>);
}
