'use client';
import './index.scss';
import {ThemeProvider} from '@mui/material';
import {createTheme} from '@mui/material/styles';
import EmiCalculatorForm from '@/app/EmiCalculatorForm';

const themeOptions = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2',
            contrastText: '#b7d4f6'
        },
        secondary: {
            main: '#f50057'
        },
        text: {
            primary: '#b7d4f6'
        },
        background: {
            default: '#0f172a',
            paper: '#050f27'
        }
    }
});

export default function Home() {
    return (
        <ThemeProvider theme={themeOptions}>
            <div className="container">
                <header className="app-header">
                    <h1>Emi Calculator with Prepayments</h1>
                </header>
                <main>
                    <EmiCalculatorForm/>
                </main>
            </div>
        </ThemeProvider>);
}
