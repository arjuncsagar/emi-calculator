'use client';
import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment/moment';
import {exportToPDF, getFormattedCurrency} from '@/app/helper';
import FileDownloadSharpIcon from '@mui/icons-material/FileDownloadSharp';

const EmiCalculatorForm = () => {
    const {control, handleSubmit} = useForm({
        defaultValues: {
            loanAmount: '0',
            loanTenure: '0',
            interestRate: '0.0',
            startDate: moment(),
            monthlyPrepayment: '0',
            monthlyPrepaymentDate: moment(),
            adjustedEmi: '0'
        }
    });
    const [emiBreakdownList, setEmiBreakdownList] = React.useState([]);

    const onSubmit = (data) => {
        const principal = parseFloat(data.loanAmount);
        const loanTenure = parseInt(data.loanTenure);
        const annualRate = parseFloat(data.interestRate);
        const startDate = moment(data.startDate);
        const prepayments = [];
        const monthlyPrepayment = parseFloat(data.monthlyPrepayment);
        const monthlyPrepaymentDate = moment(data.monthlyPrepaymentDate);
        const adjustedEmi = parseFloat(data.adjustedEmi);
        const emi = adjustedEmi ? adjustedEmi : calculateEMI(principal, annualRate, loanTenure);

        const emiBreakdown = calculateEMIBreakdownWithPrepaymentFixedEMI(
            principal, annualRate, emi, prepayments, startDate,
            monthlyPrepayment, monthlyPrepaymentDate
        );
        setEmiBreakdownList(emiBreakdown);

        console.log('Month\tEMI\t\tInterest\tPrincipal\tRemaining Principal');
        emiBreakdown.forEach(detail => {
            console.log(
                `${detail.month}\t₹${detail.emi}\t₹${detail.interest}\t₹${detail.principal}\t₹${detail.remainingPrincipal}`
            );
        });
    }

    function calculateEMI(principal, annualRate, tenureMonths) {
        // Convert annual interest rate to monthly interest rate
        const monthlyRate = annualRate / (12 * 100);

        // EMI formula
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        return emi.toFixed(2); // Return EMI rounded to 2 decimal places
    }

    function calculateEMIBreakdownWithPrepaymentFixedEMI(principal, annualRate, emi, prepayments = [],
        startDate, monthlyPrepayment, monthlyPrepaymentDate) {
        // Convert annual rate to daily and in decimal
        const dailyRate = annualRate / 365;
        let remainingPrincipal = parseInt(principal, 10);
        let breakdown = [];
        let emiPeriod = getFirstDayOfMonth(startDate);
        //const formattedEmiPeriod = moment(emiPeriod).format('YYYY-MM');

        while (remainingPrincipal > 0) {

            let interestComponent = 0;
            const daysInMonth = emiPeriod.daysInMonth();

            for (let i = 1; i <= daysInMonth; i++) {
                if (startDate.date() === emiPeriod.date()) {
                    remainingPrincipal -= emi;
                }

                // Check for monthly prepayment
                if (monthlyPrepaymentDate.date() === emiPeriod.date() &&
                    monthlyPrepaymentDate.isSameOrBefore(emiPeriod, 'day')) {
                    remainingPrincipal -= monthlyPrepayment;
                }

                // Calculate interest component
                const dailyInterest = parseFloat(((remainingPrincipal * dailyRate) / 100).toFixed(2));
                interestComponent += dailyInterest;
                emiPeriod.add(1, 'day');
            }

            // Calculate principal component
            remainingPrincipal += interestComponent;
            const principalComponent = emi - interestComponent;
            const prepayment = monthlyPrepayment ? parseInt(monthlyPrepayment, 10) : 0;
            const balance = remainingPrincipal > 0 ? Math.round(remainingPrincipal) : 0;

            // Store the breakdown for this month
            breakdown.push({
                month: moment(emiPeriod).clone().subtract(1, 'month').format('MMM YYYY'),
                emi: getFormattedCurrency(parseInt(emi, 10)),
                interest: getFormattedCurrency(interestComponent.toFixed(2)),
                principal: getFormattedCurrency(Math.round(principalComponent)),
                prepayment: getFormattedCurrency(prepayment),
                remainingPrincipal: getFormattedCurrency(balance)
            });

            // Stop if the loan is fully repaid
            if (remainingPrincipal <= 0) {
                break;
            }
        }

        return breakdown;
    }

    const getFirstDayOfMonth = (date) => {
        return moment(date).startOf('month');
    }

    const headers = [
        '#',
        'Month',
        'EMI',
        'Interest',
        'Principal',
        'Prepayment',
        'Balance'
    ];

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h4>Basic Info</h4>
                <section className="basicInfo">
                    <Controller name="loanAmount"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Loan Amount"
                                               type="text"/>}/>
                    <Controller name="loanTenure"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Loan Tenure"
                                               type="text"/>}/>
                    <Controller name="interestRate"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Interest Rate"
                                               type="text"/>}/>
                    <Controller name="startDate"
                                control={control}
                                render={({field}) =>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker {...field}
                                                    label="Start Date"/>
                                    </LocalizationProvider>}/>
                    <Controller name="adjustedEmi"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Adjust EMI"
                                               type="text"/>}/>
                </section>
                <h4>Prepayment</h4>
                <section className="prepayment">
                    <div className="monthlyPrepayment">
                        <h6>Monthly Prepayment</h6>
                        <Controller name="monthlyPrepayment"
                                    control={control}
                                    render={({field}) =>
                                        <TextField {...field}
                                                   label="Amount"
                                                   type="text"/>}/>
                        <Controller name="monthlyPrepaymentDate"
                                    control={control}
                                    render={({field}) =>
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DatePicker {...field}
                                                        label="Start Date"/>
                                        </LocalizationProvider>}/>
                    </div>
                </section>
                <section className="button">
                    <Button type="submit" variant="contained">Calculate</Button>
                </section>
            </form>
            {emiBreakdownList.length > 0 && <section className="table-section">
                <div className="table-header-div">
                    <section>
                        <h4>EMI Breakdown</h4>
                    </section>
                    <section>
                        <Button variant="contained"
                                color="primary"
                                startIcon={<FileDownloadSharpIcon/>}
                                onClick={() => exportToPDF(emiBreakdownList, headers)}>
                            Export to PDF
                        </Button>
                    </section>
                </div>
                <div>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {headers.map((header, ix) =>
                                        <TableCell key={ix}>{header}</TableCell>)}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {emiBreakdownList.map((detail, ix) => (
                                    <TableRow key={`${ix}-${detail.month}`}>
                                        <TableCell>{++ix}</TableCell>
                                        {Object.values(detail).map((value, ix) =>
                                            <TableCell key={`${value}-${ix}`}>{value}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </section>}
        </>
    );
};

export default EmiCalculatorForm;